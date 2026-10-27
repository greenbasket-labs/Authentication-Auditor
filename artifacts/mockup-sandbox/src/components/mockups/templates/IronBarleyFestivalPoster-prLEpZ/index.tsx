import asset0 from "./assets/pos-36-hero.png";

import React from 'react';

export default function CraftBeerFest() {
  return (
    <div 
      style={{ width: "700px", height: "900px" }}
      className="relative overflow-hidden bg-[#F5E6CC] text-[#3D2314] flex flex-col items-center p-8"
    >
      {/* Noise Texture */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-multiply z-50">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Decorative Border */}
      <div className="absolute inset-4 border-[6px] border-[#A64B29] rounded-sm pointer-events-none" />
      <div className="absolute inset-6 border-[2px] border-[#A64B29] rounded-sm pointer-events-none" />

      {/* Hop Illustrations in Corners */}
      <svg className="absolute top-8 left-8 w-32 h-32 text-[#5E6C3F] opacity-40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M20,20 Q50,0 70,20 T90,60 Q70,90 30,70 T20,20 Z" />
        <path d="M50,30 Q60,10 90,20" stroke="currentColor" fill="none" strokeWidth="3"/>
        <path d="M30,50 Q10,60 20,90" stroke="currentColor" fill="none" strokeWidth="3"/>
        <circle cx="50" cy="50" r="5" fill="#F5E6CC" />
      </svg>
      <svg className="absolute top-8 right-8 w-32 h-32 text-[#5E6C3F] opacity-40 transform scale-x-[-1]" viewBox="0 0 100 100" fill="currentColor">
        <path d="M20,20 Q50,0 70,20 T90,60 Q70,90 30,70 T20,20 Z" />
        <path d="M50,30 Q60,10 90,20" stroke="currentColor" fill="none" strokeWidth="3"/>
        <path d="M30,50 Q10,60 20,90" stroke="currentColor" fill="none" strokeWidth="3"/>
        <circle cx="50" cy="50" r="5" fill="#F5E6CC" />
      </svg>
      <svg className="absolute bottom-8 left-8 w-32 h-32 text-[#5E6C3F] opacity-40 transform scale-y-[-1]" viewBox="0 0 100 100" fill="currentColor">
        <path d="M20,20 Q50,0 70,20 T90,60 Q70,90 30,70 T20,20 Z" />
        <path d="M50,30 Q60,10 90,20" stroke="currentColor" fill="none" strokeWidth="3"/>
        <path d="M30,50 Q10,60 20,90" stroke="currentColor" fill="none" strokeWidth="3"/>
        <circle cx="50" cy="50" r="5" fill="#F5E6CC" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-32 h-32 text-[#5E6C3F] opacity-40 transform scale-[-1]" viewBox="0 0 100 100" fill="currentColor">
        <path d="M20,20 Q50,0 70,20 T90,60 Q70,90 30,70 T20,20 Z" />
        <path d="M50,30 Q60,10 90,20" stroke="currentColor" fill="none" strokeWidth="3"/>
        <path d="M30,50 Q10,60 20,90" stroke="currentColor" fill="none" strokeWidth="3"/>
        <circle cx="50" cy="50" r="5" fill="#F5E6CC" />
      </svg>

      <div className="flex flex-col items-center justify-between w-full h-full relative z-10 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[3px] w-16 bg-[#3D2314]" />
            <span className="font-['Space_Mono'] uppercase tracking-[0.4em] text-[#3D2314] font-bold text-sm">Est. 2012</span>
            <div className="h-[3px] w-16 bg-[#3D2314]" />
          </div>
          
          <h1 className="text-[7rem] font-black uppercase text-center leading-[0.85] font-['Bricolage_Grotesque'] text-[#3D2314] tracking-tight drop-shadow-sm">
            Iron &amp; <br />
            <span className="text-[#A64B29]">Barley</span>
          </h1>
          
          <div className="bg-[#3D2314] text-[#F5E6CC] px-8 py-3 mt-8 rounded-sm shadow-xl rotate-[-3deg] border-2 border-[#F5E6CC] outline outline-2 outline-[#3D2314]">
            <h2 className="font-['Fraunces'] italic text-4xl font-bold tracking-wide">
              Craft Beer Festival
            </h2>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center my-6">
          <div className="absolute inset-0 bg-[#DE8F4A] opacity-20 rounded-full blur-[40px]" />
          <img 
            src={asset0} 
            alt="Rustic beer stein"
            className="w-full h-full object-contain relative z-10 mix-blend-multiply filter contrast-125 sepia-[0.3]"
          />
        </div>

        {/* Info Grid */}
        <div className="w-full px-10 mt-2">
          <div className="grid grid-cols-3 border-y-[6px] border-[#3D2314] py-5 items-center bg-[#F5E6CC]/50 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center px-4">
              <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-[0.2em] text-[#A64B29] mb-1">When</span>
              <span className="font-['Bricolage_Grotesque'] font-black text-[2.5rem] text-[#3D2314] leading-none">NOV<br/>12-13</span>
            </div>
            
            <div className="flex flex-col items-center text-center px-4 border-x-[4px] border-[#3D2314]">
              <svg className="w-10 h-10 text-[#A64B29] mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="font-['Bricolage_Grotesque'] font-black text-xl text-[#3D2314] uppercase leading-tight">
                Heritage<br/>Square
              </span>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-[0.2em] text-[#A64B29] mb-1">Time</span>
              <span className="font-['Bricolage_Grotesque'] font-black text-[2.5rem] text-[#3D2314] leading-none">12PM<br/>10PM</span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col items-center w-full px-12 mt-8 text-center bg-[#F5E6CC]/80">
          <p className="font-['Fraunces'] text-xl text-[#3D2314] font-semibold leading-snug mb-8 max-w-[500px]">
            Featuring 40+ local breweries, live bluegrass, wood-fired barbecue, and artisan craft vendors.
          </p>
          
          <div className="w-full flex items-center justify-between px-4">
            <span className="font-['Space_Mono'] text-[#A64B29] font-bold uppercase tracking-[0.15em] text-xs">
              21+ Only
            </span>
            <span className="font-['Bricolage_Grotesque'] text-[#3D2314] font-black uppercase text-2xl border-b-[3px] border-[#A64B29] pb-1">
              IronAndBarley.com
            </span>
            <span className="font-['Space_Mono'] text-[#A64B29] font-bold uppercase tracking-[0.15em] text-xs">
              Rain or Shine
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
