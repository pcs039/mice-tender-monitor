import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Play, Pause, Volume2, Maximize2, Download, CheckCircle2, 
  AlertTriangle, RefreshCw, FileSpreadsheet, FileJson, FileText 
} from "lucide-react";

export default function DashboardPreview() {
  const [isPlaying, setIsPlaying] = useState(true);
  const currentTime = "01:14:02:15";
  const [downloading, setDownloading] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  // Mobile check state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 3D Tilt Ref and coordinates
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setTilt({ x: 0, y: 0 });
      return;
    }
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Lower divisor = more aggressive tilt
    const rotateX = (y / (rect.height / 2)) * -6;
    const rotateY = (x / (rect.width / 2)) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Mock export handler
  const handleExport = (format) => {
    setDownloading(format);
    setTimeout(() => {
      setDownloading(null);
      setToastMsg(`CueVIC_Metadata_Export.${format.toLowerCase()} 다운로드가 완료되었습니다.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  return (
    <section id="preview" className="relative px-4 py-16 md:px-8 md:py-24 w-full bg-[#07080A] overflow-hidden border-b border-white/5">
      {/* Background orbs */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2 md:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono text-xs text-brand-purple tracking-[0.3em] font-semibold uppercase">
            PRODUCT CONSOLE PREVIEW
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mt-3 mb-4 md:mb-6">
            Scene Review Console
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-xs md:text-base leading-relaxed break-keep overflow-wrap-anywhere">
            웹 기반의 직관적인 인터페이스를 통해 장면별 AI 분석 결과를 확인하고, 
            위험 후보 태그와 검수 우선순위를 즉각적으로 컨트롤하세요.
          </p>
        </div>

        {/* 3D Tilting Console Container */}
        <div className="w-full flex justify-center perspective-container overflow-hidden rounded-2xl">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
              rotateX: tilt.x,
              rotateY: tilt.y,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0D0E12] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden scale-95 md:scale-100 transition-transform duration-300"
          >
            {/* Top Chrome Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-brand-dark border-b border-white/5 gap-2">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="flex space-x-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] md:text-xs font-mono text-gray-500 ml-2 truncate">CONSOLE // CUEVIC_WORKFLOW_ACTIVE</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto text-[10px] md:text-xs">
                <span className="font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20 shrink-0">
                  AUTO_RUN: READY
                </span>
                <span className="font-mono text-gray-400 shrink-0">SESSION_01:14:02</span>
              </div>
            </div>

            {/* Interior Panel Wrapper - Handles padding and scaling containment */}
            <div className="w-full overflow-hidden p-4 md:p-6">
              
              {/* Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Left & Middle Column: Player and Waveform Timeline */}
                <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
                  
                  <div>
                    {/* Video Player Box Mock */}
                    <div className="relative aspect-video rounded-xl bg-brand-dark/90 border border-white/5 overflow-hidden flex items-center justify-center group w-full h-auto">
                      {/* Backdrop Camera Simulation */}
                      <div className="absolute inset-0 bg-radial-gradient from-transparent to-brand-bg opacity-40" />
                      <div className="absolute top-4 left-4 font-mono text-[10px] text-brand-cyan bg-[#0D0E12]/80 px-2 py-1 rounded border border-brand-cyan/20">
                        CAM_01 // MULTIMODAL_FEED
                      </div>
                      <div className="absolute top-4 right-4 font-mono text-[10px] text-red-500 bg-[#0D0E12]/80 px-2 py-1 rounded border border-red-500/20 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>REC STREAM</span>
                      </div>

                      {/* Cyber Grid Overlay */}
                      <div className="absolute inset-0 cosmic-grid opacity-10 pointer-events-none" />

                      {/* Graphic Display Mock (Simulating AI Target Boxes) - Desktop Only */}
                      {!isMobile && (
                        <>
                          <div className="absolute top-[30%] left-[25%] border-2 border-brand-cyan px-2 py-1 rounded text-[10px] font-mono text-brand-cyan font-semibold bg-brand-cyan/5 animate-pulse">
                            [BRAND: PORSCHE LOGO // SCORE 98.4%]
                          </div>
                          <div className="absolute bottom-[25%] right-[20%] border-2 border-brand-amber px-2 py-1 rounded text-[10px] font-mono text-brand-amber font-semibold bg-brand-amber/5">
                            [SUBTITLE COMPLIANCE: OUT_OF_BOUND]
                          </div>
                        </>
                      )}

                      {/* Player Controls Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-brand-dark to-transparent flex items-center justify-between opacity-90">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-8 h-8 rounded-full bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan hover:bg-brand-cyan/30 hover:scale-105 transition cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" />}
                          </button>
                          <Volume2 className="w-4.5 h-4.5 text-gray-400" />
                          <span className="font-mono text-xs text-gray-300">{currentTime}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-[10px] text-gray-500">23.98 fps</span>
                          <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Detection Status Tags List - Stacked Vertically */}
                    {isMobile && (
                      <div className="flex flex-col gap-2 relative mt-4 pb-2">
                        <div className="border border-brand-cyan/30 px-3 py-2.5 rounded-lg text-[10px] font-mono text-brand-cyan font-semibold bg-brand-cyan/5 flex items-center justify-between break-keep overflow-wrap-anywhere">
                          <span>[BRAND LOGO DETECTED]</span>
                          <span className="text-white">PORSCHE LOGO // 98.4%</span>
                        </div>
                        <div className="border border-brand-amber/30 px-3 py-2.5 rounded-lg text-[10px] font-mono text-brand-amber font-semibold bg-brand-amber/5 flex items-center justify-between break-keep overflow-wrap-anywhere">
                          <span>[COMPLIANCE ALERT]</span>
                          <span className="text-white">SUBTITLE OUT_OF_BOUND</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline Tracks */}
                  <div className="space-y-4">
                    
                    {/* Waveform track */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>AUDIO WAVEFORM (STT MATCHING)</span>
                        <span className="text-brand-purple">SCENE_ALIGN // STABLE</span>
                      </div>
                      <div className="h-10 rounded bg-brand-dark/60 border border-white/5 relative flex items-center px-2">
                        {/* Fake Waveform drawing */}
                        <div className="flex items-end space-x-[2px] w-full h-8 opacity-60">
                          {Array.from({ length: 65 }).map((_, i) => {
                            const heights = [30, 45, 15, 60, 75, 40, 20, 80, 50, 90, 30, 10, 55, 70, 40, 20, 15, 65, 50, 85, 30, 75, 20, 45, 60, 80, 95, 30, 10, 45, 60, 20, 15, 80, 60, 40, 55, 30, 70, 85, 20, 10, 40, 60, 75, 30, 15, 50, 65, 80, 20, 30, 90, 45, 75, 10, 20, 55, 85, 40, 60, 15, 35, 70, 50];
                            const h = heights[i % heights.length];
                            return (
                              <div 
                                key={i} 
                                style={{ height: `${h}%` }} 
                                className={`flex-1 rounded-sm ${i === 28 ? "bg-brand-amber" : i > 25 && i < 35 ? "bg-brand-purple" : "bg-brand-cyan"}`} 
                              />
                            );
                          })}
                        </div>
                        {/* Active Playhead */}
                        <div className="absolute top-0 bottom-0 left-[45%] w-[1.5px] bg-red-500 shadow-[0_0_8px_red] z-10" />
                      </div>
                    </div>

                    {/* Multi-track Grid */}
                    <div className="space-y-2">
                      
                      {/* Scene segments track */}
                      <div className="h-6 rounded bg-brand-dark/40 flex items-center text-[8px] md:text-[10px] font-mono border border-white/5 overflow-hidden">
                        <div className="w-[25%] h-full bg-brand-cyan/10 border-r border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-bold truncate">
                          Scene 01
                        </div>
                        <div className="w-[35%] h-full bg-brand-purple/10 border-r border-brand-purple/20 flex items-center justify-center text-brand-purple font-bold truncate">
                          Scene 02 [ACT]
                        </div>
                        <div className="w-[40%] h-full bg-white/5 flex items-center justify-center text-gray-500 truncate">
                          Scene 03
                        </div>
                      </div>

                      {/* Metadata tags track */}
                      <div className="h-6 rounded bg-brand-dark/40 flex items-center text-[10px] font-mono border border-white/5 overflow-hidden relative">
                        <div className="absolute left-[30%] px-2 py-0.5 bg-brand-amber/20 border border-brand-amber/40 text-brand-amber rounded text-[9px] flex items-center space-x-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>의심구간 (01:14:02)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right Column: AI Analysis Metrics & Decision Panel */}
                <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
                  
                  {/* Metric circular Gauges */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-4">
                      AI Real-time Metrics
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      
                      {/* CDS Gauge */}
                      <div className="flex flex-col items-center p-4 rounded-xl bg-brand-dark border border-white/5">
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" />
                            <circle cx="36" cy="36" r="30" stroke="#00F0FF" strokeWidth="5" fill="transparent" strokeDasharray="188.4" strokeDashoffset="10.9" className="transition-all duration-1000 shadow-[0_0_10px_#00F0FF]" />
                          </svg>
                          <span className="absolute font-mono text-sm font-bold text-white">94.2%</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 mt-2 text-center break-keep">맥락 의존도 (CDS)</span>
                      </div>

                      {/* RCS Gauge */}
                      <div className="flex flex-col items-center p-4 rounded-xl bg-brand-dark border border-white/5">
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="36" cy="36" r="30" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" />
                            <circle cx="36" cy="36" r="30" stroke="#F59E0B" strokeWidth="5" fill="transparent" strokeDasharray="188.4" strokeDashoffset="141.3" />
                          </svg>
                          <span className="absolute font-mono text-sm font-bold text-brand-amber">24.5%</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 mt-2 text-center break-keep">위험 후보 점수 (RCS)</span>
                      </div>

                    </div>
                  </div>

                  {/* Subtitle & Segment Summary Block */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                        장면 분석 디테일
                      </h4>
                      <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-1 rounded">SCENE_02</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2.5 rounded bg-brand-dark border border-white/5">
                        <span className="text-brand-purple font-bold block mb-1">STT 발화 요약</span>
                        <p className="text-gray-400 text-[11px] leading-relaxed break-keep overflow-wrap-anywhere">
                          "이번 분기 신차 개발 프로젝트 완료 보고를 지금 시작..." (발화 속도 정상, 컴플라이언스 문제 없음)
                        </p>
                      </div>

                      <div className="p-2.5 rounded bg-brand-dark border border-white/5">
                        <span className="text-brand-cyan font-bold block mb-1">VLM 시각적 요약</span>
                        <p className="text-gray-400 text-[11px] leading-relaxed break-keep overflow-wrap-anywhere">
                          도심 도로 주행 중인 스포츠카 노출. 간접 광고 브랜드(Porsche) 오버랩 감지됨.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decision Actions & Data Export */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 rounded bg-brand-cyan text-brand-bg text-xs font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition cursor-pointer flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>검수 승인</span>
                      </button>
                      <button className="py-2 px-3 rounded border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white text-xs font-bold transition cursor-pointer flex items-center justify-center">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                        데이터 리포트 즉시 내보내기
                      </span>
                      
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button 
                          onClick={() => handleExport("CSV")}
                          disabled={downloading !== null}
                          className="py-1.5 px-2 bg-brand-dark hover:bg-brand-gray border border-white/5 hover:border-brand-cyan/20 text-[10px] font-bold text-gray-300 rounded flex flex-col items-center space-y-1 transition cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>CSV</span>
                        </button>

                        <button 
                          onClick={() => handleExport("JSON")}
                          disabled={downloading !== null}
                          className="py-1.5 px-2 bg-brand-dark hover:bg-brand-gray border border-white/5 hover:border-brand-purple/20 text-[10px] font-bold text-gray-300 rounded flex flex-col items-center space-y-1 transition cursor-pointer"
                        >
                          <FileJson className="w-4 h-4 text-brand-purple" />
                          <span>JSON</span>
                        </button>

                        <button 
                          onClick={() => handleExport("PDF")}
                          disabled={downloading !== null}
                          className="py-1.5 px-2 bg-brand-dark hover:bg-brand-gray border border-white/5 hover:border-brand-amber/20 text-[10px] font-bold text-gray-300 rounded flex flex-col items-center space-y-1 transition cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-brand-amber" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Toast notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg border border-brand-cyan bg-[#0D0E12]/95 text-white text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-bounce">
          <Download className="w-4 h-4 text-brand-cyan animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}
    </section>
  );
}
