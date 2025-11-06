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
              return `Revenue: ₹${raw.toLocaleString('en-IN')} (${pct}% of max)`;
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
            if (metric === 'revenue') return `₹${Number(value).toLocaleString('en-IN')}`;
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
                <p className="text-2xl font-semibold mt-2 text-blue-400">₹{data.metrics.totalRevenue.toLocaleString('en-IN')}</p>
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
          </div>
        )}
      </div>
    </div>
  );
}