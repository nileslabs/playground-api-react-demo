import { useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "@/api/client";

export function Header({ onToggleSidebar }) {
  const [resetting, setResetting] = useState(false);
  const [sessionToken] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("pg_identity") || "session-active"
      : "session-active",
  );
  const [delay, setDelay] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("playground_simulated_delay") || "0"
      : "0",
  );

  const handleResetSandbox = async () => {
    if (
      !window.confirm("Reset all sandbox mutations to pristine baseline data?")
    )
      return;
    setResetting(true);
    try {
      await apiRequest("/session/reset", { method: "DELETE" });
      localStorage.removeItem("pg_identity");
      window.location.reload();
    } catch {
      alert("Reset complete. Reloading...");
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  const handleDelayChange = (e) => {
    const val = e.target.value;
    setDelay(val);
    localStorage.setItem("playground_simulated_delay", val);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c0e14]/90 backdrop-blur-md border-b border-white/10 shadow-xs transition-all">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Workspace Title */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Pulse Studio
                </span>
                <span className="hidden xs:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  React 19 Showcase
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Right: Sandbox Status, Delay Sim, Reset, Docs Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Sandbox Session Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Sandbox:</span>
            <span className="text-slate-200 truncate max-w-24">
              {sessionToken.length > 12
                ? `${sessionToken.slice(0, 10)}...`
                : sessionToken}
            </span>
          </div>

          {/* Network Latency Simulator Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-xl text-xs">
            <span className="text-slate-400 hidden sm:inline">Delay:</span>
            <select
              value={delay}
              onChange={handleDelayChange}
              className="bg-transparent text-emerald-400 font-mono text-xs focus:outline-none cursor-pointer"
              title="Simulate network latency with X-Simulate-Delay header"
            >
              <option value="0" className="bg-[#12151d] text-white">
                0ms (Fast)
              </option>
              <option value="500" className="bg-[#12151d] text-white">
                500ms (4G)
              </option>
              <option value="1500" className="bg-[#12151d] text-white">
                1500ms (3G)
              </option>
            </select>
          </div>

          {/* Reset Sandbox Button */}
          <button
            type="button"
            onClick={handleResetSandbox}
            disabled={resetting}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reset your session overlay to pristine seed data (DELETE /session/reset)"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">
              {resetting ? "Resetting..." : "Reset Sandbox"}
            </span>
          </button>

          {/* Docs Direct Link */}
          <a
            href="https://playground.nileslabs.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1"
          >
            <span>Docs</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
