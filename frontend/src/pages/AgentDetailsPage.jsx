import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AgentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/backend/agent/detailed/${id}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        
        const data = await res.json();
        
        if (!data.success) {
          setError(data.message || 'Failed to fetch agent details');
          return;
        }
        
        setAgentData(data);
      } catch (err) {
        setError('Failed to fetch agent details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/40">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin-details')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Back to Admin Details
          </button>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return null;
  }

  const { agent, stats, vehicleTypeBreakdown, carsList } = agentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 lg:p-6">
      <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-700 mt-20">
        {/* Header with agent info */}
        <div className="mb-8 pb-6 border-b border-gray-700">
          <button
            onClick={() => navigate('/admin-details')}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600 transition-colors"
          >
            ← Back
          </button>
          
          <div className="flex items-center gap-4">
            {agent.avatar && (
              <img
                src={agent.avatar}
                alt={agent.username}
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{agent.username}</h1>
              <p className="text-gray-400">{agent.email}</p>
              <p className="text-sm text-gray-500">
                Joined: {new Date(agent.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total Cars" value={stats.totalCars} color="gray" />
          <StatCard label="Approved" value={stats.approvedCars} color="green" />
          <StatCard label="Rejected" value={stats.rejectedCars} color="red" />
          <StatCard label="Pending" value={stats.pendingCars} color="yellow" />
          <StatCard label="Verification" value={stats.verificationCars} color="blue" />
          <StatCard label="Sold" value={stats.soldCars} color="purple" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Approval Rate</p>
            <p className="text-3xl font-bold text-green-400">{stats.approvalRate}%</p>
          </div>
          <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Rejection Rate</p>
            <p className="text-3xl font-bold text-red-400">{stats.rejectionRate}%</p>
          </div>
          <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-green-500">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {['overview', 'approved', 'rejected', 'sold'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-gray-700 text-gray-200 border-gray-600'
              } px-4 py-2 rounded-lg border transition-all whitespace-nowrap`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Vehicle Type Breakdown */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Vehicle Type Breakdown (Approved)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.keys(vehicleTypeBreakdown).length > 0 ? (
                  Object.entries(vehicleTypeBreakdown).map(([type, count]) => (
                    <div
                      key={type}
                      className="bg-gray-900/40 rounded-lg p-4 border border-gray-700 text-center"
                    >
                      <p className="text-gray-400 text-sm capitalize">{type}</p>
                      <p className="text-2xl font-bold text-blue-400">{count}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 col-span-full">No approved cars yet</p>
                )}
              </div>
            </div>

            {/* Recent Rejections Summary */}
            {carsList.rejected.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Recent Rejections ({carsList.rejected.length})</h3>
                <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                        <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Reason</th>
                        <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carsList.rejected.slice(0, 5).map((rejection) => (
                        <tr key={rejection._id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                            {rejection.brand} {rejection.model}
                            <br />
                            <span className="text-xs text-gray-500">{rejection.carNumber}</span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-red-400 text-sm">
                            {rejection.reason}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                            {new Date(rejection.rejectedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Approved Cars ({carsList.approved.length})</h3>
            <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Price</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Listed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.approved.length > 0 ? (
                    carsList.approved.map((car) => (
                      <tr key={car._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                          {car.brand} {car.model}
                          <br />
                          <span className="text-xs text-gray-500">{car.carNumber}</span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-semibold">
                          ₹{car.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                          {new Date(car.listedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6 px-4 text-center text-gray-400">
                        No approved cars
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rejected' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Rejected Cars ({carsList.rejected.length})</h3>
            <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Rejection Reason</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Rejected Date</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.rejected.length > 0 ? (
                    carsList.rejected.map((car) => (
                      <tr key={car._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                          {car.brand} {car.model}
                          <br />
                          <span className="text-xs text-gray-500">{car.carNumber}</span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-red-300 text-sm">
                          {car.reason}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                          {new Date(car.rejectedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6 px-4 text-center text-gray-400">
                        No rejected cars
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sold' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Sold Cars ({carsList.sold.length})</h3>
            <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Price</th>
                    <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sold Date</th>
                  </tr>
                </thead>
                <tbody>
                  {carsList.sold.length > 0 ? (
                    carsList.sold.map((car) => (
                      <tr key={car._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                          {car.brand} {car.model}
                          <br />
                          <span className="text-xs text-gray-500">{car.carNumber}</span>
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-purple-400 font-semibold">
                          ₹{car.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                          {new Date(car.soldAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6 px-4 text-center text-gray-400">
                        No sold cars
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    gray: 'text-gray-300',
  };

  return (
    <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700 text-center">
      <p className="text-xs sm:text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold ${colorClasses[color] || colorClasses.gray}`}>
        {value}
      </p>
    </div>
  );
};

export default AgentDetailsPage;
