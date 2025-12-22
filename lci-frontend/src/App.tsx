import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import KakaoMap from "./components/KakaoMap"

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState<any>(null)

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => console.error("Backend fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
      <div className="flex justify-center space-x-8 mb-12">
        <a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={viteLogo} className="w-32 h-32 drop-shadow-[0_0_2rem_#646cffaa]" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
          <img src={reactLogo} className="w-32 h-32 drop-shadow-[0_0_2rem_#61dafbaa]" alt="React logo" />
        </a>
      </div>

      <h1 className="text-6xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
        LCI PLATFORM
      </h1>

      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Interactive Counter: {count}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${backendStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h2 className="text-lg font-medium text-slate-300">Backend Connectivity</h2>
          </div>

          {backendStatus ? (
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl font-mono text-xs overflow-auto">
              <pre className="text-emerald-400">{JSON.stringify(backendStatus, null, 2)}</pre>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl animate-pulse">
              <p className="text-slate-500 text-center text-sm font-mono italic">Waiting for Java 25 + Spring Boot 4.0...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Interactive Map Area</h2>
        {/* Only render map if env key is present to avoid errors if key is missing */}
        {import.meta.env.VITE_KAKAO_MAP_KEY ? (
          <KakaoMap />
        ) : (
          <div className="text-center text-red-400">Kakao API Key is missing in .env</div>
        )}
      </div>

      <p className="mt-12 text-slate-500 text-sm font-medium">
        Tech Architecture: Java 25 LTS | Spring Boot 4.0 | React 19 | Tailwind 4
      </p>
    </div>
  )
}

export default App
