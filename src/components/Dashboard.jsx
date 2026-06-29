import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, Calendar, DollarSign, User, ClipboardList, MapPin, 
  RotateCw, X, ChevronRight, TrendingUp, CheckCircle, Clock, 
  Filter, ArrowUpDown, AlertCircle, Bookmark, Plus, Edit3, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  // Data state
  const [tenders, setTenders] = useState([]);
  const [stats, setStats] = useState({
    total_count: 0,
    active_count: 0,
    active_budget_sum: 0
  });
  
  // Loading & UI states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [toast, setToast] = useState(null);
  const drawerFormRef = useRef(null);

  // Scroll side drawer to top when selected tender changes (opens)
  useEffect(() => {
    if (selectedTender && drawerFormRef.current) {
      drawerFormRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [selectedTender]);
  
  // Filter/Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedUserStatus, setSelectedUserStatus] = useState("전체");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("전체");
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'budget', 'deadline'
  
  // Edit Form state (for selected tender)
  const [formData, setFormData] = useState({
    user_status: "",
    assignee: "",
    memo: "",
    event_start_date: "",
    event_end_date: "",
    event_location: ""
  });

  // Show Toast Helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Build API query parameters
      let url = `/api/tenders?sort=${sortBy}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory && selectedCategory !== "전체") url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedUserStatus && selectedUserStatus !== "전체") url += `&user_status=${encodeURIComponent(selectedUserStatus)}`;
      
      const [tendersRes, statsRes] = await Promise.all([
        fetch(url),
        fetch("/api/stats")
      ]);

      if (tendersRes.ok && statsRes.ok) {
        const tendersData = await tendersRes.json();
        const statsData = await statsRes.json();
        setTenders(tendersData);
        setStats(statsData);
      } else {
        showToast("데이터를 불러오지 못했습니다.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("서버 연결 실패", "error");
    } finally {
      setLoading(false);
    }
  }, [sortBy, searchTerm, selectedCategory, selectedUserStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync Tenders
  const handleSync = async () => {
    setSyncing(true);
    showToast("조달청 나라장터 동기화 중...", "info");
    try {
      const res = await fetch("/api/tenders/sync", { method: "POST" });
      if (res.ok) {
        const result = await res.json();
        const syncMode = result.mode === "api" ? "조달청 API 연동" : "가상 데이터 적재";
        showToast(`${result.count}건 입찰 데이터 동기화 완료 (${syncMode})`, "success");
        fetchData();
      } else {
        showToast("동기화 실패", "error");
      }
    } catch (e) {
      showToast("동기화 실패: 네트워크 오류", "error");
    } finally {
      setSyncing(false);
    }
  };

  // Open Edit Panel
  const handleRowClick = (tender) => {
    setSelectedTender(tender);
    setFormData({
      user_status: tender.user_status || "검토대기",
      assignee: tender.assignee || "",
      memo: tender.memo || "",
      event_start_date: tender.event_start_date ? tender.event_start_date.split("T")[0] : "",
      event_end_date: tender.event_end_date ? tender.event_end_date.split("T")[0] : "",
      event_location: tender.event_location || ""
    });
  };

  // Save Tender Updates
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedTender) return;
    
    // Construct payload. Convert empty dates to null.
    const payload = {
      user_status: formData.user_status,
      assignee: formData.assignee || "",
      memo: formData.memo || "",
      event_location: formData.event_location || "",
      event_start_date: formData.event_start_date ? `${formData.event_start_date}T00:00:00Z` : null,
      event_end_date: formData.event_end_date ? `${formData.event_end_date}T00:00:00Z` : null
    };

    try {
      const res = await fetch(`/api/tenders/${selectedTender.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        showToast("상태 정보가 업데이트되었습니다.", "success");
        setTenders(prev => prev.map(item => item.id === updated.id ? updated : item));
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        setSelectedTender(updated);
      } else {
        const err = await res.json();
        showToast(`업데이트 실패: ${err.detail || "오류"}`, "error");
      }
    } catch (err) {
      showToast("업데이트 중 서버 오류 발생", "error");
    }
  };

  // Calculate D-Day Helper
  const getDDay = (endDateStr) => {
    if (!endDateStr) return { text: "일정미정", color: "bg-slate-700 text-slate-300" };
    
    const now = new Date();
    const end = new Date(endDateStr);
    
    // Reset hours to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: "마감", color: "bg-[#2D161F] text-[#F43F5E] border border-[#F43F5E]/30" };
    } else if (diffDays === 0) {
      return { text: "D-Day", color: "bg-[#450A0A] text-[#EF4444] border border-[#EF4444]/40 animate-pulse" };
    } else if (diffDays <= 3) {
      return { text: `D-${diffDays}`, color: "bg-[#3B1E11] text-[#F97316] border border-[#F97316]/30" };
    } else if (diffDays <= 7) {
      return { text: `D-${diffDays}`, color: "bg-[#2E2813] text-[#EAB308] border border-[#EAB308]/30" };
    } else {
      return { text: `D-${diffDays}`, color: "bg-[#112F24] text-[#10B981] border border-[#10B981]/30" };
    }
  };

  // Budget formatting helper: e.g., 450,000,000 -> 4억 5,000만원
  const formatKoreanBudget = (budget) => {
    if (!budget || budget === 0) return "예산 미정";
    
    const uk = Math.floor(budget / 100000000);
    const remainder = budget % 100000000;
    const man = Math.floor(remainder / 10000);
    
    let result = "";
    if (uk > 0) result += `${uk}억 `;
    if (man > 0) result += `${man.toLocaleString()}만원`;
    
    return result.trim() || `${budget.toLocaleString()}원`;
  };

  // Category tags
  const categories = ["전체", "국제회의", "세미나", "컨퍼런스", "포럼", "MICE", "운영대행", "회의"];

  // Get locally filtered and sorted tenders list
  const getFilteredTenders = () => {
    let list = [...tenders];
    
    // Strict client-side filter: exclude '전시' (just in case)
    list = list.filter(t => !t.category.includes("전시"));
    
    if (selectedBudgetRange === "range_50m_100m") {
      list = list.filter(t => t.budget >= 50000000 && t.budget < 100000000);
    } else if (selectedBudgetRange === "range_100m_200m") {
      list = list.filter(t => t.budget >= 100000000 && t.budget < 200000000);
    } else if (selectedBudgetRange === "range_200m_300m") {
      list = list.filter(t => t.budget >= 200000000 && t.budget < 300000000);
    } else if (selectedBudgetRange === "range_300m_plus") {
      list = list.filter(t => t.budget >= 300000000);
    }
    
    // PCO-optimized custom sorting:
    // 1. Separate active (non-expired) and closed (expired/canceled) tenders
    const now = new Date();
    const activeList = [];
    const closedList = [];
    
    list.forEach(t => {
      const isExpired = t.status === "마감" || t.status === "취소" || (t.bid_end_date && new Date(t.bid_end_date) < now);
      if (isExpired) {
        closedList.push(t);
      } else {
        activeList.push(t);
      }
    });
    
    // 2. Sort Active Group based on selected criteria
    if (sortBy === "budget") {
      activeList.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      closedList.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (sortBy === "latest") {
      // Default: Active tenders prioritized by closer deadline first, Closed sorted by newest registration
      activeList.sort((a, b) => {
        if (!a.bid_end_date) return 1;
        if (!b.bid_end_date) return -1;
        return new Date(a.bid_end_date) - new Date(b.bid_end_date);
      });
      closedList.sort((a, b) => {
        return new Date(b.bid_start_date) - new Date(a.bid_start_date);
      });
    } else { // deadline
      activeList.sort((a, b) => {
        if (!a.bid_end_date) return 1;
        if (!b.bid_end_date) return -1;
        return new Date(a.bid_end_date) - new Date(b.bid_end_date);
      });
      closedList.sort((a, b) => {
        if (!a.bid_end_date) return 1;
        if (!b.bid_end_date) return -1;
        return new Date(b.bid_end_date) - new Date(a.bid_end_date); // recently closed first
      });
    }
    
    return [...activeList, ...closedList];
  };

  // Internal user status classes
  const getStatusBadge = (status) => {
    switch (status) {
      case "검토대기":
        return "bg-slate-800 text-slate-300 border border-slate-700";
      case "지원검토":
        return "bg-[#1E2E4A] text-[#38BDF8] border border-[#38BDF8]/20";
      case "제출준비":
        return "bg-[#33254A] text-[#C084FC] border border-[#C084FC]/20";
      case "제출완료":
        return "bg-[#11312C] text-[#34D399] border border-[#34D399]/20";
      case "제외":
        return "bg-slate-900 text-slate-500 border border-slate-800 line-through";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#E2E8F0] px-4 md:px-8 py-20 font-sans cosmic-grid">
      {/* Background Decorative Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Container */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#242F4D]/40 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="bg-brand-cyan/10 text-brand-cyan text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-cyan/20 uppercase tracking-widest font-mono">
                PCO Internal Console
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-400 font-mono">Live Monitoring</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-2">
              MICE 입찰 모니터링 대시보드
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              조달청 나라장터 API 연동 실시간 국제회의 및 MICE 용역 분석 플랫폼
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 border cursor-pointer ${
                syncing 
                  ? "bg-[#1E293B] border-slate-700 text-slate-400" 
                  : "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-[#0D0E12] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "동기화 진행 중..." : "나라장터 동기화"}</span>
            </button>
          </div>
        </div>



        {/* 1. Statistics Cards Widget Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Total */}
          <div className="bg-[#121826]/75 border border-[#242F4D]/50 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-xl -z-10" />
            <p className="text-slate-400 text-xs font-bold tracking-wider">전체 입찰 공고</p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{stats.total_count}</span>
              <span className="text-xs text-slate-400">건</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-[10px] mt-4 font-mono">
              <ClipboardList className="w-3 h-3 text-slate-400" />
              <span>실시간 누적 수집 건수</span>
            </div>
          </div>

          {/* Card 2: Active / 공고 중인 건 */}
          <div className="bg-[#121826]/75 border border-[#242F4D]/50 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full blur-xl -z-10" />
            <p className="text-[#38BDF8] text-xs font-bold tracking-wider">공고 중인 건</p>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-[#38BDF8]">{stats.active_count || 0}</span>
              <span className="text-xs text-[#38BDF8]">건</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-[10px] mt-4 font-mono">
              <Clock className="w-3 h-3 text-[#38BDF8]" />
              <span>현재 입찰 진행 중인 회의 행사</span>
            </div>
          </div>

          {/* Card 3: Active Budget Pool */}
          <div className="bg-[#121826]/75 border border-[#242F4D]/50 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -z-10" />
            <p className="text-amber-400 text-xs font-bold tracking-wider">활성 입찰 예산 pool</p>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-3xl font-extrabold text-white">
                {Math.round((stats.active_budget_sum || 0) / 100000000)}
              </span>
              <span className="text-sm font-bold text-white">억</span>
              <span className="text-[10px] text-slate-400 ml-1">
                ({((stats.active_budget_sum || 0) / 10000).toLocaleString()}만원)
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 text-[10px] mt-4 font-mono">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>진행 중인 용역 예산 합계</span>
            </div>
          </div>

        </div>

        {/* 2. Filters & Searches */}
        <div className="bg-[#121826]/40 border border-[#242F4D]/30 rounded-xl p-5 space-y-4 backdrop-blur-md">
          {/* Query Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="공고명(행사명) 또는 수요기관을 입력해 주세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-[#E2E8F0] placeholder-slate-500 focus:outline-none focus:border-brand-cyan/60 focus:ring-1 focus:ring-brand-cyan/20 transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Sorting Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">정렬:</span>
              <div className="flex bg-[#080B13] border border-[#242F4D]/50 p-1 rounded-lg">
                {[
                  { value: "latest", label: "최신등록순" },
                  { value: "budget", label: "예산높은순" },
                  { value: "deadline", label: "마감임박순" }
                ].map((sortOption) => (
                  <button
                    key={sortOption.value}
                    onClick={() => setSortBy(sortOption.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1 ${
                      sortBy === sortOption.value
                        ? "bg-[#1A253D] text-white shadow-sm border border-[#242F4D]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{sortOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Category Tags Line */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242F4D]/20">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>용역 키워드 필터:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-[#1A253D] text-brand-cyan border-brand-cyan/30"
                    : "bg-[#080B13]/60 text-slate-400 border-[#242F4D]/40 hover:text-slate-200 hover:border-[#242F4D]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Budget Range Filter Line */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#242F4D]/20">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2 font-sans">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>회의 행사 예산규모별 필터:</span>
            </span>
            {[
              { value: "전체", label: "전체 예산" },
              { value: "range_50m_100m", label: "5,000만 원 이상 ~ 1억 원 미만" },
              { value: "range_100m_200m", label: "1억 원 이상 ~ 2억 원 미만" },
              { value: "range_200m_300m", label: "2억 원 이상 ~ 3억 원 미만" },
              { value: "range_300m_plus", label: "3억 원 이상" }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedBudgetRange(range.value)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                  selectedBudgetRange === range.value
                    ? "bg-[#1A253D] text-brand-cyan border-brand-cyan/30"
                    : "bg-[#080B13]/60 text-slate-400 border-[#242F4D]/40 hover:text-slate-200 hover:border-[#242F4D]"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Data Board Table */}
        <div className="bg-[#121826]/50 border border-[#242F4D]/30 rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#080D1A]/80 border-b border-[#242F4D]/50 text-slate-400 text-xs font-bold tracking-wider">
                  <th className="px-6 py-4">D-Day</th>
                  <th className="px-6 py-4">공고번호</th>
                  <th className="px-6 py-4">게시일자</th>
                  <th className="px-6 py-4">수요기관 (발주처)</th>
                  <th className="px-6 py-4">입찰 공고명 (행사명)</th>
                  <th className="px-6 py-4 text-right">예산 규모</th>
                  <th className="px-6 py-4">마감 일시</th>
                  <th className="px-6 py-4">담당자</th>
                  <th className="px-6 py-4 text-center">진행 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242F4D]/20">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-20 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <RotateCw className="w-8 h-8 text-brand-cyan animate-spin" />
                        <span className="text-sm font-semibold">입찰 데이터 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : getFilteredTenders().length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-24 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-500" />
                        <p className="text-sm font-semibold">조건에 맞는 입찰 공고가 존재하지 않습니다.</p>
                        <p className="text-xs text-slate-500">우측 상단의 동기화 버튼을 눌러 공고 데이터를 갱신할 수 있습니다.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  getFilteredTenders().map((tender) => {
                    const dday = getDDay(tender.bid_end_date);
                    return (
                      <tr
                        key={tender.id}
                        onClick={() => handleRowClick(tender)}
                        className={`hover:bg-[#1C253C]/40 transition-colors duration-150 cursor-pointer border-l-2 ${
                          selectedTender?.id === tender.id ? "bg-[#1C253C]/60 border-brand-cyan" : "border-transparent"
                        }`}
                      >
                        {/* D-Day badge */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded ${dday.color} font-mono`}>
                            {dday.text}
                          </span>
                        </td>
                        
                        {/* Bid Notice No */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="font-bold text-slate-300 text-xs font-mono">{tender.bid_notice_no}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">차수: {tender.bid_notice_ord}</div>
                        </td>

                        {/* Notice Date */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="text-slate-300 text-xs font-mono">
                            {tender.notice_date 
                              ? new Date(tender.notice_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) 
                              : tender.bid_start_date
                                ? new Date(tender.bid_start_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
                                : "-"}
                          </div>
                        </td>
                        
                        {/* Demand Org */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="font-semibold text-white text-xs">{tender.org_name}</div>
                          {tender.const_org_name && tender.const_org_name !== tender.org_name && (
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">발주: {tender.const_org_name}</div>
                          )}
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4.5 max-w-sm">
                          <div className="font-medium text-white text-sm line-clamp-2 hover:text-brand-cyan transition-colors" title={tender.title}>
                            {tender.title}
                          </div>
                          {tender.category && (
                            <div className="mt-1">
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-semibold border border-slate-700">
                                {tender.category}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Budget */}
                        <td className="px-6 py-4.5 text-right whitespace-nowrap">
                          <div className="font-extrabold text-white text-sm font-mono">
                            {tender.budget ? tender.budget.toLocaleString() : "-"}
                          </div>
                          <div className="text-[10px] text-amber-400 mt-0.5 font-semibold">
                            {formatKoreanBudget(tender.budget)}
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="text-slate-200 text-xs font-semibold">
                            {tender.bid_end_date 
                              ? new Date(tender.bid_end_date).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) 
                              : "미정"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {tender.bid_end_date 
                              ? new Date(tender.bid_end_date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }) 
                              : ""}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {tender.assignee ? (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-200 font-bold bg-[#172033] px-2.5 py-1.5 rounded-lg border border-[#2D3E66]">
                              <User className="w-3 h-3 text-[#38BDF8]" />
                              <span>{tender.assignee}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">미지정</span>
                          )}
                        </td>

                        {/* User Status Badge */}
                        <td className="px-6 py-4.5 text-center whitespace-nowrap">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusBadge(tender.user_status)}`}>
                            {tender.user_status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-[#0B0F1A]/80 border-t border-[#242F4D]/50 px-6 py-4 flex items-center justify-between text-slate-400 text-xs">
            <div>
              보여지는 입찰 공고: <span className="font-bold text-white">{getFilteredTenders().length}</span>개
            </div>
            <div>
              마지막 업데이트: <span className="font-mono text-white">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Sliding Side Drawer (Detail Panel) */}
      <AnimatePresence>
        {selectedTender && (
          <>
            {/* Overlay BackDrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTender(null)}
              className="fixed inset-0 bg-[#000] z-50 pointer-events-auto"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full md:max-w-xl bg-[#0E1321] border-l border-[#242F4D] shadow-2xl z-50 flex flex-col pointer-events-auto"
            >
              {/* Drawer Absolute Top Scroll Container */}
              <form 
                onSubmit={handleSave} 
                ref={drawerFormRef} 
                className="h-full overflow-y-auto p-6 space-y-6 flex flex-col"
                style={{ boxSizing: "border-box", paddingTop: "32px" }}
              >
                {/* CSS Priority Overrides for Title Wrap & Card Height */}
                <style>{`
                  .force-wrap-title {
                    white-space: normal !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                    word-break: break-all !important;
                    word-wrap: break-word !important;
                    display: block !important;
                    height: auto !important;
                    max-height: none !important;
                  }
                  .force-auto-height-card {
                    height: auto !important;
                    max-height: none !important;
                    padding: 16px !important;
                  }
                `}</style>

                {/* Drawer Header (Scrollable) */}
                <div className="flex items-center justify-between pb-5 border-b border-[#242F4D]/50">
                  <div>
                    <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      공고 상세 & 입찰 기획
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1">입찰 검토 및 상태 관리</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTender(null)}
                    className="p-1.5 bg-[#1C253C] hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Tender Base Specifications Info Box */}
                <div className="bg-[#172033] border border-[#2D3E66] rounded-xl space-y-3.5 force-auto-height-card">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">공고 기관 (수요처)</span>
                    <span className="text-white text-sm font-bold">{selectedTender.org_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">용역 공고명</span>
                    <span className="text-white text-sm font-semibold leading-relaxed block mt-0.5 force-wrap-title">
                      {selectedTender.title}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2D3E66]/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block">배정 예산</span>
                      <span className="text-white text-sm font-extrabold font-mono block mt-0.5">
                        {selectedTender.budget ? selectedTender.budget.toLocaleString() : "-"}원
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold block mt-0.5">
                        {formatKoreanBudget(selectedTender.budget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">입찰 마감 일시</span>
                      <span className="text-white text-xs font-bold block mt-0.5">
                        {selectedTender.bid_end_date 
                          ? new Date(selectedTender.bid_end_date).toLocaleString("ko-KR", { hour12: false }) 
                          : "미정"}
                      </span>
                      <span className="text-[10px] text-[#F97316] font-bold block mt-0.5 font-mono">
                        {getDDay(selectedTender.bid_end_date).text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2.5 border-t border-[#2D3E66]/50">
                    <a
                      href={selectedTender.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-brand-cyan hover:underline space-x-1.5 font-bold cursor-pointer"
                    >
                      <span>나라장터 공고 상세 페이지 바로가기</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Edit Form Fields */}
                <h3 className="text-xs font-extrabold uppercase text-brand-cyan tracking-widest pt-2 border-b border-[#242F4D]/30 pb-2">
                  사내 사업 관리 입력 정보 (수정 가능)
                </h3>

                {/* 1) Internal Status */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">진행 상황 관리 상태</label>
                  <div className="grid grid-cols-5 gap-2">
                    {["검토대기", "지원검토", "제출준비", "제출완료", "제외"].map((status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setFormData(prev => ({ ...prev, user_status: status }))}
                        className={`py-2 rounded-lg text-xs font-bold transition-all duration-200 border cursor-pointer ${
                          formData.user_status === status
                            ? "bg-[#1E2E4A] text-brand-cyan border-brand-cyan/50 shadow-sm"
                            : "bg-[#080B13] text-slate-400 border-[#242F4D]/50 hover:text-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2) Assignee */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">프로젝트 담당자 지정</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="담당자 이름(예: 홍길동 대리, 기획2팀)"
                      value={formData.assignee}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                </div>

                {/* 3) RFP Event period (RFP 파싱 대비 행사기간) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">실제 MICE 행사 수행 기간 (RFP 분석 정보)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={formData.event_start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_start_date: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/60"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        value={formData.event_end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, event_end_date: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/60"
                      />
                    </div>
                  </div>
                </div>

                {/* 4) Event Location (RFP 개최지역) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">행사 개최 장소 (예: 서울 COEX, 부산 BEXCO)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="행사장소 또는 개최지"
                      value={formData.event_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_location: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/60"
                    />
                  </div>
                </div>

                {/* 5) Memo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">입찰 분석 메모 및 지침</label>
                  <div className="relative">
                    <ClipboardList className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <textarea
                      rows="4"
                      placeholder="경쟁사 동향, 기획서 작성 핵심 요구사항, 입찰 가이드라인 등 기록..."
                      value={formData.memo}
                      onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#080B13] border border-[#242F4D]/50 rounded-lg text-sm text-white focus:outline-none focus:border-brand-cyan/60 resize-none"
                    />
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="pt-4 border-t border-[#242F4D]/30 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTender(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold border border-slate-700 cursor-pointer transition-colors text-center"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-cyan hover:bg-[#00E5F0] text-[#070913] rounded-lg text-sm font-extrabold hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer transition-all text-center"
                  >
                    저장하기
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-lg text-xs font-bold shadow-2xl border flex items-center space-x-2.5 z-50 backdrop-blur-md ${
              toast.type === "error"
                ? "bg-[#291319] border-[#EF4444]/30 text-[#EF4444]"
                : toast.type === "info"
                ? "bg-[#132338] border-[#38BDF8]/30 text-[#38BDF8]"
                : "bg-[#112F24] border-[#10B981]/30 text-[#10B981]"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
            ) : toast.type === "info" ? (
              <RotateCw className="w-4 h-4 text-[#38BDF8] animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
