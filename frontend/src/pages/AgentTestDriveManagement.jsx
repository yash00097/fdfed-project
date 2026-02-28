import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';

const AgentTestDriveManagement = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('accepted');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agent') return;
    fetchTestDrives();
  }, [currentUser]);

  const fetchTestDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/backend/testdrive/agent/list', {
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

  const handleReject = (testDrive) => {
    if (testDrive.status === 'accepted') {
      setSelectedTestDrive(testDrive);
      setRejectReason('');
      setShowRejectModal(true);
    }
  };

  const handleComplete = (testDrive) => {
    if (testDrive.status === 'accepted') {
      setSelectedTestDrive(testDrive);
      setFeedback('');
      setShowCompleteModal(true);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      setIsProcessing(true);
      
      const res = await fetch(`/backend/testdrive/${selectedTestDrive._id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectReason })
      });

      const data = await res.json();

      if (data.success) {
        fetchTestDrives();
        setShowRejectModal(false);
        alert('Test drive rejected successfully');
      } else {
        alert(data.message || 'Failed to reject test drive');
      }
    } catch (err) {
      alert('Failed to reject test drive');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmComplete = async () => {
    try {
      setIsProcessing(true);
      
      const res = await fetch(`/backend/testdrive/${selectedTestDrive._id}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      const data = await res.json();

      if (data.success) {
        fetchTestDrives();
        setShowCompleteModal(false);
        alert('Test drive completed successfully');
      } else {
        alert(data.message || 'Failed to complete test drive');
      }
    } catch (err) {
      alert('Failed to complete test drive');
      console.error(err);
    } finally {
      setIsProcessing(false);
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
          <p className="text-gray-300">Loading test drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-2 sm:p-4 lg:p-6 mt-20">
      <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-2 sm:p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-2">Assigned Test Drives</h1>
        <p className="text-gray-400 mb-6">Only accepted test drives appear here. You can reject or complete them.</p>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['accepted', 'completed', 'rejected', 'cancelled'].map((tab) => (
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
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Requested Date</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Location</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Status</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Actions</th>
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
                      <span className="text-xs text-gray-500">{testDrive.buyer.mobileNumber || 'No phone'}</span>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {new Date(testDrive.requestedDateTime).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800 text-gray-400 text-sm">
                      {testDrive.location}
                    </td>
                    <td className={`py-3 px-4 border-b border-gray-800 font-semibold ${getStatusColor(testDrive.status)}`}>
                      {testDrive.status.toUpperCase()}
                    </td>
                    <td className="py-3 px-4 border-b border-gray-800">
                      <div className="flex gap-2">
                        {testDrive.status === 'accepted' && (
                          <>
                            <button
                              onClick={() => handleReject(testDrive)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleComplete(testDrive)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                            >
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedTestDrive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Reject Test Drive</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-900/40 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Car</p>
              <p className="text-white font-semibold">
                {selectedTestDrive.car.brand} {selectedTestDrive.car.model}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Buyer: {selectedTestDrive.buyer.username}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.slice(0, 500))}
                placeholder="Explain why you're rejecting this test drive..."
                maxLength={500}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none resize-vertical"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">{rejectReason.length}/500</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedTestDrive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Mark Test Drive Complete</h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
              <p className="text-blue-400">Complete test drive for:</p>
              <p className="text-white font-semibold mt-2">
                {selectedTestDrive.car.brand} {selectedTestDrive.car.model}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Buyer: {selectedTestDrive.buyer.username}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Feedback (Optional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
                placeholder="Add feedback about the test drive..."
                maxLength={1000}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none resize-vertical"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">{feedback.length}/1000</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCompleteModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Completing...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTestDriveManagement;
