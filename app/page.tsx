import ChipScroll from "@/components/ChipScroll";

export default function Home() {
  return (
    <main className="relative bg-[#0a0a0a] min-h-screen">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          <span className="text-sm font-semibold tracking-[0.15em] text-white/80 uppercase">
            Tirth Joshi
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors duration-300"
          >
            Technology
          </a>
          <a
            href="#"
            className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors duration-300"
          >
            Specs
          </a>
          <a
            href="#"
            className="text-xs tracking-[0.2em] uppercase text-white/40 hover:text-white/80 transition-colors duration-300"
          >
            Developers
          </a>
          <a
            href="#"
            className="text-xs tracking-[0.15em] uppercase px-5 py-2 rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* ── Scroll Animation ── */}
      <ChipScroll />

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          {/* Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { label: "Parameters", value: "256B" },
              { label: "Process Node", value: "3nm" },
              { label: "TDP", value: "350W" },
              { label: "Memory", value: "192GB HBM3e" },
            ].map((spec) => (
              <div key={spec.label} className="text-center">
                <p className="text-2xl md:text-4xl font-bold text-white/90 tracking-tight">
                  {spec.value}
                </p>
                <p className="mt-2 text-xs tracking-[0.25em] uppercase text-white/30">
                  {spec.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
              <span className="text-xs tracking-[0.15em] text-white/30 uppercase">
                Tirth Joshi
              </span>
            </div>
            <p className="text-xs text-white/20">
              © 2026 Tirth Joshi. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
