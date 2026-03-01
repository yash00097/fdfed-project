import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AgentPendingTestDriveRequests = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agent') return;
    fetchPendingRequests();
  }, [currentUser]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/backend/testdrive/agent/pending', {
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        setTestDrives(data.testDrives);
      } else {
        setError(data.message || 'Failed to fetch pending test drive requests');
      }
    } catch (err) {
      setError('Failed to fetch pending test drive requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (testDriveId) => {
    try {
      setIsProcessing(true);

      const res = await fetch(`/backend/testdrive/${testDriveId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        alert('Test drive accepted successfully. It is now in your assigned test drives.');
        fetchPendingRequests();
      } else {
        console.error('Backend error:', data);
        alert(data.message || 'Failed to accept test drive request');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to accept test drive request. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser || currentUser.role !== 'agent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg">Access denied. Agent role required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 lg:p-6 mt-20">
      <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-2">Pending Test Drive Requests</h1>
        <p className="text-gray-400 mb-6">All agents can view these. Once you accept, only you can continue processing.</p>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {testDrives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No pending test drive requests</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Buyer</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Requested Date</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Location</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Notes</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {testDrives.map((testDrive) => (
                  <tr key={testDrive._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                      {testDrive.car.brand} {testDrive.car.model}
                      <br />
                      <span className="text-xs text-gray-500">{testDrive.car.carNumber}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-200">
                      {testDrive.buyer.username}
                      <br />
                      <span className="text-xs text-gray-500">{testDrive.buyer.mobileNumber || 'No phone'}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {new Date(testDrive.requestedDateTime).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {testDrive.location}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm max-w-xs truncate" title={testDrive.notes || 'No notes'}>
                      {testDrive.notes || 'No notes'}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800">
                      <button
                        onClick={() => handleAccept(testDrive._id)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Accepting...' : 'Accept'}
                      </button>
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

export default AgentPendingTestDriveRequests;
