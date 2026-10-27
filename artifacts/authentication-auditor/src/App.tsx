import { useMemo, useRef, useState, useEffect, type ReactNode, type ChangeEvent, type DragEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  analyzeFiles,
  MAX_SOURCE_FILES,
  MAX_TOTAL_SOURCE_BYTES,
  toJsonReport,
  toMarkdownReport,
  type AuditFinding,
  type AuditResult,
  type SourceFile,
} from '@/lib/audit-engine';
import { demoFiles } from '@/lib/demo-fixtures';
import {
  Activity, AlertCircle, ArrowDownToLine, Check, CircleHelp,
  Code2, FileCode2, FolderOpen, LockKeyhole, Search, ShieldCheck, Sparkles,
  X, XCircle,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const supported = /\.(js|jsx|mjs|cjs|ts|tsx|mts|cts|py)$/i;

function Home() {
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<AuditFinding | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const filteredFindings = useMemo(() => {
    const findings = result?.findings ?? [];
    const needle = query.trim().toLowerCase();
    return findings.filter((finding) => {
      const matchesSearch = !needle || [
        finding.title, finding.category, finding.file, finding.summary, finding.ruleId,
      ].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch
        && (severity === 'all' || finding.severity === severity)
        && (status === 'all' || finding.status === status);
    });
  }, [result, query, severity, status]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  async function readSelectedFiles(list: FileList | File[]) {
    setError('');
    const accepted = Array.from(list).filter((file) => supported.test(file.name));
    if (!accepted.length) {
      setError('No supported source files found. Choose JavaScript, TypeScript, or Python files.');
      return;
    }
    if (accepted.length > MAX_SOURCE_FILES) {
      setError(`Choose no more than ${MAX_SOURCE_FILES} source files at a time.`);
      return;
    }
    const totalBytes = accepted.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_TOTAL_SOURCE_BYTES) {
      setError('The selected source exceeds the 8 MB analysis limit.');
      return;
    }
    setBusy(true);
    try {
      const loaded = await Promise.all(accepted.map(async (file) => ({
        name: file.webkitRelativePath || file.name,
        content: await file.text(),
      })));
      setFiles(loaded);
      setResult(null);
      setSelected(null);
      setQuery('');
    } catch {
      setError('Some files could not be read. Check access to the selected files and try again.');
    } finally {
      setBusy(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void readSelectedFiles(event.target.files);
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void readSelectedFiles(event.dataTransfer.files);
  }

  function runAnalysis() {
    if (!files.length || busy) return;
    setError('');
    setBusy(true);
    setSelected(null);
    // The supplied audit engine runs synchronously against in-memory source text only.
    window.setTimeout(() => {
      try {
        setResult(analyzeFiles(files));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The local analysis could not complete. Review the selected files and try again.');
      } finally {
        setBusy(false);
      }
    }, 80);
  }

  function loadDemo() {
    setFiles(demoFiles);
    setResult(null);
    setSelected(null);
    setQuery('');
    setError('');
  }

  function clearSession() {
    setFiles([]);
    setResult(null);
    setSelected(null);
    setQuery('');
    setSeverity('all');
    setStatus('all');
    setError('');
    if (fileInput.current) fileInput.current.value = '';
  }

  function exportReport(format: 'json' | 'md') {
    if (!result) return;
    const payload = format === 'json' ? toJsonReport(result) : toMarkdownReport(result);
    const blob = new Blob([payload], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `authentication-audit.${format === 'md' ? 'md' : 'json'}`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div className="brand-mark" aria-hidden="true"><ShieldCheck size={18} strokeWidth={2} /></div>
          <div className="brand-name">Authentication Auditor</div>
        </div>
        <div className="top-note">LOCAL REVIEW WORKBENCH <span style={{ padding: '0 8px', opacity: .45 }}>/</span> V 0.1</div>
      </header>

      <main className="main-wrap">
        <div className="eyebrow">A careful pass over auth code</div>
        <h1 className="hero-title">Understand what your authentication code is doing.</h1>
        <p className="hero-copy">
          A private, local-first workbench for reviewing authentication flows. Static findings are useful leads for human review—not a verdict on exploitability.
        </p>

        <div className="privacy-strip" role="note" data-testid="notice-local-privacy">
          <LockKeyhole size={17} style={{ flex: '0 0 auto', marginTop: 1 }} aria-hidden="true" />
          <div><strong>Your code stays here.</strong> Files are analyzed in this browser tab, never executed, and never sent to a server or live target. Source and findings remain in current-tab memory only.</div>
        </div>

        <section className="panel upload-panel" aria-labelledby="source-heading">
          <div className="section-head">
            <div>
              <h2 id="source-heading" className="section-title">Choose source to review</h2>
              <p className="section-caption">JavaScript, TypeScript, and Python source files. No project upload or network connection.</p>
            </div>
            {files.length > 0 && <div className="status-bar"><span className="status-led" />{files.length} file{files.length === 1 ? '' : 's'} ready</div>}
          </div>
          <div
            className={`dropzone${dragging ? ' dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            data-testid="dropzone-source-files"
          >
            <div>
              <div className="drop-icon"><FolderOpen size={19} aria-hidden="true" /></div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Select files or a folder</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11, marginTop: 4 }}>or drop source files here</div>
              <div className="action-row" style={{ justifyContent: 'center', marginTop: 12 }}>
                <button type="button" className="btn btn-small" onClick={() => fileInput.current?.click()} data-testid="button-choose-files"><FileCode2 size={14} />Choose files</button>
                <button type="button" className="btn btn-small" onClick={() => {
                  const folderInput = document.getElementById('folder-source-input') as HTMLInputElement | null;
                  folderInput?.click();
                }} data-testid="button-choose-folder"><FolderOpen size={14} />Choose folder</button>
              </div>
            </div>
          </div>
          <input ref={fileInput} type="file" multiple accept=".js,.jsx,.mjs,.cjs,.ts,.tsx,.mts,.cts,.py" onChange={onFileChange} aria-label="Choose JavaScript, TypeScript, or Python source files" data-testid="input-source-files" style={{ display: 'none' }} />
          <input id="folder-source-input" type="file" multiple accept=".js,.jsx,.mjs,.cjs,.ts,.tsx,.mts,.cts,.py" onChange={onFileChange} ref={(node) => node?.setAttribute('webkitdirectory', '')} aria-label="Choose a source folder" data-testid="input-source-folder" style={{ display: 'none' }} />

          {files.length > 0 && (
            <div className="file-list" aria-label="Selected source files">
              {files.slice(0, 5).map((file, index) => (
                <div className="file-row" key={`${file.name}-${index}`} data-testid={`file-row-${index}`}>
                  <Code2 size={14} color="hsl(var(--primary))" aria-hidden="true" />
                  <span className="file-name">{file.name}</span>
                  <span className="file-meta">{file.content.length.toLocaleString()} chars</span>
                </div>
              ))}
              {files.length > 5 && <div className="section-caption">and {files.length - 5} more supported files</div>}
            </div>
          )}
          {error && <div className="error-box" role="alert" data-testid="status-audit-error"><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{error}</div>}
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={runAnalysis} disabled={!files.length || busy} data-testid="button-run-analysis">
              {busy ? <Activity size={15} className="spin-icon" /> : <ShieldCheck size={15} />}
              {busy ? 'Analyzing locally…' : 'Run local analysis'}
            </button>
            <button type="button" className="btn" onClick={loadDemo} disabled={busy} data-testid="button-load-demo"><Sparkles size={14} />Load demo source</button>
            {files.length > 0 && <button type="button" className="btn btn-quiet" onClick={clearSession} disabled={busy} data-testid="button-clear-session"><XCircle size={14} />Clear session</button>}
            <div style={{ marginLeft: 'auto', color: 'hsl(var(--muted-foreground))', fontSize: 10 }}>Demo loads example source only; run analysis to see actual engine output.</div>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="panel results-panel" aria-labelledby="findings-heading">
            <div className="section-head">
              <div>
                <div className="eyebrow">Review workspace</div>
                <h2 id="findings-heading" className="section-title" style={{ marginTop: 5 }}>Findings</h2>
                <p className="section-caption">Review each lead in context. Confidence and review status are kept distinct.</p>
              </div>
              {result && <div className="action-row" style={{ marginTop: 0 }}>
                <button className="btn btn-small" type="button" onClick={() => exportReport('md')} data-testid="button-export-markdown"><ArrowDownToLine size={13} />Markdown</button>
                <button className="btn btn-small" type="button" onClick={() => exportReport('json')} data-testid="button-export-json"><ArrowDownToLine size={13} />JSON</button>
              </div>}
            </div>
            {result && (
              <div className="results-toolbar">
                <label className="search-wrap">
                  <Search size={14} aria-hidden="true" />
                  <input className="control-input" type="search" placeholder="Search findings…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search findings" data-testid="input-search-findings" />
                </label>
                <select className="control-select" value={severity} onChange={(event) => setSeverity(event.target.value)} aria-label="Filter by severity" data-testid="select-filter-severity">
                  <option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Info</option>
                </select>
                <select className="control-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by review status" data-testid="select-filter-status">
                  <option value="all">All review states</option><option value="likely">Likely</option><option value="needs_human_review">Needs human review</option>
                </select>
              </div>
            )}

            {!result ? (
              <div className="empty-state" data-testid="empty-findings"><div><div className="drop-icon"><Search size={17} /></div><strong>No review results yet</strong>Select source files and run local analysis. Nothing is scanned until you choose to begin.</div></div>
            ) : filteredFindings.length === 0 ? (
              <div className="empty-state" data-testid="empty-filtered-findings"><div><strong>{result.findings.length === 0 ? 'No findings returned' : 'No matching findings'}</strong>{result.findings.length === 0 ? 'The analysis returned no findings for this input. This is not proof that the code is secure.' : 'Try a different search term or filter.'}</div></div>
            ) : (
              <div className="finding-list" aria-live="polite" data-testid="list-findings">
                {filteredFindings.map((finding) => (
                  <button type="button" className={`finding-row${selected?.id === finding.id ? ' selected' : ''}`} key={finding.id} onClick={() => setSelected(finding)} data-testid={`button-finding-${finding.id}`}>
                    <div className="finding-top">
                      <span className="finding-title">{finding.title}</span>
                      <span className={`severity severity-${finding.severity}`}>{finding.severity}</span>
                    </div>
                    <div className="finding-sub">
                      <span>{finding.file}:{finding.line}</span><span>·</span><span>{finding.category}</span>
                      <span className="confidence-pill">{finding.confidence} confidence</span>
                      <span className="status-pill">{finding.status === 'likely' ? 'Likely' : 'Needs human review'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {result && <div className="footer-note"><CircleHelp size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Static analysis can miss context and produce false positives. Verify every lead with a reviewer and the surrounding code.</div>}
          </section>

          <aside className="side-stack" aria-label="Audit summary and authentication inventory">
            <section className="panel summary-panel" aria-labelledby="summary-heading">
              <div className="eyebrow">Run summary</div>
              <h2 id="summary-heading" className="section-title" style={{ marginTop: 5 }}>At a glance</h2>
              {result ? <>
                <div className="metrics-grid">
                  <Metric value={result.summary.filesScanned} label="Files scanned" />
                  <Metric value={result.summary.authFiles} label="Auth files" />
                  <Metric value={result.summary.findings} label="Findings" />
                  <Metric value={result.inventory.length} label="Inventory items" />
                </div>
                <div className="summary-foot">Completed {formatDate(result.summary.completedAt)}</div>
              </> : <div className="section-caption" style={{ marginTop: 12 }}>Run analysis to see a summary. No report history is kept.</div>}
            </section>
            <section className="panel inventory-panel" aria-labelledby="inventory-heading">
              <div className="eyebrow">Observed in source</div>
              <h2 id="inventory-heading" className="section-title" style={{ marginTop: 5 }}>Authentication inventory</h2>
              {!result ? <div className="section-caption" style={{ marginTop: 10 }}>Inventory appears after a local analysis run.</div> : result.inventory.length === 0 ? (
                <div className="section-caption" style={{ marginTop: 10 }}>No inventory items returned. Absence from this inventory does not establish absence from the project.</div>
              ) : <div className="inventory-list">
                {result.inventory.map((item, index) => <div className="inventory-item" key={`${item.file}:${item.line}:${index}`} data-testid={`inventory-item-${index}`}>
                  <span className="inventory-dot" aria-hidden="true" />
                  <div><div className="inventory-label">{item.label}</div><div className="inventory-detail">{item.detail}</div><div className="inventory-location">{item.category} · {item.file}:{item.line}</div></div>
                </div>)}
              </div>}
            </section>
          </aside>
        </div>
        <p className="footer-note" style={{ maxWidth: 760 }}><Check size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Analysis is static and local. This workbench does not execute source, contact a live target, handle credentials, or retain source or results after this tab is closed.</p>
      </main>

      {selected && <div className="detail-drawer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title" data-testid="panel-finding-detail">
          <div className="detail-header">
            <div>
              <div className="eyebrow">Static analysis lead</div>
              <h2 className="detail-title" id="detail-title">{selected.title}</h2>
              <div className="detail-meta">{selected.ruleId} · {selected.file}:{selected.line}</div>
            </div>
            <button className="btn btn-small" type="button" onClick={() => setSelected(null)} aria-label="Close finding details" data-testid="button-close-detail"><X size={15} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            <span className={`severity severity-${selected.severity}`}>{selected.severity} severity</span>
            <span className="confidence-pill">{selected.confidence} confidence</span>
            <span className="status-pill">{selected.status === 'likely' ? 'Likely' : 'Needs human review'}</span>
          </div>
          <div className="detail-section"><h3>What was observed</h3><p>{selected.summary}</p></div>
          <div className="detail-section"><h3>Evidence · {selected.file}:{selected.line}</h3><pre className="evidence">{selected.evidence}</pre></div>
          <div className="detail-section"><h3>Expected behavior</h3><p>{selected.expectedBehavior}</p></div>
          <div className="detail-section"><h3>Suggested remediation</h3><p>{selected.remediation}</p></div>
          <div className="detail-section"><h3>Regression test idea</h3><p>{selected.regressionTest}</p></div>
          <div className="detail-section"><h3>Limitations</h3><p>{selected.limitations}</p></div>
          <p className="footer-note">A static finding is a review lead, not proof of exploitability. Validate it against application context and surrounding code.</p>
        </section>
      </div>}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div className="metric" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="metric-value">{value}</div><div className="metric-label">{label}</div></div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
