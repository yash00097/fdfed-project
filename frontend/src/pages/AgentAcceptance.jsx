import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUnreadCountStart,
  fetchUnreadCountSuccess,
  fetchUnreadCountFailure,
} from "../redux/notification/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";
import Card from "../components/Card.jsx";
import { FiCheck, FiClock } from "react-icons/fi";

export default function AgentAcceptance() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showAcceptanceForm, setShowAcceptanceForm] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptanceSuccess, setAcceptanceSuccess] = useState(false);
  const [verificationDays, setVerificationDays] = useState(7); // Default 7 days

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
    {
      key: "engine",
      label: "Engine",
      unit: "cc",
      placeholder: "e.g., 2000",
      type: "number",
      min: 0,
    },
    {
      key: "torque",
      label: "Torque",
      unit: "Nm",
      placeholder: "e.g., 350",
      type: "number",
      min: 0,
    },
    {
      key: "power",
      label: "Power",
      unit: "bhp",
      placeholder: "e.g., 150",
      type: "number",
      min: 0,
    },
    {
      key: "groundClearance",
      label: "Ground Clearance",
      unit: "mm",
      placeholder: "e.g., 180",
      type: "number",
      min: 0,
    },
    {
      key: "topSpeed",
      label: "Top Speed",
      unit: "km/h",
      placeholder: "e.g., 200",
      type: "number",
      min: 0,
    },
    {
      key: "fuelTank",
      label: "Fuel Tank",
      unit: "L",
      placeholder: "e.g., 50",
      type: "number",
      min: 0,
    },
  ];

  const validateSpec = (key, value) => {
    if (value === "" || value === null || value === undefined) return null;
    if (key === "driveType") {
      const allowed = ["", "FWD", "RWD", "AWD"];
      return allowed.includes(value) ? null : "Invalid drive type";
    }
    const num = Number(value);
    if (Number.isNaN(num)) return "Must be a number";
    if (num < 0) return "Must be >= 0";
    return null;
  };

  const fetchPendingCars = async () => {
    try {
      const res = await fetch("/backend/agent/assigned?status=pending", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setPendingCars(data.cars);
    } catch (error) {
      console.error("Error fetching pending cars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, []);

  const fetchNewCount = async () => {
    dispatch(fetchUnreadCountStart());
    try {
      const countRes = await fetch("/backend/notification/unread-count");
      const countData = await countRes.json();
      if (countData.success) {
        dispatch(fetchUnreadCountSuccess(countData.count));
      } else {
        dispatch(fetchUnreadCountFailure("Failed to fetch count"));
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      dispatch(fetchUnreadCountFailure("Failed to fetch count"));
    }
  };

  const handleAccept = (car) => {
    setSelectedCar(car);
    setShowAcceptanceForm(true);
    setIsAccepting(false);
    setAcceptanceSuccess(false);
    setVerificationDays(7); // Reset to default 7 days
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

  const confirmAccept = async (carId) => {
    setIsAccepting(true);
    try {
      const res = await fetch(`/backend/agent/accept/${carId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ verificationDays }),
      });
      const data = await res.json();
      if (data.success) {
        setAcceptanceSuccess(true);
        setTimeout(() => {
          setShowAcceptanceForm(false);
          setSelectedCar(null);
          fetchPendingCars();
          fetchNewCount();
        }, 2000);
      } else {
        alert("Acceptance failed: " + (data.message || "Unknown error"));
        setIsAccepting(false);
      }
    } catch (err) {
      console.error("Acceptance failed:", err);
      alert("Acceptance failed");
      setIsAccepting(false);
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
        if (data.success) {
          fetchPendingCars();
          fetchNewCount();
        }
      } catch (err) {
        console.error("Rejection failed:", err);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Loading pending cars...
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
              Agent Car Acceptance
            </GradientText>
            <p className="mt-2 text-gray-400">
              Review and accept pending car listings for verification
            </p>
          </div>

          {pendingCars.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xl">
              No cars available for acceptance
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingCars.map((car) => (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    car={car}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    isApprovalPage={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Acceptance Form Modal */}
        <AnimatePresence>
          {showAcceptanceForm && selectedCar && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAcceptanceForm(false)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {acceptanceSuccess ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <FiCheck className="text-green-400 text-6xl mb-4" />
                    <p className="text-2xl font-semibold text-gray-200">
                      Car Accepted!
                    </p>
                    <p className="text-gray-400 mt-2">
                      You have {verificationDays} day(s) to complete
                      verification
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">
                      Accept {selectedCar.brand} {selectedCar.model}
                    </h2>

                    {/* Verification Time Limit Input */}
                    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <FiClock className="mr-2 text-blue-400" />
                        Set Verification Time Limit
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={verificationDays}
                          onChange={(e) =>
                            setVerificationDays(parseInt(e.target.value))
                          }
                          className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <span className="text-lg font-semibold text-white min-w-12">
                          {verificationDays}{" "}
                          {verificationDays === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Choose how many days you need to verify this car (1-10
                        days). If not completed in time, the car will be
                        returned to pending status.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => confirmAccept(selectedCar._id)}
                        disabled={isAccepting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAccepting
                          ? "Accepting..."
                          : `Accept for ${verificationDays} day(s)`}
                      </button>
                      <button
                        onClick={() => setShowAcceptanceForm(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
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
