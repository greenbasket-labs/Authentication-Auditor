import asset0 from "./assets/pos-43-mic.png";

import React from "react";

export default function ComedyShow() {
  return (
    <div
      style={{ width: "700px", height: "900px" }}
      className="relative bg-[#FFDD00] text-black overflow-hidden flex flex-col justify-between p-12 border-[16px] border-black"
    >
      {/* Halftone / Noise Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* Radial Halftone-like Gradient */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.8) 100%)",
        backgroundSize: "20px 20px",
        backgroundImage: "radial-gradient(circle at center, black 2px, transparent 2.5px)",
      }}></div>
      
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#FFDD00] mix-blend-screen"></div>

      {/* Header */}
      <div className="z-10 text-center mt-4">
        <h2 className="font-['Space_Mono'] font-bold text-2xl uppercase tracking-[0.2em] mb-2 px-4 py-1 bg-black text-[#FFDD00] inline-block -rotate-2">
          One Night Only
        </h2>
        <h1 className="font-['Bricolage_Grotesque'] font-black text-[110px] uppercase leading-[0.85] tracking-tighter mt-4" style={{ WebkitTextStroke: "4px black", color: "#FFDD00", textShadow: "8px 8px 0px black" }}>
          LAUGH<br />RIOT!
        </h1>
      </div>

      {/* Main Visual */}
      <div className="z-10 flex-1 flex items-center justify-center relative w-full my-6">
        <div className="w-[380px] h-[380px] rounded-full border-[12px] border-black bg-black overflow-hidden relative shadow-[12px_12px_0px_rgba(0,0,0,1)] flex items-center justify-center group hover:scale-105 transition-transform duration-300">
           {/* Fallback pattern if image isn't loaded yet */}
           <div className="absolute inset-0 bg-[#FFDD00] opacity-50" style={{
               backgroundImage: "radial-gradient(circle at center, black 4px, transparent 5px)",
               backgroundSize: "16px 16px"
           }}></div>
           <img 
             src={asset0} 
             alt="Retro Microphone" 
             className="w-full h-full object-cover relative z-10 mix-blend-hard-light"
           />
        </div>
        
        {/* Decorative elements */}
        <svg className="absolute top-[20%] left-[5%] w-20 h-20 text-black animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
        </svg>
        <svg className="absolute bottom-[20%] right-[5%] w-16 h-16 text-black animate-[pulse_2s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
        </svg>
      </div>

      {/* Footer Details */}
      <div className="z-10 w-full bg-black text-[#FFDD00] p-6 border-t-[8px] border-black -mx-12 px-12 -mb-12 rotate-2 transform-origin-bottom pb-16">
        <div className="font-['Space_Mono'] text-center -rotate-2">
            <p className="font-bold text-3xl uppercase tracking-widest mb-3 text-white">The Basement Lounge</p>
            <div className="flex justify-between items-center border-t-4 border-dashed border-[#FFDD00] pt-4">
                <div className="text-left">
                    <span className="block text-xl font-bold">FRIDAY, OCT 13</span>
                    <span className="block text-lg">Doors @ 8:00 PM</span>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-bold">$25 COVER</span>
                    <span className="block text-lg">2 Drink Minimum</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
