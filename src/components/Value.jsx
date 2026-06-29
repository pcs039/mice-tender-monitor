import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Database, Cpu, Zap, Radio, Check } from "lucide-react";

export default function Value() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section id="positioning" className="relative px-4 py-16 md:px-8 md:py-24 w-full bg-[#0D0E12] overflow-hidden border-b border-white/5">
      {/* Grid backdrops */}
      <div className="absolute inset-0 cosmic-grid opacity-20 pointer-events-none" />
      <div className="absolute top-[20%] left-[5%] w-[400px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Copywriting */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="font-mono text-xs text-brand-cyan tracking-[0.3em] font-semibold uppercase">
                COMPLEMENTARY UPGRADE
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mt-3 mb-4 md:mb-6 leading-tight">
                대체가 아닙니다.
                <br />
                <span className="bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent cyan-neon-glow">
                  완벽한 보강입니다.
                </span>
              </h2>
              <p className="text-gray-400 leading-relaxed text-xs md:text-base">
                기존의 대형 방송사 MAM / CMS 인프라를 완전히 바꿀 필요가 없습니다. 
                CueVIC은 기존 시스템 위에 플러그인 방식으로 가볍게 연동되어, 
                단순 파일 단위의 아카이브 관리를 <strong>"장면 단위 의미 자산"</strong>으로 완벽하게 고도화합니다.
              </p>
            </div>

            {/* List of features */}
            <div className="space-y-4 font-mono text-xs md:text-sm">
              {[
                "기존 MAM 인프라 DB와 API 플러그인 연동 지원",
                "초경량 인프라 배포 (On-premise / Hybrid Cloud)",
                "장면 쿼리(Scene Search) 인덱스 추가 구축",
                "레거시 방송 표준 심의 등급 자동 연계 필터링",
              ].map((text, i) => (
                <div key={i} className="flex items-center space-x-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-brand-cyan/15 flex items-center justify-center border border-brand-cyan/30 text-brand-cyan shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Architectural Diagram */}
          <div className="lg:col-span-7 flex items-center justify-center perspective-container py-6 lg:py-0 w-full">
            
            {isMobile ? (
              /* Mobile Layout: Stacked Vertically */
              <div className="flex flex-col space-y-6 w-full max-w-md">
                
                {/* Legacy MAM card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="w-full rounded-xl border border-brand-purple/20 bg-[#07080A]/90 p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-brand-purple/10 pb-2">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-brand-purple" />
                      <span className="font-mono text-[10px] text-gray-400">EXISTING MAM / CMS DB</span>
                    </div>
                    <span className="font-mono text-[9px] text-gray-600">STABLE_LAYER</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2.5 my-4">
                    {["video_001.mp4", "video_002.mp4", "video_003.mp4"].map((file, i) => (
                      <div key={i} className="p-2 rounded border border-white/5 bg-[#0D0E12] font-mono text-[8px] text-gray-500 truncate text-center">
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-600">
                    <span>METADATA: BASIC</span>
                    <span>[UNINDEXED_CONTENT]</span>
                  </div>
                </motion.div>

                {/* CueVIC AI Upgrade Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="w-full rounded-xl border border-brand-cyan/40 bg-[#0D0E12]/95 shadow-[0_15px_30px_rgba(0,240,255,0.05)] p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-brand-cyan/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-brand-cyan animate-pulse" />
                      <span className="font-mono text-[10px] text-brand-cyan font-bold tracking-widest">CueVIC AI PLUG-IN</span>
                    </div>
                    <Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
                  </div>

                  <div className="space-y-2.5 my-3">
                    <div className="p-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded flex items-center justify-between">
                      <span className="font-mono text-[9px] text-brand-cyan">SCENE_DETECTION_ENGINE</span>
                      <Zap className="w-3 h-3 text-brand-cyan animate-bounce" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-1.5 bg-brand-purple/5 border border-brand-purple/20 rounded font-mono text-[8px] text-brand-purple text-center">
                        MULTIMODAL EMBEDDINGS
                      </div>
                      <div className="p-1.5 bg-brand-amber/5 border border-brand-amber/20 rounded font-mono text-[8px] text-brand-amber text-center">
                        HITL CONFIRMATION SYSTEM
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-400">
                    <span>UPGRADE: SCENE SEGMENTS & COMPLIANCE</span>
                    <span className="text-brand-cyan font-bold">ACTIVE</span>
                  </div>
                </motion.div>

              </div>
            ) : (
              /* Desktop Layout: 3D Overlapping Layers */
              <div className="relative w-full max-w-[500px] h-[380px] flex items-center justify-center">
                
                {/* Layer 1: Bottom Layer (Legacy MAM/CMS) */}
                <motion.div
                  initial={{ rotateX: 45, rotateY: -10, rotateZ: -25, y: 70, opacity: 0.6 }}
                  whileInView={{ rotateX: 50, rotateY: -10, rotateZ: -25, y: 70, opacity: 0.8 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="absolute w-[85%] aspect-video rounded-xl border border-brand-purple/20 bg-[#07080A]/90 shadow-[0_15px_35px_rgba(168,85,247,0.05)] p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-brand-purple/10 pb-2">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-brand-purple" />
                      <span className="font-mono text-[10px] text-gray-400">EXISTING MAM / CMS DB</span>
                    </div>
                    <span className="font-mono text-[9px] text-gray-600">STABLE_LAYER</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 my-4">
                    {["video_001.mp4", "video_002.mp4", "video_003.mp4"].map((file, i) => (
                      <div key={i} className="p-2.5 rounded border border-white/5 bg-[#0D0E12] font-mono text-[9px] text-gray-500">
                        <div className="w-full h-1 bg-white/5 rounded-full mb-1.5" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-600">
                    <span>METADATA: TITLE, DATE, SIZE</span>
                    <span>[UNINDEXED_CONTENT]</span>
                  </div>
                </motion.div>

                {/* Connecting Laser Beams */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <svg className="w-full h-full absolute" viewBox="0 0 500 380">
                    {[
                      { x1: 150, y1: 220, x2: 170, y2: 110 },
                      { x1: 250, y1: 190, x2: 270, y2: 80 },
                      { x1: 350, y1: 160, x2: 370, y2: 50 }
                    ].map((line, idx) => (
                      <g key={idx}>
                        <line 
                          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} 
                          stroke="rgba(0, 240, 255, 0.4)" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 6"
                        />
                        <motion.circle 
                          r="3" 
                          fill="#00F0FF" 
                          cx={line.x1} cy={line.y1}
                          animate={{
                            cx: [line.x1, line.x2],
                            cy: [line.y1, line.y2],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: idx * 0.5,
                            ease: "linear"
                          }}
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Layer 2: Top Layer (CueVIC Scene AI plugin overlay) */}
                <motion.div
                  initial={{ rotateX: 45, rotateY: -10, rotateZ: -25, y: -70, opacity: 0.7 }}
                  whileInView={{ rotateX: 50, rotateY: -10, rotateZ: -25, y: -60, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="absolute w-[85%] aspect-video rounded-xl border border-brand-cyan/40 bg-[#0D0E12]/95 shadow-[0_25px_50px_rgba(0,240,255,0.15)] p-5 flex flex-col justify-between z-20"
                >
                  <div className="flex items-center justify-between border-b border-brand-cyan/20 pb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-brand-cyan animate-pulse" />
                      <span className="font-mono text-[10px] text-brand-cyan font-bold tracking-widest">CueVIC AI PLUG-IN</span>
                    </div>
                    <Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
                  </div>

                  <div className="space-y-2.5 my-3">
                    <div className="p-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded flex items-center justify-between">
                      <span className="font-mono text-[9px] text-brand-cyan">SCENE_DETECTION_ENGINE</span>
                      <Zap className="w-3 h-3 text-brand-cyan animate-bounce" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-1.5 bg-brand-purple/5 border border-brand-purple/20 rounded font-mono text-[8px] text-brand-purple text-center">
                        MULTIMODAL EMBEDDINGS
                      </div>
                      <div className="p-1.5 bg-brand-amber/5 border border-brand-amber/20 rounded font-mono text-[8px] text-brand-amber text-center">
                        HITL CONFIRMATION SYSTEM
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8px] font-mono text-gray-400">
                    <span>METADATA UPGRADE: SCENE SEGMENTS, AUDIO/STT, RISK COMPLIANCE</span>
                    <span className="text-brand-cyan font-bold">ACTIVE</span>
                  </div>
                </motion.div>

              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
