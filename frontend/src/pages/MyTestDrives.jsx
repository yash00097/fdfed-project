import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiX, FiCheckCircle, FiXCircle, FiClock, FiCalendar } from 'react-icons/fi';

const MyTestDrives = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    fetchTestDrives();
  }, [currentUser]);

  const fetchTestDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/backend/testdrive/my', {
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

  const handleCancelClick = (testDrive) => {
    if (['pending', 'accepted'].includes(testDrive.status)) {
      setSelectedTestDrive(testDrive);
      setCancellationReason('');
      setShowCancelModal(true);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('Please enter a cancellation reason');
      return;
    }

    try {
      setIsCancelling(true);
      
      const res = await fetch(`/backend/testdrive/cancel/${selectedTestDrive._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason })
      });

      const data = await res.json();

      if (data.success) {
        fetchTestDrives();
        setShowCancelModal(false);
        alert('Test drive cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel test drive');
      }
    } catch (err) {
      alert('Failed to cancel test drive');
      console.error(err);
    } finally {
      setIsCancelling(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-5 h-5" />;
      case 'accepted': return <FiCheckCircle className="w-5 h-5" />;
      case 'completed': return <FiCheckCircle className="w-5 h-5" />;
      case 'rejected': return <FiXCircle className="w-5 h-5" />;
      case 'cancelled': return <FiXCircle className="w-5 h-5" />;
      default: return null;
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
        <h1 className="text-3xl font-bold mb-6">My Test Drive Requests</h1>

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

        {/* Test Drives List */}
        {filteredTestDrives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No {activeTab} test drives</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestDrives.map((testDrive) => (
              <div
                key={testDrive._id}
                className="bg-gray-900/40 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Car Info */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Car</p>
                    <p className="text-white font-semibold">
                      {testDrive.car.brand} {testDrive.car.model}
                    </p>
                    <p className="text-gray-500 text-sm">{testDrive.car.carNumber}</p>
                  </div>

                  {/* Requested Date */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Requested Date/Time</p>
                    <p className="text-white">{new Date(testDrive.requestedDateTime).toLocaleString()}</p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-white">{testDrive.location}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <div className={`flex items-center gap-2 ${getStatusColor(testDrive.status)}`}>
                      {getStatusIcon(testDrive.status)}
                      <span className="font-semibold">{testDrive.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {testDrive.notes && (
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Notes</p>
                    <p className="text-gray-300">{testDrive.notes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {testDrive.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-900/20 rounded-lg border border-red-700/50">
                    <p className="text-red-400 text-sm mb-1">Rejection Reason</p>
                    <p className="text-red-200">{testDrive.rejectionReason}</p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {testDrive.cancellationReason && (
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Cancellation Reason</p>
                    <p className="text-gray-300">{testDrive.cancellationReason}</p>
                  </div>
                )}

                {/* Feedback */}
                {testDrive.feedback && (
                  <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <p className="text-blue-400 text-sm mb-1">Agent Feedback</p>
                    <p className="text-blue-200">{testDrive.feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {['pending', 'accepted'].includes(testDrive.status) && (
                    <button
                      onClick={() => handleCancelClick(testDrive)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedTestDrive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cancel Test Drive</h3>
              <button
                onClick={() => setShowCancelModal(false)}
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
              <p className="text-gray-400 text-sm mt-2">Requested: {new Date(selectedTestDrive.requestedDateTime).toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Cancellation Reason *</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value.slice(0, 500))}
                placeholder="Please explain why you're cancelling this test drive..."
                maxLength={500}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none resize-vertical"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-1">{cancellationReason.length}/500</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Keep It
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTestDrives;
