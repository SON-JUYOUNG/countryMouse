import { useState, useEffect } from 'react'
import KakaoMap from "./components/KakaoMap"
import { useLCIStore } from "./store/useLCIStore"
import {
  Wallet,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PiggyBank,
  Navigation2,
  HelpCircle,
  Loader2
} from "lucide-react"

function App() {
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { preferences, results, setPreference, runSimulation, fetchAllRegions } = useLCIStore()

  useEffect(() => {
    fetch('http://localhost:9090/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => console.error("Backend fetch error:", err));

    // Changed: Fetch all regions for map visualization on load
    fetchAllRegions();
  }, []);

  const formatWon = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  }

  const handleRunSimulation = async () => {
    setLoading(true)
    try {
      await runSimulation()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar - Controls & Inputs */}
      <aside className="w-[420px] flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-8 border-b border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              LCI PLATFORM
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-bold">
            금융 라이프스타일 시뮬레이터
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
          {/* Simulation Settings */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <Navigation2 className="w-3 h-3 mr-2" /> 시뮬레이션 설정
              </h3>
              {backendStatus && (
                <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500">Connected</span>
                </div>
              )}
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-400 flex items-center">
                  <Wallet className="w-3.5 h-3.5 mr-2 text-blue-400" /> 월 소득
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={preferences.monthlyIncome}
                    onChange={(e) => setPreference('monthlyIncome', Number(e.target.value))}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all group-hover:border-slate-600 shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">원</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-400 flex items-center">
                  <PiggyBank className="w-3.5 h-3.5 mr-2 text-emerald-400" /> 목표 저축액
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={preferences.targetSavings}
                    onChange={(e) => setPreference('targetSavings', Number(e.target.value))}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-600 shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">원</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-rose-400" /> 직장 위치
                  </label>
                  <select
                    value={preferences.workplace}
                    onChange={(e) => setPreference('workplace', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="강남역">강남역</option>
                    <option value="판교역">판교역</option>
                    <option value="홍대입구역">홍대입구역</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-cyan-400" /> 현재 거주지
                  </label>
                  <select
                    value={preferences.currentLiving}
                    onChange={(e) => setPreference('currentLiving', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="신림동">신림동</option>
                    <option value="자양동">자양동</option>
                    <option value="대치동">대치동</option>
                    <option value="구로동">구로동</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              <span>{loading ? '분석 중...' : '시뮬레이션 실행'}</span>
            </button>
          </section>

          {/* Results Section */}
          {results.length > 0 && (
            <section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">분석 결과: 최적 거주지 추천</h3>
              <div className="space-y-4">
                {results.slice(0, 3).map((res, idx) => (
                  <div
                    key={res.regionName}
                    className={`p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-slate-800/30 border-slate-800/50'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase inline-block ${idx === 0 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {idx === 0 ? 'Best Choice' : `Rank ${idx + 1}`}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-white">{res.regionName}</h4>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center text-sm font-bold ${res.estimatedSavings >= preferences.targetSavings ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {res.estimatedSavings >= preferences.targetSavings ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                          {res.estimatedSavings >= preferences.targetSavings ? '목표 달성' : '목표 미달'}
                        </div>
                      </div>
                    </div>

                    {res.description && (
                      <p className="text-[11px] text-slate-400 mb-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 italic leading-relaxed">
                        "{res.description}"
                      </p>
                    )}

                    {/* Main Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">

                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500 font-bold uppercase flex items-center">
                          <PiggyBank className="w-3 h-3 mr-1" /> 예상 저축액
                        </div>
                        <div className="text-lg font-black text-white">{formatWon(res.estimatedSavings)}</div>
                        {res.savingsGap !== 0 && (
                          <div className={`text-[11px] font-bold ${res.savingsGap > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            현재보다 {formatWon(Math.abs(res.savingsGap))} {res.savingsGap > 0 ? '절약' : '추가'}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500 font-bold uppercase flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> 통근 시간 차이
                        </div>
                        <div className="text-lg font-black text-white">
                          {res.timeGap === 0 ? '동일' : `${Math.abs(res.timeGap)}분 ${res.timeGap > 0 ? '단축' : '추가'}`}
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold tracking-tight">
                          왕복 기준 {Math.abs(res.timeGap * 2)}분 차이
                        </div>
                      </div>
                    </div>

                    {/* Data Evidence Details */}
                    <div className="pt-4 border-t border-slate-800/50 space-y-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">산출 근거 (Data Evidence)</div>

                      <div className="flex items-center justify-between group relative">
                        <div className="flex items-center text-xs text-slate-400">
                          <Wallet className="w-3 h-3 mr-2 text-blue-500" />
                          실질 주거비
                          <HelpCircle className="w-3 h-3 ml-1 text-slate-600 hover:text-blue-400 cursor-help" />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-700">
                            월세 + 보증금(3,000만원)에 대한 연 4% 이자 비용을 포함한 실질 지출입니다.
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-200">{formatWon(res.realHousingCost)}</span>
                      </div>

                      <div className="flex items-center justify-between group relative">
                        <div className="flex items-center text-xs text-slate-400">
                          <AlertCircle className="w-3 h-3 mr-2 text-emerald-500" />
                          로컬 물가 지수
                          <HelpCircle className="w-3 h-3 ml-1 text-slate-600 hover:text-emerald-400 cursor-help" />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-700">
                            해당 자치구의 평균 식비 및 배달 물가를 반영한 실질 생활비 지표입니다.
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-200">{formatWon(res.livingCost)}</span>
                      </div>

                      <div className="flex items-center justify-between group relative">
                        <div className="flex items-center text-xs text-slate-400">
                          <Clock className="w-3 h-3 mr-2 text-rose-500" />
                          시간 기회비용
                          <HelpCircle className="w-3 h-3 ml-1 text-slate-600 hover:text-rose-400 cursor-help" />
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-700">
                            통근 시간(왕복) × 나의 시급(월급/209h) × 22일로 계산한 노동 가치 환산 금액입니다.
                          </div>
                        </div>
                        <span className="text-xs font-bold text-rose-400/80">{formatWon(res.opportunityCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-950/50">
          <div className="text-[10px] text-slate-600 font-mono text-center tracking-tight">
            LCI ENGINE v1.0 • JAVA 25 & REACT 19 HYBRID
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-slate-950">
        <KakaoMap />

        {/* Floating Metrics Overlay */}
        <div className="absolute top-8 right-8 space-y-4 z-20 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl max-w-sm pointer-events-auto">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <TrendingUp className="w-3 h-3 mr-2 text-blue-400" /> 실시간 분석 리포트
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">기준 거점</span>
                <span className="text-white font-bold">{preferences.workplace}</span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="text-xs text-slate-400 leading-relaxed italic">
                "현재 설정된 {formatWon(preferences.targetSavings)}의 저축 목표를 달성하기 위해, 서울 내 주요 '구'별 생활 물가 지수를 비교 중입니다."
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
