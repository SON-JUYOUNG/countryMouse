import { useState, useEffect } from 'react'
import KakaoMap from "./components/KakaoMap"

function App() {
  const [backendStatus, setBackendStatus] = useState<any>(null)

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => console.error("Backend fetch error:", err));
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar - Controls & Inputs */}
      <aside className="w-96 flex-shrink-0 bg-slate-800/90 backdrop-blur-md border-r border-slate-700 flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            LCI PLATFORM
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Financial Lifestyle Planner
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status Card */}
          <div className={`p-4 rounded-xl border ${backendStatus ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${backendStatus ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-sm font-bold text-slate-200">System Status</span>
            </div>
            {backendStatus ? (
              <div className="text-xs font-mono text-emerald-400/80">
                Spring Boot {backendStatus.version} • Java {backendStatus.java} <br />
                Status: {backendStatus.status}
              </div>
            ) : (
              <div className="text-xs text-rose-400">Backend Disconnected</div>
            )}
          </div>

          {/* Input Section Placeholder */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Simulation Settings</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Monthly Income (₩)</label>
              <input type="number" placeholder="3,000,000" className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Workplace Location</label>
              <input type="text" placeholder="Gangnam Station..." className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 mt-4">
              Run Simulation
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="text-[10px] text-slate-500 font-mono text-center">
            Powered by Java 25 & React 19
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-slate-900">
        {import.meta.env.VITE_KAKAO_MAP_KEY ? (
          <KakaoMap />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-rose-500 font-mono bg-rose-500/10 px-6 py-4 rounded-xl border border-rose-500/20">
              ⚠️ Kakao Map API Key Missing
            </div>
          </div>
        )}

        {/* Floating Overlay Example */}
        <div className="absolute top-6 right-6 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl max-w-xs z-20">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Selected Region</h4>
          <div className="text-lg font-bold text-white">Seoul, South Korea</div>
          <div className="text-xs text-slate-500">Wait for selection...</div>
        </div>
      </main>
    </div>
  )
}

export default App
