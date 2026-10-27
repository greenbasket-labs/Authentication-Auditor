import asset0 from "./assets/lp-09-hero.png";
import asset1 from "./assets/lp-09-prop1.png";
import asset2 from "./assets/lp-09-prop2.png";

import React from 'react';
import { Search, MapPin, Home, DollarSign, Star } from 'lucide-react';

const Lp09 = () => {
  return (
    <div style={{ width: '1280px', height: '900px', overflow: 'hidden' }} className="relative bg-[#FAF9F6] text-stone-900 font-['Plus_Jakarta_Sans'] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-16 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 text-[#FAF9F6] flex items-center justify-center rounded-full font-['Playfair_Display'] italic text-xl">H</div>
          <span className="text-2xl font-['Playfair_Display'] font-semibold tracking-wide">Haven</span>
        </div>
        <div className="flex items-center gap-10 text-sm font-medium text-stone-500">
          <a href="#" className="text-stone-900 transition-colors">Properties</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Neighborhoods</a>
          <a href="#" className="hover:text-stone-900 transition-colors">Agents</a>
          <a href="#" className="hover:text-stone-900 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-stone-600 hover:text-stone-900 transition-colors">Sign In</a>
          <button className="bg-stone-900 text-[#FAF9F6] px-6 py-3 rounded-full hover:bg-stone-800 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex px-16 pb-16 pt-6 gap-12 relative z-10 h-full">
        {/* Left Column */}
        <div className="w-[55%] flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white/50 backdrop-blur-sm w-fit mb-8 shadow-sm">
            <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span className="text-xs font-bold tracking-widest uppercase text-stone-800">Premium Real Estate</span>
          </div>
          
          <h1 className="text-[72px] leading-[1.05] font-['Playfair_Display'] font-medium mb-6 text-stone-900 tracking-tight">
            Find your <span className="text-stone-500">modern</span> sanctuary.
          </h1>
          
          <p className="text-lg text-stone-500 mb-12 max-w-[500px] leading-relaxed">
            Discover handpicked architectural homes and contemporary spaces designed for the way you live. Exclusive listings you won't find anywhere else.
          </p>

          {/* Search Box */}
          <div className="bg-white p-3 rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-stone-100 flex items-center gap-2 w-full max-w-[600px]">
            <div className="flex-1 flex items-center gap-3 px-5 border-r border-stone-100">
              <MapPin className="w-5 h-5 text-stone-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Location</span>
                <input type="text" placeholder="Los Angeles, CA" className="text-sm font-semibold bg-transparent outline-none placeholder:text-stone-800 w-full" />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-5 border-r border-stone-100">
              <Home className="w-5 h-5 text-stone-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Type</span>
                <select className="text-sm font-semibold bg-transparent outline-none cursor-pointer appearance-none text-stone-900">
                  <option>Modern Villa</option>
                  <option>Penthouse</option>
                  <option>Estate</option>
                </select>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3 px-5">
              <DollarSign className="w-5 h-5 text-stone-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Price</span>
                <select className="text-sm font-semibold bg-transparent outline-none cursor-pointer appearance-none text-stone-900">
                  <option>$2M - $5M</option>
                  <option>$5M - $10M</option>
                  <option>$10M+</option>
                </select>
              </div>
            </div>
            <button className="bg-stone-900 text-white p-4 rounded-full hover:bg-stone-800 transition-colors flex-shrink-0 ml-2 shadow-md">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-14 mt-16 pt-12 border-t border-stone-200">
            <div>
              <div className="text-3xl font-['Playfair_Display'] font-semibold text-stone-900">$2B+</div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-2">In Sales</div>
            </div>
            <div>
              <div className="text-3xl font-['Playfair_Display'] font-semibold text-stone-900">500+</div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-2">Curated Homes</div>
            </div>
            <div>
              <div className="text-3xl font-['Playfair_Display'] font-semibold text-stone-900">4.9/5</div>
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-2">Client Rating</div>
            </div>
          </div>
        </div>

        {/* Right Column / Hero Image */}
        <div className="w-[45%] relative h-[90%] my-auto">
          <div className="absolute inset-0 rounded-[40px] rounded-br-[120px] overflow-hidden shadow-2xl">
            <img src={asset0} alt="Modern home exterior" className="w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 border border-black/5 rounded-[40px] rounded-br-[120px] pointer-events-none"></div>
          </div>
          
          {/* Floating Property Card 1 */}
          <div className="absolute top-16 -left-10 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-4 w-[280px] border border-white">
            <img src={asset1} alt="Interior" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
            <div>
              <div className="text-sm font-bold text-stone-900">Beverly Hills Estate</div>
              <div className="text-xs font-medium text-stone-500 mt-0.5">4 Beds • 5 Baths</div>
              <div className="text-sm font-bold text-stone-800 mt-1">$4,500,000</div>
            </div>
          </div>

          {/* Floating Property Card 2 */}
          <div className="absolute bottom-16 -right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center gap-4 w-[280px] border border-white">
            <img src={asset2} alt="Kitchen" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
            <div>
              <div className="text-sm font-bold text-stone-900">West Hollywood</div>
              <div className="text-xs font-medium text-stone-500 mt-0.5">3 Beds • 3.5 Baths</div>
              <div className="text-sm font-bold text-stone-800 mt-1">$3,200,000</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-stone-200/40 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#E8E6DF] rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
    </div>
  );
};

export { Lp09 as "lp-09" };
export default Lp09;
