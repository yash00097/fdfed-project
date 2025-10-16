import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";
import Card from "../components/Card.jsx";
import { FiCheck } from "react-icons/fi";

export default function Approval() {
  const { currentUser } = useSelector((state) => state.user);
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);

  const [technicalSpecs, setTechnicalSpecs] = useState({
    engine: "",
    torque: "",
    power: "",
    groundClearance: "",
    topSpeed: "",
    fuelTank: "",
    driveType: "",
  });

  const fetchPendingCars = async () => {
    try {
      const res = await fetch("/backend/agent/assigned", { credentials: "include" });
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

  const handleApprove = (car) => {
    setSelectedCar(car);
    setShowApprovalForm(true);
    setIsApproving(false);
    setApprovalSuccess(false);
  };

  const confirmApprove = async (carId) => {
    setIsApproving(true);
    try {
      const res = await fetch(`/backend/agent/approve/${carId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(technicalSpecs),
      });
      const data = await res.json();
      if (data.success) {
        setApprovalSuccess(true);
        setTimeout(() => {
          setShowApprovalForm(false);
          setSelectedCar(null);
          fetchPendingCars();
        }, 2000);
      }
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed");
      setIsApproving(false);
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
        if (data.success) fetchPendingCars();
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
              Car Approval Dashboard
            </GradientText>
            <p className="mt-2 text-gray-400">Review and approve pending car listings</p>
          </div>

          {pendingCars.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xl">
              No pending cars to review
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
                  <Card car={car} onApprove={handleApprove} onReject={handleReject} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Approval Form Modal */}
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
                className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                {approvalSuccess ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <FiCheck className="text-green-400 text-6xl mb-4" />
                    <p className="text-2xl font-semibold text-gray-200">Car Approved!</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4 text-white">
                      Approve {selectedCar.brand} {selectedCar.model}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.keys(technicalSpecs).map((key) => (
                        <div key={key}>
                          <label className="block text-sm text-gray-300 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </label>
                          <input
                            type="text"
                            value={technicalSpecs[key]}
                            onChange={(e) =>
                              setTechnicalSpecs({ ...technicalSpecs, [key]: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => confirmApprove(selectedCar._id)}
                        disabled={isApproving}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        {isApproving ? "Approving..." : "Approve Car"}
                      </button>
                      <button
                        onClick={() => setShowApprovalForm(false)}
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