import { useState } from "react";
import { Send, CheckCircle2, ChevronUp } from "lucide-react";

export default function Footer() {
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.name || !form.email) {
      alert("필수 입력 항목을 작성해 주세요.");
      return;
    }
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ company: "", name: "", email: "", notes: "" });
    }, 1500);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative bg-[#07080A] pt-32 pb-16 overflow-hidden">
      {/* Background grids and shapes */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
      <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] bg-brand-purple/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto mb-28">
          <div className="text-center mb-12">
            <span className="font-mono text-xs text-brand-cyan tracking-[0.3em] font-semibold uppercase">
              GET IN TOUCH
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-3">
              도입 문의 및 데모 신청
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-3">
              상담을 신청해 주시면 CueVIC 기술 엔지니어가 24시간 내에 연락드립니다.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/5 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mx-auto text-brand-cyan">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">신청이 완료되었습니다</h3>
              <p className="text-gray-400 text-sm">
                입력하신 이메일로 담당 전문 기술 엔지니어가 빠른 시일 내에 연락드리겠습니다.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-mono text-brand-cyan hover:underline cursor-pointer"
              >
                추가 문의 작성하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Company Name */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 block">회사명 (필수)</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="주식회사 데이터딕션"
                    className="w-full bg-brand-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-cyan focus:outline-none transition"
                  />
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 block">담당자명 (필수)</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full bg-brand-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-cyan focus:outline-none transition"
                  />
                </div>

              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 block">이메일 주소 (필수)</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@datadiction.com"
                  className="w-full bg-brand-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-cyan focus:outline-none transition"
                />
              </div>

              {/* Detail Notes */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-400 block">문의 사항 (선택)</label>
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="기존 MAM 솔루션 정보 및 연동 계획 등을 적어주시면 상세한 기술 상담이 가능합니다."
                  className="w-full bg-brand-bg border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-cyan focus:outline-none transition resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-cyan to-brand-purple hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] text-brand-bg font-bold rounded-lg text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>데모 신청 제출하기</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

        {/* Corporate Legal Info & Site Footer */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Company identity and addresses */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-sans font-bold text-lg text-white">주식회사 데이터딕션</span>
              <span className="text-xs text-gray-500 font-mono">DataDiction Co., Ltd.</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1.5 gap-x-6 text-[11px] font-mono text-gray-500">
              <div>대표자: 박춘수</div>
              <div>사업자등록번호: 851-81-03990</div>
              <div>문의: support@datadiction.com</div>
            </div>
            
            <p className="text-[11px] font-mono text-gray-600">
              © {new Date().getFullYear()} DataDiction Co., Ltd. All Rights Reserved.
            </p>
          </div>

          {/* Slogan & Scroll Up */}
          <div className="flex flex-col items-end gap-3 self-stretch md:self-auto">
            <p className="text-xs font-mono text-gray-400 text-right">
              "영상의 가치를 새롭게 색인하다. DataDiction."
            </p>
            
            <button 
              onClick={handleScrollTop}
              className="p-2.5 rounded-lg border border-white/10 hover:border-brand-cyan bg-brand-bg hover:bg-brand-cyan/10 text-gray-400 hover:text-brand-cyan transition cursor-pointer"
            >
              <ChevronUp className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
