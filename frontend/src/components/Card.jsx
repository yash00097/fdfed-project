import { FiTrendingUp, FiTag, FiUsers, FiDroplet, FiSettings } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Function to format numbers in Indian currency format
const formatIndianCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "—";

  const num = Number(amount);

  // Convert to Indian numbering system
  if (num >= 10000000) { // 1 crore and above
    return (num / 10000000).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }) + ' Cr';
  } else if (num >= 100000) { // 1 lakh and above
    return (num / 100000).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }) + ' L';
  } else if (num >= 1000) { // 1 thousand and above
    return (num / 1000).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }) + ' K';
  } else {
    return num.toLocaleString('en-IN');
  }
};

export default function Card({ car, onApprove, onReject, isApprovalPage = false }) {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate images when hovered
  useEffect(() => {
    if (!isHovered || !car.photos || car.photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, car.photos]);

  const nextImage = () => {
    if (!car.photos || car.photos.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
  };

  const prevImage = () => {
    if (!car.photos || car.photos.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-500 flex flex-col border border-gray-700 hover:border-red-500/30 hover:shadow-red-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Image Carousel with Framer Motion */}
      <div className="relative h-64 w-full overflow-hidden">
        {car.photos && car.photos.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={car.photos[currentImageIndex]}
                alt={`${car.brand} ${car.model} view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {car.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Dots Indicator */}
            {car.photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {car.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-red-500 scale-125'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}


            {/* Image Counter */}
            <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
              {currentImageIndex + 1} / {car.photos.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No Images</p>
            </div>
          </div>
        )}
      </div>

      {/* Car Info Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Header with Price */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {car.brand} {car.model}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{car.manufacturedYear}</span>
              <span>•</span>
              <span className="capitalize">{car.vehicleType}</span>
              {car.city && (
                <>
                  <span>•</span>
                  <span>{car.city}</span>
                </>
              )}
            </div>
          </div>
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            ₹{formatIndianCurrency(car.price)}
          </motion.div>
        </div>

        {/* Enhanced Car Stats Grid */}
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors duration-300">
            <div className="p-2 bg-gray-600 rounded-lg">
              <FiTrendingUp className="text-red-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Mileage</p>
              <p className="text-sm font-semibold text-white">
                {car.traveledKm && !isNaN(car.traveledKm) ? Number(car.traveledKm).toLocaleString() : "0"} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors duration-300">
            <div className="p-2 bg-gray-600 rounded-lg">
              <FiTag className="text-blue-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Car Number</p>
              <p className="text-sm font-semibold text-white font-mono">
                {car.carNumber || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors duration-300">
            <div className="p-2 bg-gray-600 rounded-lg">
              <FiDroplet className="text-green-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fuel Type</p>
              <p className="text-sm font-semibold text-white capitalize">
                {car.fuelType || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors duration-300">
            <div className="p-2 bg-gray-600 rounded-lg">
              <FiSettings className="text-purple-400" size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Transmission</p>
              <p className="text-sm font-semibold text-white capitalize">
                {car.transmission || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Specifications */}
        {(car.seater || car.exteriorColor) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {car.seater && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">
                <FiUsers className="text-gray-400" size={12} />
                {car.seater} Seater
              </span>
            )}
            {car.exteriorColor && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">
                <div
                  className="w-3 h-3 rounded-full border border-gray-600"
                  style={{ backgroundColor: car.exteriorColor.toLowerCase() }}
                />
                {car.exteriorColor}
              </span>
            )}
          </div>
        )}

        {/* Agent Verification Badge (only show if agent verified) */}
        {car.agentName && (
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg">
                ✅ Verified by {car.agentName}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6">
          {isApprovalPage && currentUser?.role === "agent" ? (
            <div className="flex space-x-3">
              <motion.button
                onClick={() => onApprove(car)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Verify
              </motion.button>
              <motion.button
                onClick={() => onReject(car._id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reject
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => navigate(`/car/${car._id}`)}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300"
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
