import {
  FiTrendingUp,
  FiTag,
  FiUsers,
  FiDroplet,
  FiSettings,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Function to format numbers in Indian currency format
const formatIndianCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "—";
  const num = Number(amount);

  if (num >= 10000000)
    return (
      (num / 10000000).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      }) + " Cr"
    );
  else if (num >= 100000)
    return (
      (num / 100000).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      }) + " L"
    );
  else if (num >= 1000)
    return (
      (num / 1000).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      }) + " K"
    );
  else return num.toLocaleString("en-IN");
};

export default function Card({ car, onAccept, isApprovalPage = false , isVerifyPage = false}) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-change images on hover
  useEffect(() => {
    if (!isHovered || !car.photos || car.photos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, car.photos]);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + car.photos.length) % car.photos.length
    );
  const goToImage = (index) => setCurrentImageIndex(index);

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500 flex flex-col border border-gray-700 hover:border-green-500/30 hover:shadow-green-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        {car.photos?.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={car.photos[currentImageIndex]}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {car.photos.length > 1 && (
              <>
                {/* Left arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Right arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Dots indicator */}
            {car.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {car.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToImage(i);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      i === currentImageIndex
                        ? "bg-green-500 scale-125"
                        : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Page counter */}
            <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {currentImageIndex + 1}/{car.photos.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      {/* Car Info */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-gray-400">
              {car.manufacturedYear} • {car.vehicleType}{" "}
              {car.city ? `• ${car.city}` : ""}
            </p>
            {/* Show full address and seller contact on approval pages */}
            {isApprovalPage && (
              <div className="mt-2 space-y-2">
                {(car.address || car.city || car.state || car.pincode) && (
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Address:</p>
                    <p className="text-sm text-gray-300">
                      {[car.address, car.city, car.state, car.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
                {(car.sellerName || car.sellerphone) && (
                  <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-700/50">
                    <p className="text-xs text-blue-400 mb-1">Seller Contact:</p>
                    <div className="space-y-1">
                      {car.sellerName && (
                        <p className="text-sm text-blue-300 font-medium">{car.sellerName}</p>
                      )}
                      {car.sellerphone && (
                        <p className="text-sm text-blue-300 font-mono">📞 {car.sellerphone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show verification time for cars in verification status */}
                {car.status === 'verification' && (
                  <div className="p-2 bg-orange-900/30 rounded-lg border border-orange-700/50">
                    <p className="text-xs text-orange-400 mb-1">Verification Status:</p>
                    <div className="space-y-1">
                      {car.timeInVerification && (
                        <p className="text-sm text-orange-300">
                          ⏱️ In verification for: {car.timeInVerification.days > 0
                            ? `${car.timeInVerification.days} day(s), ${car.timeInVerification.hours % 24} hour(s)`
                            : `${car.timeInVerification.hours} hour(s)`
                          }
                        </p>
                      )}
                      {car.verificationDays && (
                        <p className="text-sm text-orange-300">
                          📅 {car.verificationDays} day(s) allocated
                        </p>
                      )}
                      {car.verificationDeadline && (
                        <p className="text-sm text-orange-300">
                          ⏰ Deadline: {new Date(car.verificationDeadline).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {car.verificationDeadline && (
                        <p className={`text-xs font-medium ${
                          new Date(car.verificationDeadline) < new Date()
                            ? 'text-red-400'
                            : new Date(car.verificationDeadline) - new Date() < 24 * 60 * 60 * 1000
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {new Date(car.verificationDeadline) < new Date()
                            ? '🚨 EXPIRED'
                            : new Date(car.verificationDeadline) - new Date() < 24 * 60 * 60 * 1000
                            ? '⚠️ EXPIRES SOON'
                            : '✅ ON TIME'
                          }
                        </p>
                      )}
                      {!car.verificationDeadline && car.timeInVerification && car.timeInVerification.hours >= 24 && (
                        <p className="text-xs font-medium text-red-400">
                          🚨 Over 24 hours - may be auto-reset soon
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            ₹{formatIndianCurrency(car.price)}
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <Stat
            icon={<FiTrendingUp className="text-green-400" />}
            label="Mileage"
            value={`${car.traveledKm || 0} km`}
          />
          <Stat
            icon={<FiTag className="text-blue-400" />}
            label="Car Number"
            value={car.carNumber || "—"}
          />
          <Stat
            icon={<FiDroplet className="text-teal-400" />}
            label="Fuel Type"
            value={car.fuelType || "—"}
          />
          <Stat
            icon={<FiSettings className="text-purple-400" />}
            label="Transmission"
            value={car.transmission || "—"}
          />
        </div>

        {(car.seater || car.exteriorColor) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {car.seater && (
              <Badge
                icon={<FiUsers className="text-gray-400" />}
                label={`${car.seater} Seater`}
              />
            )}
            {car.exteriorColor && (
              <Badge
                color={car.exteriorColor}
                label={car.exteriorColor}
              />
            )}
          </div>
        )}

        {/* ✅ Action Buttons */}
        <div className="mt-6">
          {isApprovalPage && currentUser?.role === "agent" ? (
            <>
              {/* 👇 Agent Verify Page */}
              {isVerifyPage ? (
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => onAccept(car)} // opens modal in VerifyCar.jsx
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Approve Car
                  </motion.button>

                  <motion.button
                    onClick={() => onReject(car._id)} // calls reject handler
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-pink-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reject
                  </motion.button>
                </div>
              ) : (
                // 👇 Other Approval Pages (like Admin)
                <motion.button
                  onClick={() => onAccept(car)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:from-blue-600 hover:to-indigo-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Approve Listing
                </motion.button>
              )}
            </>
          ) : (
            // 👇 Default "View Details" button
            <motion.button
              onClick={() => navigate(`/car/${car._id}`)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Helper Components
const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
    <div className="p-2 bg-gray-600 rounded-lg">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

const Badge = ({ icon, label, color }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">
    {icon}
    {color && (
      <div
        className="w-3 h-3 rounded-full border border-gray-600"
        style={{ backgroundColor: color }}
      />
    )}
    {label}
  </span>
);
