import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Video, Brain, LineChart, UserCheck, ChevronRight } from "lucide-react";

export default function Pipeline() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });

  // Calculate separate scroll triggers for the 4 cards flying in from depth
  const scale1 = useTransform(scrollYProgress, [0.0, 0.3], [0.4, 1]);
  const opacity1 = useTransform(scrollYProgress, [0.0, 0.3], [0, 1]);
  const z1 = useTransform(scrollYProgress, [0.0, 0.3], [-300, 0]);

  const scale2 = useTransform(scrollYProgress, [0.2, 0.5], [0.4, 1]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const z2 = useTransform(scrollYProgress, [0.2, 0.5], [-300, 0]);

  const scale3 = useTransform(scrollYProgress, [0.4, 0.7], [0.4, 1]);
  const opacity3 = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const z3 = useTransform(scrollYProgress, [0.4, 0.7], [-300, 0]);

  const scale4 = useTransform(scrollYProgress, [0.6, 0.9], [0.4, 1]);
  const opacity4 = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);
  const z4 = useTransform(scrollYProgress, [0.6, 0.9], [-300, 0]);

  const cards = [
    {
      num: "01",
      title: "영상 입력 및 전처리",
      desc: "클린본, 촬영본 소스를 분할하여 scene_id 자동 부여",
      icon: Video,
      color: "from-brand-cyan/20 to-transparent",
      borderColor: "border-brand-cyan/30",
      accentColor: "text-brand-cyan",
      scale: scale1,
      opacity: opacity1,
      z: z1,
    },
    {
      num: "02",
      title: "멀티모달 AI 분석",
      desc: "STT, VLM, LLM 모델을 융합하여 장면 및 발화 의미 요약",
      icon: Brain,
      color: "from-brand-purple/20 to-transparent",
      borderColor: "border-brand-purple/30",
      accentColor: "text-brand-purple",
      scale: scale2,
      opacity: opacity2,
      z: z2,
    },
    {
      num: "03",
      title: "판단 지표 산출",
      desc: "맥락 의존도(CDS), 위험 후보 점수(RCS), 재사용 적합도 정량 지표 도출",
      icon: LineChart,
      color: "from-brand-amber/20 to-transparent",
      borderColor: "border-brand-amber/30",
      accentColor: "text-brand-amber",
      scale: scale3,
      opacity: opacity3,
      z: z3,
    },
    {
      num: "04",
      title: "Human-in-the-loop 검수",
      desc: "AI 초안을 제작자가 검수·수정하여 신뢰도 100% 데이터 확정",
      icon: UserCheck,
      color: "from-green-500/10 to-transparent",
      borderColor: "border-green-500/20",
      accentColor: "text-green-400",
      scale: scale4,
      opacity: opacity4,
      z: z4,
    },
  ];

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section
      id="pipeline"
      ref={containerRef}
      className="relative px-4 py-16 md:px-8 md:py-24 w-full bg-[#0D0E12] overflow-hidden border-b border-white/5"
    >
      {/* Background visual components */}
      <div className="absolute top-[30%] left-[2%] w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber grid background */}
      <div className="absolute inset-0 cosmic-grid opacity-30 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <span className="font-mono text-xs text-brand-cyan tracking-[0.3em] font-semibold uppercase">
            ANALYSIS PIPELINE
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mt-3 mb-4 md:mb-6">
            CueVIC 핵심 분석 파이프라인
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xs md:text-base leading-relaxed">
            영상이 입력된 순간부터 메타데이터가 최종 확정되기까지, 멀티모달 AI 엔진과 검수 워크플로우가 결합된 4단계 시스템입니다.
          </p>
        </div>

        {/* 3D Perspective Pipeline Cards Wrapper */}
        <div className="relative perspective-container grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Connecting Laser Line overlay (Desktop only) */}
          <div className="absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-brand-cyan via-brand-purple to-green-500 hidden lg:block opacity-20 z-0" />
          <div className="absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-brand-cyan via-brand-purple to-green-500 hidden lg:block z-0 overflow-hidden">
            <div className="w-[15%] h-full bg-white shadow-[0_0_8px_#FFF] animate-[grid-move_3s_linear_infinite]" />
          </div>

          {cards.map((card) => {
            const Icon = card.icon;
            const motionProps = isMobile
              ? {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-50px" },
                  transition: { duration: 0.5 }
                }
              : {
                  style: {
                    scale: card.scale,
                    opacity: card.opacity,
                    translateZ: card.z,
                    transformStyle: "preserve-3d",
                  }
                };

            return (
              <motion.div
                key={card.num}
                {...motionProps}
                className={`relative flex flex-col justify-between p-6 md:p-8 rounded-2xl border ${card.borderColor} bg-brand-bg/50 backdrop-blur-md hover:bg-brand-bg/85 transition-all duration-300 group z-10 shadow-2xl`}
              >
                {/* Glow backlights on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${card.accentColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xl font-extrabold text-white/20 group-hover:text-white/40 transition-colors">
                      {card.num}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="mt-6">
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-white transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm mt-3 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                {/* Card footer details */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>LATENCY: OPTIMIZED</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${card.accentColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                </div>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
