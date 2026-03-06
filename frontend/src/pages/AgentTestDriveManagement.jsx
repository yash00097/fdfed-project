import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiX, FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiMapPin, FiUser, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import GradientText from '../react-bits/GradientText/GradientText.jsx';
import inventoryBgImage from '../assets/images/inventoryBgImage.jpg';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-300 border-green-500/50 bg-green-900/30';
      case 'completed': return 'text-blue-300 border-blue-500/50 bg-blue-900/30';
      case 'rejected': return 'text-red-300 border-red-500/50 bg-red-900/30';
      case 'cancelled': return 'text-slate-300 border-slate-500/50 bg-slate-700/30';
      default: return 'text-gray-300 border-gray-600 bg-gray-800/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'completed': return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <FiXCircle className="w-3.5 h-3.5" />;
      case 'cancelled': return <FiXCircle className="w-3.5 h-3.5" />;
      default: return <FiClock className="w-3.5 h-3.5" />;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-slate-300 text-lg">Access denied. Agent role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin"></div>
          <p className="text-xl">Loading test drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">

      {/* Hero Header */}
      <div
        className="relative w-full flex items-end bg-cover bg-center pt-32 md:pt-36 pb-6"
        style={{
          backgroundImage: `url(${inventoryBgImage})`,
          minHeight: '38vh',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-4">
            <GradientText
              colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
              animationSpeed={10}
              showBorder={false}
              className="text-3xl md:text-4xl font-bold drop-shadow-2xl"
            >
              Assigned Test Drives
            </GradientText>
            <p className="text-slate-300 mt-2 text-sm">
              Only accepted test drives appear here. You can reject or complete them.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center flex-wrap">
            {['accepted', 'completed', 'rejected', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all text-sm font-medium backdrop-blur-md ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({testDrives.filter(td => td.status === tab).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        <div className="w-full px-3 md:px-6 mx-auto">

          {error && (
            <div className="mb-4 p-4 bg-red-900/25 border border-red-600/40 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {filteredTestDrives.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xl">
              No {activeTab} test drives
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTestDrives.map((testDrive) => (
                <div
                  key={testDrive._id}
                  className="bg-slate-700/60 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/25 transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-slate-900/50 px-4 py-3 flex items-center justify-between border-b border-white/10">
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">
                        {testDrive.car.brand} {testDrive.car.model}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">{testDrive.car.carNumber}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(testDrive.status)}`}>
                      {getStatusIcon(testDrive.status)}
                      <span>{testDrive.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-4 py-3 flex-1 space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <FiUser className="mt-0.5 text-cyan-400 shrink-0" />
                      <div>
                        <p className="text-slate-400 text-xs">Buyer</p>
                        <p className="text-white">{testDrive.buyer.username}</p>
                        <p className="text-slate-400 text-xs">{testDrive.buyer.mobileNumber || 'No phone'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <FiCalendar className="mt-0.5 text-cyan-400 shrink-0" />
                      <div>
                        <p className="text-slate-400 text-xs">Requested Date/Time</p>
                        <p className="text-white">{new Date(testDrive.requestedDateTime).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <FiMapPin className="mt-0.5 text-cyan-400 shrink-0" />
                      <div>
                        <p className="text-slate-400 text-xs">Location</p>
                        <p className="text-white">{testDrive.location}</p>
                      </div>
                    </div>

                    {testDrive.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FiMessageSquare className="mt-0.5 text-blue-400 shrink-0" />
                        <div>
                          <p className="text-slate-400 text-xs">Notes</p>
                          <p className="text-slate-200">{testDrive.notes}</p>
                        </div>
                      </div>
                    )}

                    {testDrive.rejectionReason && (
                      <div className="p-2.5 bg-red-900/25 rounded-lg border border-red-600/40 flex items-start gap-2 text-sm">
                        <FiAlertCircle className="mt-0.5 text-red-400 shrink-0" />
                        <div>
                          <p className="text-red-400 text-xs font-semibold">Rejection Reason</p>
                          <p className="text-red-200">{testDrive.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                    {testDrive.feedback && (
                      <div className="p-2.5 bg-blue-900/25 rounded-lg border border-blue-600/40 text-sm">
                        <p className="text-blue-400 text-xs font-semibold mb-0.5">Feedback</p>
                        <p className="text-blue-200">{testDrive.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer — actions only for accepted */}
                  {testDrive.status === 'accepted' && (
                    <div className="px-4 py-3 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => handleReject(testDrive)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <FiXCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleComplete(testDrive)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedTestDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-white/15 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Reject Test Drive</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-white/10">
              <p className="text-slate-400 text-xs mb-0.5">Car</p>
              <p className="text-white font-semibold">{selectedTestDrive.car.brand} {selectedTestDrive.car.model}</p>
              <p className="text-slate-400 text-xs mt-1">Buyer: {selectedTestDrive.buyer.username}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.slice(0, 500))}
                placeholder="Explain why you're rejecting this test drive..."
                maxLength={500}
                className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg p-3 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none resize-vertical placeholder-white/50 text-sm"
                rows="4"
              />
              <p className="text-xs text-slate-500 mt-1">{rejectReason.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-white/15 border border-white/25 text-white rounded-lg hover:bg-white/25 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedTestDrive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-white/15 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Mark Test Drive Complete</h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-900/25 rounded-lg border border-blue-600/40">
              <p className="text-blue-400 text-xs font-semibold mb-0.5">Completing test drive for:</p>
              <p className="text-white font-semibold">{selectedTestDrive.car.brand} {selectedTestDrive.car.model}</p>
              <p className="text-slate-400 text-xs mt-1">Buyer: {selectedTestDrive.buyer.username}</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Feedback (Optional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
                placeholder="Add feedback about the test drive..."
                maxLength={1000}
                className="w-full bg-white/10 backdrop-blur-md text-white rounded-lg p-3 border border-white/20 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none resize-vertical placeholder-white/50 text-sm"
                rows="4"
              />
              <p className="text-xs text-slate-500 mt-1">{feedback.length}/1000</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-white/15 border border-white/25 text-white rounded-lg hover:bg-white/25 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 text-sm font-medium"
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
