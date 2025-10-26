import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const glow = document.getElementById("parallaxGlow");
    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 25;
      const y = (e.clientY / window.innerHeight - 0.5) * 25;
      if (glow) glow.style.transform = `translate(${x}px, ${y}px)`;
    };
    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, []);

  const back = Array.from({ length: 40 });
  const front = Array.from({ length: 60 });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Parallax Glow */}
      <div
        id="parallaxGlow"
        className="absolute w-[800px] h-[800px] rounded-full blur-[180px] bg-gradient-radial from-[#00E8C8]/40 via-[#00FFA3]/20 to-transparent transition-transform duration-300 ease-out z-0"
      />

      {/* Particles */}
      <div className="absolute inset-0 z-0">
        {back.map((_, i) => (
          <div
            key={`b-${i}`}
            className="absolute w-[2px] h-[2px] bg-[#00E8C8]/30 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${10 + Math.random() * 8}s`,
            }}
          />
        ))}
        {front.map((_, i) => (
          <div
            key={`f-${i}`}
            className="absolute w-[3px] h-[3px] bg-[#00FFA3] rounded-full animate-float opacity-90"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <main className="z-20 max-w-3xl px-6 relative">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#00FFA3] via-[#00E8C8] to-[#00FFA3] bg-clip-text text-transparent mb-6 neon-text">
          Dronox Core Escrow Network
        </h1>
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 neon-text">
          Secure peer-to-peer NFT and token trades powered by Kaspa escrow.
          Create offers, trade safely, or list NFTs for sale or swap.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 z-30 relative">
          <a href="/marketplace" className="btn-neon px-10 py-3 font-semibold relative z-30">
            View Marketplace
          </a>
          <a href="/create" className="btn-neon px-10 py-3 font-semibold border-[#00FFA3] text-[#00FFA3] relative z-30">
            Create Listing
          </a>
        </div>
      </main>
    </div>
  );
}
