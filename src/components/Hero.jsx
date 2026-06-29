import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Server, Film, Database, Activity } from "lucide-react";

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // Scroll parallax effects
  const yBg = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);
  const scaleTitle = useTransform(scrollY, [0, 500], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleDemoClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-brand-bg px-4 py-16 md:px-8 md:py-24 pt-28 md:pt-20">
      {/* Background Cosmic Grid */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 cosmic-grid opacity-80 z-0 pointer-events-none"
      />

      {/* Deep Neon Glow Orbs */}
      <div className="absolute top-[20%] left-[10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-brand-cyan/10 blur-[60px] md:blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-brand-purple/5 blur-[80px] md:blur-[120px]" />

      {/* Futuristic Scanline Effect */}
      <div className="absolute inset-0 scanline opacity-25 pointer-events-none z-10" />

      {/* Floating 3D Geometric Shapes (Mouse Reactive Parallax) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        
        {/* Shape 1: Video Frame Shape (Cyan Border Glassmorphism) */}
        <motion.div
          animate={{
            x: mousePos.x * 60,
            y: mousePos.y * 60,
            rotateX: mousePos.y * -15,
            rotateY: mousePos.x * 15,
          }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
          className="absolute top-[25%] right-[15%] w-44 h-28 hidden lg:flex flex-col justify-between p-4 rounded-xl border border-brand-cyan/40 bg-brand-bg/50 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] animate-float"
        >
          <div className="flex items-center justify-between border-b border-brand-cyan/20 pb-1.5">
            <span className="text-[10px] font-mono text-brand-cyan tracking-wider">SCENE_024.mp4</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <Film className="w-6 h-6 text-brand-cyan/70" />
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-cyan w-[65%]" />
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-500">
            <span>TC: 01:14:02</span>
            <span>CDS: 94.2%</span>
          </div>
        </motion.div>

        {/* Shape 2: Data Node (Purple Dot Network) */}
        <motion.div
          animate={{
            x: mousePos.x * -80,
            y: mousePos.y * -80,
            rotateX: mousePos.y * 10,
            rotateY: mousePos.x * -10,
          }}
          transition={{ type: "spring", stiffness: 60, damping: 22 }}
          className="absolute bottom-[20%] left-[12%] w-52 h-36 hidden lg:flex flex-col justify-between p-4 rounded-xl border border-brand-purple/40 bg-brand-bg/50 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-float-delayed"
        >
          <div className="flex items-center space-x-2 text-brand-purple">
            <Database className="w-4 h-4" />
            <span className="text-[10px] font-mono tracking-widest font-bold">MULTIMODAL_EMBEDDING</span>
          </div>
          <div className="space-y-1 my-2">
            <div className="flex justify-between text-[8px] font-mono text-gray-400">
              <span>STT TOKENS</span>
              <span className="text-brand-purple">RESOLVED</span>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-400">
              <span>VLM COGNITIVE</span>
              <span className="text-brand-cyan">PROCESSING</span>
            </div>
          </div>
          <div className="border-t border-brand-purple/20 pt-2 flex items-center justify-between">
            <Activity className="w-3.5 h-3.5 text-brand-purple" />
            <span className="text-[11px] font-mono text-white">LATENT_V: 1536d</span>
          </div>
        </motion.div>

        {/* Shape 3: Laser Amber Alert (Mini warning check) */}
        <motion.div
          animate={{
            x: mousePos.x * 40,
            y: mousePos.y * -50,
          }}
          transition={{ type: "spring", stiffness: 80, damping: 25 }}
          className="absolute top-[45%] left-[8%] hidden xl:flex items-center space-x-3 px-4 py-2.5 rounded-lg border border-brand-amber/30 bg-brand-bg/70 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        >
          <Server className="w-4 h-4 text-brand-amber" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Risk Index Detected</span>
            <span className="text-xs font-mono font-bold text-brand-amber">RCS: 87.5 (HIGH)</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 text-center z-20 relative">
        <motion.div
          style={{ opacity: opacityText, scale: scaleTitle }}
          className="flex flex-col items-center"
        >
          {/* Tagline */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 mb-6 md:mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            <span className="text-[10px] md:text-xs font-mono tracking-widest text-brand-cyan uppercase">
              CueVIC : Next-Gen Video Meta Infrastructure
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl font-sans">
            영상을 데이터 자산으로,
            <br />
            <span className="bg-gradient-to-r from-brand-cyan via-white to-brand-purple bg-clip-text text-transparent cyan-neon-glow">
              장면 단위 AI 검수 솔루션
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm md:text-lg text-gray-400 max-w-3xl leading-relaxed mb-10 md:mb-12">
            STT-VLM-LLM 멀티모달 AI와 Human-in-the-loop 검수가 결합된 
            <br className="hidden sm:inline" />
            차세대 영상 메타데이터 인프라, <span className="text-brand-cyan font-semibold">CueVIC</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            
            {/* Primary glassmorphic CTA button */}
            <button
              onClick={handleDemoClick}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-bold text-white rounded-xl group bg-gradient-to-br from-brand-cyan to-brand-purple hover:text-white cursor-pointer hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all duration-300 w-full sm:w-auto"
            >
              <span className="relative px-8 py-3.5 transition-all ease-in duration-75 bg-[#0D0E12] rounded-xl group-hover:bg-opacity-0 flex items-center justify-center space-x-2 w-full">
                <span>무료 데모 신청하기</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            {/* Secondary CTA button */}
            <button
              onClick={() => {
                const previewSection = document.getElementById("preview");
                if (previewSection) previewSection.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center justify-center space-x-2 px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-bold text-gray-300 hover:text-white transition-all cursor-pointer w-full sm:w-auto"
            >
              <Play className="w-4 h-4 text-brand-purple" />
              <span>콘솔 둘러보기</span>
            </button>
          </div>

          {/* Metrics ticker under buttons */}
          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 border-t border-white/5 pt-10 w-full max-w-3xl">
            {[
              { label: "AI SCENE SEGMENTATION", val: "99.2%" },
              { label: "METADATA SYNTAX ACC", val: "99.8%" },
              { label: "HUMAN HITL RELIABILITY", val: "100%" },
              { label: "MAM INTEGRATION TIME", val: "< 1HR" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                  {stat.val}
                </span>
                <span className="text-[8px] md:text-[9px] font-mono text-gray-500 tracking-wider mt-1 text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cyberpunk grid bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0D0E12] to-transparent pointer-events-none" />
    </section>
  );
}
