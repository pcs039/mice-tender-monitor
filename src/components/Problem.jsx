import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, Search, HelpCircle, ArrowDown } from "lucide-react";

export default function Problem() {
  const { scrollYProgress } = useScroll();

  // Cards start displaced downwards, scroll brings them to alignment
  // Creating a "sinking slightly on scroll, then floating back up" feel.
  const yOffset1 = useTransform(scrollYProgress, [0.1, 0.45], [40, 0]);
  const yOffset2 = useTransform(scrollYProgress, [0.1, 0.45], [80, 0]);

  // Magnetic state for Card 1
  const [rotX1, setRotX1] = useState(0);
  const [rotY1, setRotY1] = useState(0);
  // Magnetic state for Card 2
  const [rotX2, setRotX2] = useState(0);
  const [rotY2, setRotY2] = useState(0);

  const handleCardMouseMove = (e, cardNum) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const factorX = (y / (rect.height / 2)) * -12; // tilt angle
    const factorY = (x / (rect.width / 2)) * 12;

    if (cardNum === 1) {
      setRotX1(factorX);
      setRotY1(factorY);
    } else {
      setRotX2(factorX);
      setRotY2(factorY);
    }
  };

  const handleCardMouseLeave = (cardNum) => {
    if (cardNum === 1) {
      setRotX1(0);
      setRotY1(0);
    } else {
      setRotX2(0);
      setRotY2(0);
    }
  };

  return (
    <section id="problem" className="relative px-4 py-16 md:px-8 md:py-24 w-full bg-[#07080A]/95 overflow-hidden border-b border-white/5">
      {/* Background elements */}
      <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-2 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="font-mono text-xs text-brand-purple tracking-[0.3em] font-semibold uppercase">
            WHY CueVIC?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mt-3 mb-4 md:mb-6">
            기존 영상 아카이브의 한계
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-xs md:text-base leading-relaxed">
            대량의 영상 자산을 보유하고 있음에도 파일 크기, 구조적 장벽으로 인해 메타데이터 인덱싱이 불가능했던 기존 MAM 인프라의 위협 요인입니다.
          </p>
          <div className="flex justify-center mt-6">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          </div>
        </div>

        {/* Problem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 perspective-container">
          
          {/* Card 1: 수작업 검색의 한계 */}
          <motion.div
            style={{ 
              y: yOffset1,
              transformStyle: "preserve-3d",
              rotateX: rotX1,
              rotateY: rotY1,
            }}
            onMouseMove={(e) => handleCardMouseMove(e, 1)}
            onMouseLeave={() => handleCardMouseLeave(1)}
            className="magnet-card group relative p-6 sm:p-8 md:p-10 rounded-2xl border border-white/10 bg-brand-bg/40 hover:bg-brand-bg/60 hover:border-brand-purple/30 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
          >
            {/* Glowing Accent Border inside on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Icon & Label */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <Search className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-gray-500">LIMIT_01</span>
              </div>

              {/* Title & Content */}
              <div className="mt-6 md:mt-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-brand-purple transition-colors duration-300">
                  수작업 검색의 한계
                </h3>
                <p className="text-gray-400 mt-4 leading-relaxed text-xs md:text-base">
                  파일명과 날짜 중심의 단순 관리에 의존하여, 제작자가 필요한 장면을 찾기 위해 원본 전체를 무한 반복 열람해야 하는 극심한 리소스 낭비가 매일 반복되고 있습니다.
                </p>
              </div>

              {/* Cyber Alert Box */}
              <div className="mt-6 md:mt-8 p-4 rounded-lg bg-brand-purple/5 border border-brand-purple/10 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-brand-purple shrink-0" />
                <span className="text-[10px] md:text-xs font-mono text-gray-400">
                  EST. TIME LOSS: 4.8 hrs per editor / day
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: 사후 필터링의 위험 */}
          <motion.div
            style={{ 
              y: yOffset2,
              transformStyle: "preserve-3d",
              rotateX: rotX2,
              rotateY: rotY2,
            }}
            onMouseMove={(e) => handleCardMouseMove(e, 2)}
            onMouseLeave={() => handleCardMouseLeave(2)}
            className="magnet-card group relative p-6 sm:p-8 md:p-10 rounded-2xl border border-white/10 bg-brand-bg/40 hover:bg-brand-bg/60 hover:border-brand-cyan/30 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
          >
            {/* Glowing Accent Border inside on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              {/* Icon & Label */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs text-gray-500">LIMIT_02</span>
              </div>

              {/* Title & Content */}
              <div className="mt-6 md:mt-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-brand-cyan transition-colors duration-300">
                  사후 필터링의 위험
                </h3>
                <p className="text-gray-400 mt-4 leading-relaxed text-xs md:text-base">
                  마스터본 완성 직전 심의 단계에서야 위험 요소를 탐지하는 사후·방어형 구조는 심의 지연, 권리 침해 노출, 맥락 왜곡으로 인한 재작업 비용을 급격하게 상승시킵니다.
                </p>
              </div>

              {/* Cyber Alert Box */}
              <div className="mt-6 md:mt-8 p-4 rounded-lg bg-brand-cyan/5 border border-brand-cyan/10 flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-brand-cyan shrink-0" />
                <span className="text-[10px] md:text-xs font-mono text-gray-400">
                  COMPLIANCE RISK: Exposure to copyright & broadcast laws
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
