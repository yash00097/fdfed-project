import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrendingUp, FiTag, FiPhone } from 'react-icons/fi';
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";

export default function Approval() {
  const { currentUser } = useSelector((state) => state.user);
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  const [technicalSpecs, setTechnicalSpecs] = useState({
    engine: '', torque: '', power: '', groundClearance: '',
    topSpeed: '', fuelTank: '', driveType: ''
  });

  const fetchPendingCars = async () => {
    try {
      const res = await fetch('/backend/agent/assigned', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setPendingCars(data.cars);
      }
    } catch (error) {
      console.error('Error fetching pending cars:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, []);

  const handleApprove = async (carId) => {
    setIsApproving(true);
    setApprovalSuccess(false);
    try {
      const res = await fetch(`/backend/agent/approve/${carId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(technicalSpecs)
      });
      const data = await res.json();
      if (data.success) {
        setApprovalSuccess(true);
        setTimeout(() => {
          setShowApprovalForm(false);
          setSelectedCar(null);
          fetchPendingCars();
        }, 2000);
      } else {
        alert('Failed to approve car');
        setIsApproving(false);
      }
    } catch (error) {
      console.error('Error approving car:', error);
      alert('Error approving car');
      setIsApproving(false);
    }
  };

  const handleReject = async (carId) => {
    if (window.confirm('Are you sure you want to reject this car?')) {
      try {
        const res = await fetch(`/backend/agent/reject/${carId}`, {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          alert('Car rejected successfully!');
          fetchPendingCars();
        } else {
          alert('Failed to reject car');
        }
      } catch (error) {
        console.error('Error rejecting car:', error);
        alert('Error rejecting car');
      }
    }
  };

  const openApprovalForm = (car) => {
    setSelectedCar(car);
    setIsApproving(false);
    setApprovalSuccess(false);
    setTechnicalSpecs({
        engine: '', torque: '', power: '', groundClearance: '',
        topSpeed: '', fuelTank: '', driveType: ''
    });
    setShowApprovalForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-t-blue-600 border-gray-600 rounded-full"
          />
          <p className="text-xl text-gray-300">Loading pending cars...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-red-400">Access denied. Agent role required.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0 overflow-y-auto "
        style={{
              backgroundImage: `url(${sellRequestBgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed'
        }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-30">
        <div className="bg-gray-800/60 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="mb-8 text-center">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={10}
              showBorder={false}
              className="custom-class text-3xl font-semibold"
            >
              Car Approval Dashboard
            </GradientText>
            <p className="mt-2 text-gray-400">Review and approve pending car listings</p>
          </div>

          {pendingCars.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-400">No pending cars to review</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCars.map((car) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                >
                  <div className="relative h-56 w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    {car.photos && car.photos.length > 0 ? (
                      car.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${car.brand} ${car.model} view ${index + 1}`}
                          className="w-full h-full object-cover flex-shrink-0 snap-center"
                        />
                      ))
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <p className="text-gray-500">No Image</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-gray-400">{car.manufacturedYear}</p>
                      </div>
                      <p className="text-lg font-semibold text-blue-400">
                        ₹{car.price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 my-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="text-gray-500"/>
                        <span>{car.traveledKm.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiTag className="text-gray-500"/>
                        <span>{car.carNumber}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-300">Seller: <span className="font-medium text-gray-200">{car.sellerName}</span></p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                          <FiPhone className="text-gray-500" size={14}/>
                          <span>{car.sellerphone}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => openApprovalForm(car)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(car._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showApprovalForm && selectedCar && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowApprovalForm(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <AnimatePresence mode="wait">
                  {approvalSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex flex-col items-center justify-center h-full min-h-[400px]"
                    >
                      <motion.div
                        className="w-24 h-24 bg-green-900/50 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                      >
                          <FiCheck className="text-5xl text-green-400" />
                      </motion.div>
                      <p className="mt-6 text-2xl font-semibold text-gray-200">Car Approved!</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form">
                      <h2 className="text-2xl font-bold mb-4 text-white">
                        Approve {selectedCar.brand} {selectedCar.model}
                      </h2>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Technical Specifications (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(technicalSpecs).map((key) => (
                                <div key={key} className={key === 'driveType' ? 'md:col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    {key === 'driveType' ? (
                                        <select
                                            value={technicalSpecs[key]}
                                            onChange={(e) => setTechnicalSpecs({...technicalSpecs, [key]: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                                        >
                                            <option value="">Select Drive Type</option>
                                            <option value="FWD">FWD (Front Wheel Drive)</option>
                                            <option value="RWD">RWD (Rear Wheel Drive)</option>
                                            <option value="AWD">AWD (All Wheel Drive)</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="number"
                                            value={technicalSpecs[key]}
                                            onChange={(e) => setTechnicalSpecs({...technicalSpecs, [key]: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                                            placeholder={`e.g., ${key === 'engine' ? '1998' : '150'}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleApprove(selectedCar._id)}
                          disabled={isApproving}
                          className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isApproving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="to 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Approving...
                            </>
                          ) : (
                            'Approve Car'
                          )}
                        </button>
                        <button
                          onClick={() => setShowApprovalForm(false)}
                          className="flex-1 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
