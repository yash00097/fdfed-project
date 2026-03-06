import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiCalendar, FiMapPin, FiUser, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import GradientText from '../react-bits/GradientText/GradientText.jsx';
import inventoryBgImage from '../assets/images/inventoryBgImage.jpg';

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
          <p className="text-xl">Loading pending requests...</p>
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
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center">
          <GradientText
            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
            animationSpeed={10}
            showBorder={false}
            className="text-3xl md:text-4xl font-bold drop-shadow-2xl"
          >
            Pending Test Drive Requests
          </GradientText>
          <p className="text-slate-300 mt-2 text-sm">
            All agents can view these. Once you accept, only you can continue processing.
          </p>
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

          {testDrives.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xl">
              No pending test drive requests
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {testDrives.map((testDrive) => (
                <div
                  key={testDrive._id}
                  className="bg-slate-700/60 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/25 transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-slate-900/50 px-4 py-3 border-b border-white/10">
                    <p className="text-white font-bold text-lg leading-tight">
                      {testDrive.car.brand} {testDrive.car.model}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">{testDrive.car.carNumber}</p>
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
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-white/10">
                    <button
                      onClick={() => handleAccept(testDrive._id)}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      {isProcessing ? 'Accepting...' : 'Accept Request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentPendingTestDriveRequests;
