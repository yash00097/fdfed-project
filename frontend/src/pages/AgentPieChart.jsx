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

export default function AgentPieChart() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ available: 0, rejected: 0, sold: 0 });
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("revenue"); // revenue | available | sold | rejected

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
      </div>
    </div>
  );
}
