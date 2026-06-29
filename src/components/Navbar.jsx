import { useState, useEffect } from "react";
import { Cpu, ChevronRight, Menu, X } from "lucide-react";

export default function Navbar({ currentView, setView }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    if (currentView !== "landing") {
      setView("landing");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleCTAClick = () => {
    if (currentView === "dashboard") {
      setView("landing");
    } else {
      setView("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || currentView === "dashboard"
          ? "py-3 bg-[#070913]/90 border-b border-[#242F4D]/55 shadow-[0_4px_30px_rgba(0,240,255,0.03)] backdrop-blur-md"
          : "py-5 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => {
            setView("dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 group-hover:border-brand-cyan group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300">
            <Cpu className="w-5 h-5 text-brand-cyan animate-pulse" />
            <div className="absolute inset-0 rounded-lg bg-brand-cyan/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="font-sans font-extrabold text-xl tracking-wider text-white">
                DataDiction
              </span>
              <span className="font-mono text-xs font-semibold text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20">
                CueVIC
              </span>
            </div>
            <p className="text-[9px] tracking-widest uppercase text-gray-500 font-mono">
              AI MultiModal Studio
            </p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {[
            { id: "problem", label: "기존의 한계" },
            { id: "pipeline", label: "핵심 기술" },
            { id: "preview", label: "콘솔 미리보기" },
            { id: "positioning", label: "연동 및 가치" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium text-gray-400 hover:text-brand-cyan hover:cyan-neon-glow transition-all duration-200 cursor-pointer relative py-1 group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-cyan group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <button
            onClick={handleCTAClick}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-bold text-white rounded-lg group bg-gradient-to-br from-brand-cyan to-brand-purple group-hover:from-brand-cyan group-hover:to-brand-purple hover:text-white focus:ring-2 focus:outline-none focus:ring-brand-cyan/50 cursor-pointer"
          >
            <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-[#0D0E12] rounded-md group-hover:bg-opacity-0 flex items-center space-x-1">
              <span>{currentView === "dashboard" ? "소개 홈페이지" : "사내 입찰 현황판"}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-45 w-64 bg-[#070913]/95 border-l border-[#242F4D]/50 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col pt-24 px-6 space-y-6">
          {[
            { id: "problem", label: "기존의 한계" },
            { id: "pipeline", label: "핵심 기술" },
            { id: "preview", label: "콘솔 미리보기" },
            { id: "positioning", label: "연동 및 가치" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-left text-base font-semibold text-gray-300 hover:text-brand-cyan py-2 border-b border-white/5"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleCTAClick}
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-sm font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-shadow"
          >
            {currentView === "dashboard" ? "소개 홈페이지" : "사내 입찰 현황판"}
          </button>
        </div>
      </div>
    </nav>
  );
}
