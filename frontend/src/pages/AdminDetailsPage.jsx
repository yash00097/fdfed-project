import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const AdminDetailsPage = () => {
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDetails = useCallback(async (opts = { showLoading: false }) => {
    try {
      if (opts.showLoading) setLoading(true);
      setError(null);

      // Cache busting with timestamp and ensure credentials are sent
      const res = await fetch(`/backend/admin/details?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success) {
        setAgents(data.agents);
        setUsers(data.users);
        setLastUpdated(new Date());
      } else {
        setError(data.message || 'Failed to fetch details');
      }
    } catch (err) {
      setError('Failed to fetch details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load with spinner
    fetchDetails({ showLoading: true });

    // Poll every 10s for live updates
    let intervalId = setInterval(() => fetchDetails(), 10000);

    // Pause polling when tab is hidden; resume on focus
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(intervalId);
      } else {
        // Fetch immediately on return and restart interval
        fetchDetails();
        intervalId = setInterval(() => fetchDetails(), 10000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/40">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 lg:p-6">
      <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-700 mt-30">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Admin Details</h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs sm:text-sm text-gray-400">
                Last updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchDetails()}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('agents')}
            className={`${
              activeTab === 'agents'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-gray-700 text-gray-200 border-gray-600'
            } px-4 py-2 rounded-lg border transition-all hover:scale-[1.02]`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-gray-700 text-gray-200 border-gray-600'
            } px-4 py-2 rounded-lg border transition-all hover:scale-[1.02]`}
          >
            Users
          </button>
        </div>

        {/* Agents Table */}
        {activeTab === 'agents' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Agents</h2>
            <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Email</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Approved</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Rejected</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Pending</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Revenue</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Approval %</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-800 text-gray-200">{agent.email}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-gray-200">{agent.name}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-blue-400 font-medium">{agent.approvedCars}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-red-400 font-medium">{agent.rejectedCars}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-yellow-300 font-medium">{agent.pendingCars}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-semibold">₹{agent.revenue}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-purple-300 font-medium">{agent.approvePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Users</h2>
            <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Email</th>
                   
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sell Requests</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Bought Cars</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Requested Cars</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sold Revenue</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Bought Revenue</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 border-b border-gray-800 text-gray-200">{user.email}</td>
                      
                      <td className="py-3 px-4 border-b border-gray-800 text-gray-200">{user.name}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-blue-400 font-medium">{user.sellRequests}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-medium">{user.boughtCars}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-yellow-300 font-medium">{user.requestedCars}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-purple-300 font-semibold">₹{user.soldRevenue}</td>
                      <td className="py-3 px-4 border-b border-gray-800 text-purple-300 font-semibold">₹{user.boughtRevenue}</td>
                      <td className="py-3 px-4 border-b border-gray-800">
                        <Link
                          to={`/user/${user._id}`}
                          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDetailsPage;
