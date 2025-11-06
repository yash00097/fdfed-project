import {
  BsSpeedometer2,
  BsTag,
  BsPeople,
  BsFuelPump,
  BsGear,
  BsGeoAlt,
  BsPerson,
  BsClock,
  BsExclamationCircle,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
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

export default function Card({ car, onAccept, isApprovalPage = false, isVerifyPage = false, onReject }) {
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

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % car.photos.length);
  };
  
  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + car.photos.length) % car.photos.length);
  };
  
  const goToImage = (index, e) => {
    e?.stopPropagation();
    setCurrentImageIndex(index);
  };

  const getVerificationStatus = () => {
    if (!car.verificationDeadline) return null;
    
    const now = new Date();
    const deadline = new Date(car.verificationDeadline);
    const timeDiff = deadline - now;
    
    if (timeDiff < 0) return 'expired';
    if (timeDiff < 24 * 60 * 60 * 1000) return 'urgent';
    return 'normal';
  };

  const verificationStatus = getVerificationStatus();

  return (
    <motion.div
      className="group bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 flex flex-col border border-gray-700/50 hover:border-green-400/50 hover:shadow-2xl hover:shadow-green-500/5 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      {car.status === 'verification' && (
        <div className="absolute top-4 left-4 z-20">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            verificationStatus === 'expired' 
              ? 'bg-red-500/20 text-red-300 border-red-500/30' 
              : verificationStatus === 'urgent'
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>
            <BsClock className="inline w-3 h-3 mr-1" />
            {verificationStatus === 'expired' ? 'Expired' : verificationStatus === 'urgent' ? 'Urgent' : 'Verification'}
          </div>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-72 w-full overflow-hidden">
        {car.photos?.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                className="w-full h-full relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={car.photos[currentImageIndex]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </AnimatePresence>

            {car.photos.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-lg"
                >
                  <BsChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-2xl transition-all duration-300 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-lg"
                >
                  <BsChevronRight className="w-5 h-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 backdrop-blur-sm bg-black/30 rounded-2xl px-3 py-2">
                  {car.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => goToImage(i, e)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentImageIndex
                          ? "bg-green-400 scale-125 shadow-lg shadow-green-400/50"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Page Counter */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-2xl text-xs font-medium backdrop-blur-sm border border-gray-600/50">
              {currentImageIndex + 1}/{car.photos.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <BsExclamationCircle className="w-6 h-6" />
              </div>
              <p className="text-sm">No Image Available</p>
            </div>
          </div>
        )}
      </div>

      {/* Car Info */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <BsGeoAlt className="w-3 h-3" />
              {car.manufacturedYear} • {car.vehicleType} {car.city ? `• ${car.city}` : ""}
            </p>
          </div>
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent ml-4"
            whileHover={{ scale: 1.05 }}
          >
            ₹{formatIndianCurrency(car.price)}
          </motion.div>
        </div>

        {/* Seater and Color Badges */}
        {(car.seater || car.exteriorColor) && (
          <div className="flex flex-wrap gap-3">
            {car.seater && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
                <BsPeople className="w-3 h-3 text-blue-400" />
                <span className="text-sm text-blue-300 font-medium">{car.seater} Seater</span>
              </div>
            )}
            {car.exteriorColor && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
                <div
                  className="w-3 h-3 rounded-full border border-purple-400/50 shadow-sm"
                  style={{ backgroundColor: car.exteriorColor.toLowerCase() }}
                />
                <span className="text-sm text-purple-300 font-medium capitalize">{car.exteriorColor}</span>
              </div>
            )}
          </div>
        )}

        {/* Seller & Address & Verification Info for Approval Pages */}
        {isApprovalPage && (
          <div className="space-y-4">
            {/* Address and Seller Contact - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Section */}
              {(car.address || car.city || car.state || car.pincode) && (
                <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <BsGeoAlt className="w-3 h-3" />
                    Address
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {[car.address, car.city, car.state, car.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {/* Seller Contact Section */}
              {(car.sellerName || car.sellerphone) && (
                <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-700/30">
                  <p className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                    <BsPerson className="w-3 h-3" />
                    Seller Contact
                  </p>
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
            </div>

            {/* Verification Timeline Section - Below Address & Seller */}
            {car.status === 'verification' && (
              <div className="p-4 bg-orange-900/20 rounded-xl border border-orange-700/30">
                <p className="text-xs text-orange-400 mb-3 flex items-center gap-1">
                  <BsClock className="w-3 h-3" />
                  Verification Timeline
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {car.verificationDays && (
                    <div className="text-center">
                      <p className="text-xs text-orange-400 mb-1">Allocated Days</p>
                      <p className="text-lg font-bold text-orange-300">{car.verificationDays} days</p>
                    </div>
                  )}
                  {car.verificationDeadline && (
                    <div className="text-center">
                      <p className="text-xs text-orange-400 mb-1">Deadline</p>
                      <p className="text-sm font-semibold text-orange-200">
                        {new Date(car.verificationDeadline).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {verificationStatus && (
                    <div className="text-center">
                      <p className="text-xs text-orange-400 mb-1">Status</p>
                      <div className={`text-sm font-bold px-3 py-1 rounded-lg ${
                        verificationStatus === 'expired' 
                          ? 'bg-red-500/20 text-red-300' 
                          : verificationStatus === 'urgent'
                          ? 'bg-orange-500/20 text-orange-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {verificationStatus === 'expired'
                          ? '🚨 EXPIRED'
                          : verificationStatus === 'urgent'
                          ? '⚠️ URGENT'
                          : '✅ ON TRACK'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Stat
            icon={<BsSpeedometer2 className="text-green-400" />}
            label="Mileage"
            value={`${car.traveledKm || 0} km`}
          />
          <Stat
            icon={<BsTag className="text-blue-400" />}
            label="Car Number"
            value={car.carNumber || "—"}
          />
          <Stat
            icon={<BsFuelPump className="text-teal-400" />}
            label="Fuel Type"
            value={car.fuelType || "—"}
          />
          <Stat
            icon={<BsGear className="text-purple-400" />}
            label="Transmission"
            value={car.transmission || "—"}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-2">
          {isApprovalPage && currentUser?.role === "agent" ? (
            <>
              {isVerifyPage ? (
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => onAccept(car)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Approve Car
                  </motion.button>

                  <motion.button
                    onClick={() => onReject(car._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reject
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => onAccept(car)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Approve Listing
                </motion.button>
              )}
            </>
          ) : (
            <motion.button
              onClick={() => navigate(`/car/${car._id}`)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02, y: -1 }}
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

// Enhanced Helper Components
const Stat = ({ icon, label, value }) => (
  <motion.div 
    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 group"
    whileHover={{ y: -2 }}
  >
    <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-gray-600/50 transition-colors duration-300">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 truncate">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  </motion.div>
);