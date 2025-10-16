import React from "react";
import { FiTrendingUp, FiTag, FiPhone } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function Card({ car, onApprove, onReject, isApprovalPage = false }) {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      {/* Car Images Carousel */}
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

      {/* Car Info Section */}
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

        {/* Car Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 my-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-gray-500" />
            <span>{car.traveledKm ? car.traveledKm.toLocaleString() : "0"} km</span>
          </div>
          <div className="flex items-center gap-2">
            <FiTag className="text-gray-500" />
            <span>{car.carNumber || "N/A"}</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-300">
            Seller:{" "}
            <span className="font-medium text-gray-200">
              {car.sellerName || "Unknown"}
            </span>
          </p>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
            <FiPhone className="text-gray-500" size={14} />
            <span>{car.sellerphone || "N/A"}</span>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="mt-6">
          {isApprovalPage && currentUser?.role === "agent" ? (
            <div className="flex space-x-3">
              <button
                onClick={() => onApprove(car)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Verify
              </button>
              <button
                onClick={() => onReject(car._id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Reject
              </button>
            </div>
          ) : (
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full font-semibold">
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}