import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Registration Chart Component
function RegistrationChart({ data }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          afterBody: function(tooltipItems) {
            const dataPoint = data[tooltipItems[0].dataIndex];
            return `Change from last month: ${dataPoint.percentChange > 0 ? '+' : ''}${dataPoint.percentChange}%`;
          }
        }
      }
    },
    scales: {
      y: {
        stacked: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'New Registrations',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(99, 102, 241, 0.9)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
      }
    ]
  };

  return (
    <div className="h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
}

// Agent Performance Chart
function AgentPerformanceChart({ agents, metric }) {
  // Raw values per agent for selected metric
  const getRawValue = (agent, metric) => {
    if (metric === 'revenue') return Number(agent.revenue || 0); // raw currency
    if (metric === 'successRate') return Number(agent.successRate || 0); // percent
    return Number(agent[metric] || 0);
  };

  const rawValues = agents.map(a => getRawValue(a, metric));
  const maxRaw = Math.max(...rawValues, 1);

  // Determine y-axis max and tick formatting based on metric
  const yAxisMax = metric === 'successRate' ? 100 : Math.ceil(maxRaw * 1.1);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const idx = context.dataIndex;
            const raw = rawValues[idx];
            const pct = ((raw / Math.max(maxRaw, 1)) * 100).toFixed(1);
            if (metric === 'revenue') {
              return `Revenue: ₹${raw.toLocaleString()} (${pct}% of max)`;
            }
            if (metric === 'successRate') {
              return `Success Rate: ${raw}% (${pct}% of max)`;
            }
            return `${context.dataset.label}: ${raw} (${pct}% of max)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'white' }
      },
      y: {
        beginAtZero: true,
        max: yAxisMax,
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: {
          color: 'white',
          callback: function(value) {
            if (metric === 'revenue') return `₹${Number(value).toLocaleString()}`;
            if (metric === 'successRate') return `${value}%`;
            return Number(value);
          }
        }
      }
    }
  };

  const metricLabels = {
    'revenue': 'Revenue',
    'availableCars': 'Available Cars',
    'soldCars': 'Sold Cars',
    'rejectedCars': 'Rejected Cars',
    'successRate': 'Success Rate'
  };

  const chartData = {
    labels: agents.map(a => a.name),
    datasets: [
      {
        label: metricLabels[metric],
        data: rawValues,
        backgroundColor: metric === 'revenue' ? 'rgba(52, 211, 153, 0.9)' :
                         metric === 'soldCars' ? 'rgba(59, 130, 246, 0.9)' :
                         metric === 'rejectedCars' ? 'rgba(239, 68, 68, 0.9)' :
                         metric === 'availableCars' ? 'rgba(245, 158, 11, 0.9)' :
                         'rgba(139, 92, 246, 0.9)',
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
}

// Agent Leaderboard Component (overall best performer across categories)
function AgentLeaderboard({ agents }) {
  const maxRevenue = Math.max(...agents.map(a => Number(a.revenue || 0)), 1);
  const maxSold = Math.max(...agents.map(a => Number(a.soldCars || 0)), 1);
  const maxApproved = Math.max(...agents.map(a => Number(a.availableCars || 0)), 1);
  const maxRejected = Math.max(...agents.map(a => Number(a.rejectedCars || 0)), 1);

  // Composite performance score (0–1) across key categories
  const scoreFor = (a) => {
    const revenue = Number(a.revenue || 0) / maxRevenue;        // activity + business impact
    const sold = Number(a.soldCars || 0) / maxSold;             // outcome volume
    const approved = Number(a.availableCars || 0) / maxApproved;// pipeline strength
    const success = Math.min(1, Math.max(0, Number(parseFloat(a.successRate) || 0) / 100)); // quality
    const rejected = Number(a.rejectedCars || 0) / maxRejected; // penalty

    // Weights tuned for balanced influence of scale and quality
    const score = 0.45 * revenue + 0.30 * sold + 0.15 * success + 0.10 * approved - 0.10 * rejected;
    return Math.max(0, Math.min(1, score));
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
          <div key={agent._id} className={cardClasses}>
            {isTop1 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full shadow">Top Performer</div>
            )}
            {isTop2 && (
              <div className="absolute -top-2 -right-2 bg-blue-300 text-black text-xs px-2 py-1 rounded-full shadow">Runner-up</div>
            )}
            <div className={rankClasses}>{idx + 1}</div>
            <div className="flex items-center gap-4 w-full">
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

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch('/backend/admin/analytics', { credentials: 'include' });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch analytics data: ${errorText}`);
        }
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Unknown error');
        setData(json);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1220] text-white pt-36 sm:pt-40 p-6 sm:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Admin Analytics Dashboard
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Back
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-gray-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-3">{error}</p>
          </div>
        ) : data && (
          <div className="space-y-8">
            {/* Overall Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                <h3 className="text-gray-400">Total Revenue</h3>
                <p className="text-2xl font-semibold mt-2 text-blue-400">₹{data.metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
                <h3 className="text-gray-400">Total Agents</h3>
                <p className="text-2xl font-semibold mt-2 text-green-400">{data.metrics.totalAgents}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                <h3 className="text-gray-400">Cars Sold</h3>
                <p className="text-2xl font-semibold mt-2 text-yellow-400">{data.metrics.totalSold}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-gray-400">Avg. Success Rate</h3>
                <p className="text-2xl font-semibold mt-2 text-purple-400">{data.metrics.averageSuccessRate}%</p>
              </div>
            </div>

            {/* New User Registrations Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                New User Registrations
              </h2>
              <div className="text-sm text-gray-400 mb-4">
                Shows the number of new users registered over the last 6 months
              </div>
              <RegistrationChart data={data.registrations} />
            </div>

            {/* Agent Performance Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Agent Performance
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Compare agent performance across different metrics
                  </p>
                </div>
                <select 
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="revenue">Revenue</option>
                  <option value="availableCars">Approved Cars</option>
                  <option value="soldCars">Sold Cars</option>
                  <option value="rejectedCars">Rejected Cars</option>
                  <option value="successRate">Success Rate</option>
                </select>
              </div>
              <AgentPerformanceChart 
                agents={data.agents} 
                metric={selectedMetric}
              />
            </div>

            {/* Agent Leaderboard Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M9 3v18m6-18v18M5 21h14" />
                </svg>
                Agent Leaderboard — Overall Best Performers
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Ranked by a composite performance score across revenue, sold, approvals, success rate, and rejections.
              </p>
              <AgentLeaderboard agents={data.agents} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}