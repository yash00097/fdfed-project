import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";
import Card from "../components/Card.jsx";
import { FiCheck } from "react-icons/fi";

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

    // ✅ Fetch cars under verification for this agent
    const fetchCars = async () => {
    try {
        const res = await fetch("/backend/agent/assigned?status=verification", {
        credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
        setCarsUnderVerification(data.cars);
        }
    } catch (err) {
        console.error("Error fetching verification cars:", err);
    } finally {
        setLoading(false);
    }
    };


  useEffect(() => {
    fetchCars();
  }, []);

  const handleVerify = (car) => {
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
      } else {
        alert("Verification failed");
      }
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async (carId) => {
    if (window.confirm("Reject this car?")) {
      try {
        const res = await fetch(`/backend/agent/reject/${carId}`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) fetchCars();
      } catch (err) {
        console.error("Rejection failed:", err);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Loading cars for verification...
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
              Verify Assigned Cars
            </GradientText>
            <p className="mt-2 text-gray-400">
              Fill in car specifications before approving or reject if invalid
            </p>
          </div>

          {carsUnderVerification.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xl">
              No cars available for verification
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
                    onAccept={handleVerify}
                    onReject={handleReject}
                    isApprovalPage={true}
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

                    <div className="space-y-4 mb-6">
                      {specConfig.map(({ key, label, unit, placeholder }) => (
                        <div key={key}>
                          <label className="block text-gray-300 mb-1">
                            {label} {unit && <span className="text-gray-500">({unit})</span>}
                          </label>
                          <input
                            type="text"
                            value={technicalSpecs[key]}
                            onChange={(e) =>
                              setTechnicalSpecs((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={placeholder}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {specErrors[key] && (
                            <p className="text-red-400 text-sm mt-1">{specErrors[key]}</p>
                          )}
                        </div>
                      ))}
                    </div>

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