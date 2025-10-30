import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

// Lightweight SVG Pie chart component (no external deps)
function PieChart({ data, colors, size = 200, strokeWidth = 30 }) {
  const total = Object.values(data).reduce((s, v) => s + (v || 0), 0) || 1; // avoid div by 0
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const slices = Object.keys(data).map((key, i) => {
    const value = data[key] || 0;
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
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g>
        {/* background ring */}
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        {slices}
      </g>
    </svg>
  );
}

export default function AgentPieChart() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ available: 0, rejected: 0, sold: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/backend/agent/stats`, { credentials: "include" });
        if (!res.ok) {          const txt = await res.text();
          throw new Error(`Server responded ${res.status}: ${txt}`);
        }
        const json = await res.json();
      
        if (json?.stats) {
          setStats({
            available: json.stats.available || 0,
            rejected: json.stats.rejected || 0,
            sold: json.stats.sold || 0,
          });
        } else if (json?.available !== undefined) {
          setStats({
            available: json.available || 0,
            rejected: json.rejected || 0,
            sold: json.sold || 0,
          });
        } else {
          
          if (Array.isArray(json.cars)) {
            const counts = { available: 0, rejected: 0, sold: 0 };
            for (const c of json.cars) {
              if (c.status === "available") counts.available++;
              else if (c.status === "rejected") counts.rejected++;
              else if (c.status === "sold") counts.sold++;
            }
            setStats(counts);
          } else {
            throw new Error("Unexpected API response shape — /backend/agent/stats expected");
          }
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

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-6 sm:p-12 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Agent — Cars Overview</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm"
          >
            Back
          </button>
        </div>

        <div className="bg-[#121826] border border-gray-700 p-6 rounded-xl shadow-md">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-gray-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-3">{error}</p>
              <p className="text-sm text-gray-300">If this endpoint isn't available, request the backend to add <code>/backend/agent/stats</code> which returns counts for the logged-in agent.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <PieChart
                  data={{ available: stats.available, rejected: stats.rejected, sold: stats.sold }}
                  colors={["#16a34a", "#ef4444", "#f59e0b"]}
                  size={220}
                  strokeWidth={36}
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
          )}
        </div>
      </div>
    </div>
  );
}
