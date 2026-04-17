import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiMapPin, FiUser, FiAlertCircle, FiMessageSquare, FiShield } from 'react-icons/fi';
import GradientText from '../react-bits/GradientText/GradientText.jsx';
import inventoryBgImage from '../assets/images/inventoryBgImage.jpg';
import { apiUrl } from '../lib/api';

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
      
      const res = await fetch(apiUrl('/backend/testdrive/all'), {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-300 border-yellow-500/50 bg-yellow-900/30';
      case 'accepted': return 'text-green-300 border-green-500/50 bg-green-900/30';
      case 'completed': return 'text-blue-300 border-blue-500/50 bg-blue-900/30';
      case 'rejected': return 'text-red-300 border-red-500/50 bg-red-900/30';
      case 'cancelled': return 'text-slate-300 border-slate-500/50 bg-slate-700/30';
      case 'expired': return 'text-orange-300 border-orange-500/50 bg-orange-900/30';
      default: return 'text-gray-300 border-gray-600 bg-gray-800/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-3.5 h-3.5" />;
      case 'accepted': return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'completed': return <FiCheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <FiXCircle className="w-3.5 h-3.5" />;
      case 'cancelled': return <FiXCircle className="w-3.5 h-3.5" />;
      case 'expired': return <FiClock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const filteredTestDrives = testDrives.filter(td => {
    if (activeTab === 'pending') return td.status === 'pending';
    if (activeTab === 'accepted') return td.status === 'accepted';
    if (activeTab === 'completed') return td.status === 'completed';
    if (activeTab === 'rejected') return td.status === 'rejected';
    if (activeTab === 'cancelled') return td.status === 'cancelled';
    if (activeTab === 'expired') return td.status === 'expired';
    return true;
  });

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
              Test Drive Overview
            </GradientText>
            <p className="text-slate-300 mt-2 text-sm">
              Monitor all test drive requests. Only assigned agents can approve, reject, or complete test drives.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center flex-wrap">
            {['pending', 'accepted', 'completed', 'rejected', 'cancelled', 'expired'].map((tab) => (
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
                        <p className="text-slate-400 text-xs">{testDrive.buyer.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <FiShield className="mt-0.5 text-cyan-400 shrink-0" />
                      <div>
                        <p className="text-slate-400 text-xs">Agent</p>
                        <p className="text-white">{testDrive.agent?.username || 'Unassigned'}</p>
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

                    {testDrive.cancellationReason && (
                      <div className="p-2.5 bg-slate-800/50 rounded-lg border border-white/10 text-sm">
                        <p className="text-slate-400 text-xs font-semibold mb-0.5">Cancellation Reason</p>
                        <p className="text-slate-300">{testDrive.cancellationReason}</p>
                      </div>
                    )}

                    {testDrive.feedback && (
                      <div className="p-2.5 bg-blue-900/25 rounded-lg border border-blue-600/40 text-sm">
                        <p className="text-blue-400 text-xs font-semibold mb-0.5">Agent Feedback</p>
                        <p className="text-blue-200">{testDrive.feedback}</p>
                      </div>
                    )}
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

export default AdminTestDriveManagement;
