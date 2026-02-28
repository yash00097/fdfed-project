import React, { useState, useEffect } from 'react';

const AdminTestDriveManagement = () => {
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const fetchTestDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/backend/testdrive/all', {
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setTestDrives(data.testDrives);
      } else {
        setError(data.message || 'Failed to fetch test drives');
      }
    } catch (err) {
      setError('Failed to fetch test drives');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'rejected': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const filteredTestDrives = testDrives.filter(td => {
    if (activeTab === 'pending') return td.status === 'pending';
    if (activeTab === 'accepted') return td.status === 'accepted';
    if (activeTab === 'completed') return td.status === 'completed';
    if (activeTab === 'rejected') return td.status === 'rejected';
    if (activeTab === 'cancelled') return td.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading test drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 lg:p-6 mt-20">
      <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-2">Test Drive Overview</h1>
        <p className="text-gray-400 text-sm mb-6">
          Monitor all test drive requests. Only assigned agents can approve, reject, or complete test drives.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-gray-700 text-gray-200 border-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({testDrives.filter(td => td.status === tab).length})
            </button>
          ))}
        </div>

        {/* Test Drives Table */}
        {filteredTestDrives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No {activeTab} test drives</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Buyer</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Agent</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Requested Date</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Location</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Status</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestDrives.map((testDrive) => (
                  <tr key={testDrive._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                      {testDrive.car.brand} {testDrive.car.model}
                      <br />
                      <span className="text-xs text-gray-500">{testDrive.car.carNumber}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                      {testDrive.buyer.username}
                      <br />
                      <span className="text-xs text-gray-500">{testDrive.buyer.email}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                      {testDrive.agent?.username || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {new Date(testDrive.requestedDateTime).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(testDrive.requestedDateTime).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {testDrive.location}
                    </td>
                    <td className={`py-3 px-4 border-b border-gray-800 font-semibold ${getStatusColor(testDrive.status)}`}>
                      {testDrive.status.toUpperCase()}
                      {testDrive.rejectionReason && (
                        <div className="text-xs text-red-400 mt-1 font-normal">
                          Reason: {testDrive.rejectionReason}
                        </div>
                      )}
                      {testDrive.cancellationReason && (
                        <div className="text-xs text-gray-400 mt-1 font-normal">
                          Cancelled: {testDrive.cancellationReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {testDrive.notes || 'No notes'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestDriveManagement;
