import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";
import Card from "../components/Card.jsx";
import { FiCheck, FiClock } from "react-icons/fi";

export default function VerifyCar() {
  const { currentUser } = useSelector((state) => state.user);
  const [carsUnderVerification, setCarsUnderVerification] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const [technicalSpecs, setTechnicalSpecs] = useState({
    engine: "",
    torque: "",
    power: "",
    groundClearance: "",
    topSpeed: "",
    fuelTank: "",
    driveType: "",
  });
  const [specErrors, setSpecErrors] = useState({});

  const specConfig = [
    { key: "engine", label: "Engine", unit: "cc", placeholder: "e.g., 2000" },
    { key: "torque", label: "Torque", unit: "Nm", placeholder: "e.g., 350" },
    { key: "power", label: "Power", unit: "bhp", placeholder: "e.g., 150" },
    { key: "groundClearance", label: "Ground Clearance", unit: "mm", placeholder: "e.g., 180" },
    { key: "topSpeed", label: "Top Speed", unit: "km/h", placeholder: "e.g., 200" },
    { key: "fuelTank", label: "Fuel Tank", unit: "L", placeholder: "e.g., 50" },
    { key: "driveType", label: "Drive Type", placeholder: "e.g., FWD / RWD / AWD" },
  ];

  const validateSpec = (key, value) => {
    if (value === "" || value === null) return "Required";
    if (key === "driveType") {
      const allowed = ["FWD", "RWD", "AWD"];
      return allowed.includes(value.toUpperCase()) ? null : "Must be FWD, RWD or AWD";
    }
    const num = Number(value);
    if (Number.isNaN(num)) return "Must be a number";
    if (num < 0) return "Must be >= 0";
    return null;
  };

  const fetchCars = async () => {
    try {
      const res = await fetch("/backend/agent/verification", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setCarsUnderVerification(data.cars);
    } catch (err) {
      console.error("Error fetching verification cars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchCars();
  }, [currentUser]);

  const getDeadlineInfo = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      days: diffDays,
      isExpired: diffTime < 0,
      isUrgent: diffDays <= 2 && diffTime > 0,
    };
  };

  const handleVerify = (car) => {
    if (car.agent !== currentUser.id) {
      alert("You are not authorized to verify this car.");
      return;
    }
    setSelectedCar(car);
    setShowVerifyForm(true);
    setVerifySuccess(false);
    setIsVerifying(false);
    setTechnicalSpecs({
      engine: "",
      torque: "",
      power: "",
      groundClearance: "",
      topSpeed: "",
      fuelTank: "",
      driveType: "",
    });
    setSpecErrors({});
  };

  const confirmVerify = async (carId) => {
    if (selectedCar.agent !== currentUser.id) {
      alert("Authorization error: This car is not assigned to you.");
      return;
    }

    setIsVerifying(true);
    const nextErrors = {};
    Object.entries(technicalSpecs).forEach(([k, v]) => {
      const err = validateSpec(k, v);
      if (err) nextErrors[k] = err;
    });
    setSpecErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setIsVerifying(false);
      return;
    }

    try {
      const res = await fetch(`/backend/agent/approve/${carId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(technicalSpecs),
      });
      const data = await res.json();
      if (data.success) {
        setVerifySuccess(true);
        setTimeout(() => {
          setShowVerifyForm(false);
          fetchCars();
        }, 2000);
      } else alert("Verification failed: " + (data.message || "Unknown error"));
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (carId) => {
    const car = carsUnderVerification.find(c => c._id === carId);
    if (!car || car.agent !== currentUser.id) {
      alert("You are not authorized to reject this car.");
      return;
    }

    if (window.confirm("Are you sure you want to reject this car?")) {
      try {
        const res = await fetch(`/backend/agent/reject/${carId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setShowVerifyForm(false);
          fetchCars();
        } else {
          alert("Rejection failed: " + (data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Rejection failed:", err);
        alert("Rejection failed");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Loading your verification cars...
      </div>
    );

  if (!currentUser || currentUser.role !== "agent")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Access denied. Agent role required.
      </div>
    );

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0 overflow-y-auto"
      style={{
        backgroundImage: `url(${sellRequestBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-30">
        <div className="bg-gray-800/60 p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="mb-8 text-center">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={10}
              className="custom-class text-3xl font-semibold"
            >
              Your Cars for Verification
            </GradientText>
            <p className="mt-2 text-gray-400">
              Verify cars assigned to you - Agent: {currentUser.username}
            </p>
          </div>

          {carsUnderVerification.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xl">
              No cars assigned for verification
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {carsUnderVerification.map((car) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    car={car}
                    onAccept={() => handleVerify(car)}
                    onReject={handleReject}
                    isApprovalPage={true}
                    isVerifyPage={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Verify Form */}
        <AnimatePresence>
          {showVerifyForm && selectedCar && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowVerifyForm(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {verifySuccess ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <FiCheck className="text-green-400 text-6xl mb-4" />
                    <p className="text-2xl font-semibold text-gray-200">Car Approved!</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">
                      Verify {selectedCar.brand} {selectedCar.model}
                    </h2>

                    {selectedCar.verificationDeadline && (
                      <div className={`mb-4 p-3 rounded-lg border-2 ${
                        getDeadlineInfo(selectedCar.verificationDeadline)?.isExpired
                          ? 'bg-red-900/30 border-red-700'
                          : getDeadlineInfo(selectedCar.verificationDeadline)?.isUrgent
                            ? 'bg-yellow-900/30 border-yellow-700'
                            : 'bg-blue-900/30 border-blue-700'
                      }`}>
                        <p className="text-sm font-semibold flex items-center">
                          <FiClock className="mr-2" />
                          Verification deadline: {new Date(selectedCar.verificationDeadline).toLocaleDateString()}

                        </p>
                      </div>
                    )}

                    {/* Specs Form */}
                    <div className="space-y-4 mb-6">
                      {specConfig.map(({ key, label, unit, placeholder }) => (
                        <div key={key}>
                          <label className="block text-gray-300 mb-1">
                            {label}{" "}
                            {unit && (
                              <span className="text-gray-500">({unit})</span>
                            )}
                          </label>

                          {key === "driveType" ? (
                            // Select dropdown for driveType
                            <div className="relative">
                              <select
                                value={technicalSpecs[key] || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTechnicalSpecs({
                                    ...technicalSpecs,
                                    [key]: val,
                                  });
                                  const err = validateSpec(key, val);
                                  setSpecErrors((prev) => ({
                                    ...prev,
                                    [key]: err,
                                  }));
                                }}
                                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-200 focus:outline-none appearance-none ${
                                  specErrors[key]
                                    ? "border-red-500"
                                    : "border-gray-600"
                                }`}
                              >
                                <option value="">Select Drive Type</option>
                                <option value="FWD">FWD (Front Wheel Drive)</option>
                                <option value="RWD">RWD (Rear Wheel Drive)</option>
                                <option value="AWD">AWD (All Wheel Drive)</option>
                              </select>
                              {/* Custom dropdown arrow */}
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            // Regular input for other fields
                            <div className="relative">
                              <input
                                type="text"
                                inputMode={key === "driveType" ? "text" : "decimal"}
                                step="any"
                                min="0"
                                placeholder={placeholder}
                                value={technicalSpecs[key]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTechnicalSpecs({
                                    ...technicalSpecs,
                                    [key]: val,
                                  });
                                  const err = validateSpec(key, val);
                                  setSpecErrors((prev) => ({
                                    ...prev,
                                    [key]: err,
                                  }));
                                }}
                                className={`w-full pr-16 px-3 py-2 bg-gray-700 border rounded-md text-gray-200 focus:outline-none ${
                                  specErrors[key]
                                    ? "border-red-500"
                                    : "border-gray-600"
                                }`}
                              />
                              {unit && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                  {unit}
                                </span>
                              )}
                            </div>
                          )}

                          {specErrors[key] && (
                            <p className="text-red-400 text-sm mt-1">
                              {specErrors[key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Modal Buttons */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => confirmVerify(selectedCar._id)}
                        disabled={isVerifying}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? "Approving..." : "Approve Car"}
                      </button>
                      <button
                        onClick={() => setShowVerifyForm(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
