import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Pie chart with mouse interactions and tooltip
function PieChart({ data, colors, size = 220, strokeWidth = 36, onHoverSlice }) {
  const total = Object.values(data).reduce((s, v) => s + (v || 0), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g>
        {/* background ring */}
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="#0f1724"
          strokeWidth={strokeWidth}
        />
        {Object.keys(data).map((key, i) => {
          const value = data[key] || 0;
          // Skip rendering if value is 0
          if (value === 0) return null;
          const portion = value / total;
          const dash = portion * circumference;
          const dashOffset = offset;
          offset += dash;
          return (
            <circle
              key={key}
              r={radius}
              cx={size / 2}
              cy={size / 2}
              fill="transparent"
              stroke={colors[i % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              onMouseEnter={(e) => onHoverSlice && onHoverSlice(key, value, e)}
              onMouseMove={(e) => onHoverSlice && onHoverSlice(key, value, e)}
              onMouseLeave={() => onHoverSlice && onHoverSlice(null, null, null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </g>
    </svg>
  );
}

// Simple bar chart for the last 6 months
function BarsChart({ data, metric, colors, height = 160, onHoverBar }) {
  // data: array [{ label, revenue, available, rejected, sold }]
  const values = data.map((d) => d[metric] || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-[200px]">
        {data.map((d, i) => {
          const v = d[metric] || 0;
          const hPercent = (v / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col-reverse items-center">
              <div className="text-xs text-gray-300 mb-2">{metric === 'revenue' ? `₹${(d.revenue||0).toLocaleString()}` : (d[metric] ?? 0)}</div>
              <div
                className="w-full rounded-t-md transition-all hover:opacity-90"
                style={{ height: `${hPercent}%`, background: colors[i % colors.length], minHeight: v > 0 ? "150px" : "0px" }}
                onMouseEnter={(e) => onHoverBar && onHoverBar(d, e)}
                onMouseMove={(e) => onHoverBar && onHoverBar(d, e)}
                onMouseLeave={() => onHoverBar && onHoverBar(null, null)}
              />
              <div className="text-xs text-gray-300 mt-2 text-center">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Agent Leaderboard Component (overall best performer across categories)
function AgentLeaderboard({ agents }) {
  const maxRevenue = Math.max(...agents.map(a => Number(a.revenue || 0)), 1);
  const maxSold = Math.max(...agents.map(a => Number(a.soldCars || 0)), 1);
  const maxApproved = Math.max(...agents.map(a => Number(a.availableCars || 0)), 1);
  const maxRejected = Math.max(...agents.map(a => Number(a.rejectedCars || 0)), 1);

  const scoreFor = (agent) => {
    const revN = Number(agent.revenue || 0) / maxRevenue;        // 0..1
    const soldN = Number(agent.soldCars || 0) / maxSold;         // 0..1
    const apprN = Number(agent.availableCars || 0) / maxApproved;// 0..1
    const rejN = Number(agent.rejectedCars || 0) / maxRejected;  // 0..1
    const srN = Number(agent.successRate || 0) / 100;            // 0..1
    // Weighted composite: emphasize revenue and sold, include approvals & success rate, penalize rejections
    const composite = (revN * 0.45) + (soldN * 0.30) + (srN * 0.15) + (apprN * 0.10) - (rejN * 0.10);
    return Math.max(composite, 0); // clamp minimum at 0
  };

  const sortedAgents = [...agents].sort((a, b) => scoreFor(b) - scoreFor(a));
  const topScore = Math.max(...sortedAgents.map(scoreFor), 0.0001);

  return (
    <div className="space-y-3">
      {sortedAgents.map((agent, idx) => {
        const score = scoreFor(agent);
        const pct = Math.round(score * 100);
        const relPct = Math.round((score / topScore) * 100);
        const isTop1 = idx === 0;
        const isTop2 = idx === 1;
        const cardClasses = `relative rounded-lg p-4 flex items-center gap-4 border transition-all duration-300 ${
          isTop1
            ? 'bg-gradient-to-br from-yellow-500/15 via-amber-400/10 to-yellow-300/10 border-yellow-400/60 shadow-[0_0_22px_rgba(234,179,8,0.25)]'
            : isTop2
            ? 'bg-gradient-to-br from-blue-300/15 via-slate-200/10 to-blue-200/10 border-blue-300/60 shadow-[0_0_20px_rgba(147,197,253,0.25)]'
            : 'bg-[#0f1724] border-gray-700'
        }`;
        const rankClasses = `flex items-center justify-center shrink-0 rounded-full font-semibold ${
          isTop1 ? 'w-12 h-12 bg-yellow-400 text-black' : isTop2 ? 'w-11 h-11 bg-blue-300 text-black' : 'w-10 h-10 bg-gray-800 text-white'
        }`;
        return (
          <div key={agent._id || agent.email || idx} className={cardClasses}>
            {isTop1 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full shadow">Top Performer</div>
            )}
            {isTop2 && (
              <div className="absolute -top-2 -right-2 bg-blue-300 text-black text-xs px-2 py-1 rounded-full shadow">Second Place</div>
            )}

            <div className={rankClasses}>{idx + 1}</div>
            <div className="flex items-center gap-4 flex-1">
              <img
                src={agent.avatar || ''}
                alt={agent.name}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-10 h-10 rounded-full object-cover border border-gray-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="font-semibold text-white truncate flex items-center gap-2">
                      {agent.name}
                      {isTop1 && (
                        <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3 6 6 .9-4.5 4.2 1.1 6.9L12 17l-5.6 3.9 1.1-6.9L3 8.9 9 8l3-6z" />
                        </svg>
                      )}
                      {isTop2 && (
                        <svg className="w-5 h-5 text-blue-300" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l4 8 8 1-6 6 1.5 9L12 21l-7.5 5 1.5-9-6-6 8-1 4-8z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 truncate">{agent.email}</div>
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="text-gray-400 mr-1">Performance Score:</span>
                    <span className="font-medium text-white">{pct}/100</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-800 rounded">
                    <div className="h-2 rounded" style={{
                      width: `${relPct}%`,
                      background: isTop1
                        ? 'linear-gradient(90deg, #f59e0b, #facc15, #fde047)'
                        : isTop2
                        ? 'linear-gradient(90deg, #cbd5e1, #93c5fd, #bfdbfe)'
                        : 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                    }} />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-gray-400">
                    <div>Revenue: <span className="text-white">₹{Number(agent.revenue || 0).toLocaleString()}</span></div>
                    <div>Sold: <span className="text-white">{agent.soldCars}</span></div>
                    <div>Approved: <span className="text-white">{agent.availableCars}</span></div>
                    <div>Rejected: <span className="text-white">{agent.rejectedCars}</span></div>
                  </div>
                  <div className="mt-3 text-xs text-gray-300">
                    Overall Rank: <span className="font-semibold text-white">#{idx + 1}</span> of <span className="font-semibold text-white">{sortedAgents.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentPieChart() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ available: 0, rejected: 0, sold: 0 });
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("revenue"); // revenue | available | sold | rejected
  const [leaderboardAgents, setLeaderboardAgents] = useState([]);
  const [lbError, setLbError] = useState(null);
  const [lbLoading, setLbLoading] = useState(false);

  // tooltip state
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: "" });
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/backend/agent/stats`, { credentials: "include" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server responded ${res.status}: ${txt}`);
        }
        const json = await res.json();
        // debug: log backend response for troubleshooting
        console.debug("/backend/agent/stats ->", json);
        if (json?.stats) {
          setStats(json.stats);
        }
        if (Array.isArray(json.monthly)) {
          setMonthly(json.monthly);
        } else if (Array.isArray(json.data)) {
          // fallback if backend uses a different key
          setMonthly(json.data);
        }
      } catch (err) {
        console.error("Error fetching agent stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLbLoading(true);
        const res = await fetch(`/backend/agent/leaderboard`, { credentials: "include" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server responded ${res.status}: ${txt}`);
        }
        const json = await res.json();
        console.debug("/backend/agent/leaderboard ->", json);
        setLeaderboardAgents(Array.isArray(json.agents) ? json.agents : []);
      } catch (err) {
        console.error("Error fetching agent leaderboard:", err);
        setLbError(err.message);
      } finally {
        setLbLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const total = Object.values(stats).reduce((s, v) => s + v, 0);

  const colors = ["#16a34a", "#ef4444", "#f59e0b", "#3b82f6", "#06b6d4", "#7c3aed"];

  const handleSliceHover = (key, value, e) => {
    if (!e) return setTooltip({ show: false, x: 0, y: 0, content: "" });
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0) + 8;
    const y = e.clientY - (rect?.top || 0) + 8;
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    const labels = { available: "Accepted", rejected: "Rejected", sold: "Sold" };
    setTooltip({ show: true, x, y, content: `${labels[key]}: ${value} (${pct}%)` });
  };

  const handleBarHover = (d, e) => {
    if (!d || !e) return setTooltip({ show: false, x: 0, y: 0, content: "" });
    const rect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (rect?.left || 0) + 8;
    const y = e.clientY - (rect?.top || 0) - 28;
    const content = `${d.label}: ${metric === "revenue" ? `₹${d.revenue?.toLocaleString()}` : d[metric]}`;
    setTooltip({ show: true, x, y, content });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0b1220] text-white pt-36 sm:pt-40 p-6 sm:p-12 font-inter">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Agent — Cars Overview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-[#121826] border border-gray-700 p-6 rounded-xl shadow-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-gray-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-3">{error}</p>
              <p className="text-sm text-gray-300">If this endpoint isn't available or you are unauthorized, ensure you are logged in as an agent and the backend route <code>/backend/agent/stats</code> exists.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <PieChart
                    data={{ available: stats.available, rejected: stats.rejected, sold: stats.sold }}
                    colors={["#16a34a", "#ef4444", "#f59e0b"]}
                    size={220}
                    strokeWidth={36}
                    onHoverSlice={handleSliceHover}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-300 mb-4">Total cars (assigned to you): <span className="font-bold text-white">{total}</span></p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-[#0f1724] border border-gray-700 flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <div className="text-sm text-gray-300">Accepted</div>
                        <div className="font-semibold text-white">{stats.available}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0f1724] border border-gray-700 flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <div>
                        <div className="text-sm text-gray-300">Rejected</div>
                        <div className="font-semibold text-white">{stats.rejected}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0f1724] border border-gray-700 flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div>
                        <div className="text-sm text-gray-300">Sold</div>
                        <div className="font-semibold text-white">{stats.sold}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls for metric */}
              <div className="mt-8 flex items-center justify-between">
                <h4 className="text-lg font-semibold">Last 6 months</h4>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300">Metric:</label>
                  <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-[#0b1220] border border-gray-700 text-white px-3 py-1 rounded">
                    <option value="revenue">Revenue</option>
                    <option value="available">Approved</option>
                    <option value="sold">Sold</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Bars chart */}
              <div className="mt-4">
                <BarsChart data={monthly} metric={metric} colors={colors} onHoverBar={handleBarHover} />
              </div>

              {/* Tooltip */}
              {tooltip.show && (
                <div style={{ left: tooltip.x, top: tooltip.y }} className="absolute z-50 pointer-events-none bg-black/80 text-white px-3 py-2 rounded text-sm">
                  {tooltip.content}
                </div>
              )}
            </>
          )}
        </div>

        {/* Agent Leaderboard Section — below the overview */}
        <div className="mt-6 bg-[#121826] border border-gray-700 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M9 3v18m6-18v18M5 21h14" />
            </svg>
            Agent Leaderboard — Overall Best Performers
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Ranked by a composite performance score across revenue, sold, approvals, success rate, and rejections.
          </p>
          {lbLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-yellow-400 border-gray-600"></div>
            </div>
          ) : lbError ? (
            <div className="text-sm text-gray-300">{lbError}. Ensure backend route <code>/backend/agent/leaderboard</code> exists and you are authenticated.</div>
          ) : (
            <AgentLeaderboard agents={leaderboardAgents} />
          )}
        </div>
      </div>
    </div>
  );
}
