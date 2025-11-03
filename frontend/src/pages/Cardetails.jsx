import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiDroplet,
  FiSettings,
  FiTruck,
  FiPhone,
  FiZap,
  FiMapPin,
  FiAward,
} from "react-icons/fi";

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/backend/cars/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success) setCar(data.car);
        else setError(data.message || "Failed to fetch car details");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212529] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212529] text-white">
        <div className="bg-red-900/30 p-6 rounded-xl text-center max-w-md border border-red-500/50">
          {/* need to be removed later */}
          <h3 className="text-xl mb-3 text-red-400">Error: {error}</h3>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg mt-3"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (!car)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#212529] text-white">
        <div className="text-center bg-gray-800/70 p-6 rounded-xl border border-gray-700 max-w-md">
          <p className="text-yellow-400 mb-3 text-lg">Car not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg mt-3"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#212529] text-white font-inter px-4 py-8 sm:px-8">
      <div className="mt-25"></div>
      {/* Back Button */}
      

   {/* Header + Image Gallery Side by Side */}
    <div className="grid md:grid-cols-[2fr_1fr] gap-8 mb-10">
      {/* Image Gallery Section (Left & Bigger) */}
      <div>
        <div className="relative rounded-lg overflow-hidden mb-4 shadow-lg border border-gray-700">
          <img
            src={car.photos?.[activeImageIndex] || "/images/default-car.jpg"}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-[550px] object-cover"
          />
          {car.photos?.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImageIndex(
                    activeImageIndex === 0
                      ? car.photos.length - 1
                      : activeImageIndex - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70"
              >
                <i className="bi bi-chevron-left text-xl"></i>
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex(
                    activeImageIndex === car.photos.length - 1
                      ? 0
                      : activeImageIndex + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-3 rounded-full hover:bg-black/70"
              >
                <i className="bi bi-chevron-right text-xl"></i>
              </button>
            </>
          )}
          {car.photos?.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-full text-sm">
              {activeImageIndex + 1}/{car.photos.length}
            </div>
          )}
        </div>

        {car.photos?.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {car.photos.map((p, i) => (
              <img
                key={i}
                src={p}
                onClick={() => setActiveImageIndex(i)}
                className={`h-24 w-36 object-cover rounded-md cursor-pointer border transition ${
                  i === activeImageIndex
                    ? "border-blue-500 scale-105"
                    : "border-gray-700 opacity-70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

    <div className="bg-[#1f2429] rounded-2xl shadow-[0_10px_30px_#3b82f650] p-8 border border-gray-700 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_40px_#3b82f680]">
  {/* Car Title & Status */}
  <div className="mb-6">
    <h1 className="text-4xl font-bold mb-4 flex items-center gap-4">
      {car.brand} {car.model}
      {car.status === "available" && (
        <span className="bg-green-500 text-sm px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
          <FiAward className="text-white" /> Verified
        </span>
      )}
    </h1>

    {/* Tags */}
    <div className="flex flex-wrap gap-3 mb-5">
      <span className="bg-blue-600 text-sm px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
        <FiTruck /> {car.vehicleType}
      </span>
      <span className="bg-gray-700 text-sm px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
        <FiSettings /> {car.transmission}
      </span>
      <span className="bg-teal-600 text-sm px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
        <FiDroplet /> {car.fuelType}
      </span>
    </div>

    {/* Basic Info */}
    <div className="flex flex-wrap gap-6 text-gray-300 text-lg">
      <span className="flex items-center gap-2">
        <FiCalendar className="text-blue-400" /> {car.manufacturedYear}
      </span>
      <span className="flex items-center gap-2">
        <FiTrendingUp className="text-blue-400" /> {car.traveledKm?.toLocaleString()} km
      </span>
    </div>
  </div>

  {/* Price & Specs */}
  <div className="mt-4 border-t border-gray-700 pt-6 grid md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-blue-400 text-4xl font-bold mb-2 flex items-center gap-2">
        <FiZap /> ₹{car.price?.toLocaleString()}
      </h3>
      <p className="text-gray-400 text-lg">On-Road Price (approx)</p>

      <div className="mt-5 grid grid-cols-2 gap-4 text-white">
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiSettings className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.engine} cc</span>
        </div>
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiZap className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.power} bhp</span>
        </div>
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiTrendingUp className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.torque} Nm</span>
        </div>
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiTruck className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.driveType}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiAward className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.topSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-2 bg-[#2b3035] p-3 rounded-lg shadow-sm hover:scale-[1.03] transition-all">
          <FiUsers className="text-blue-400 text-xl" />
          <span className="font-semibold">{car.seater} Seats</span>
        </div>
      </div>
    </div>

    {/* CTA Buttons */}
    {/* CTA Buttons */}
<div className="flex flex-col justify-center gap-4">
  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-2">
    <FiZap /> Buy Now
  </button>

  <button className="w-full border border-gray-500 hover:border-blue-500 text-gray-200 hover:text-white py-4 rounded-xl font-bold transition-all duration-300 text-lg flex items-center justify-center gap-2">
    <FiPhone /> Contact Seller
  </button>

  <a
    href={`https://wa.me/${car.sellerphone}`}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all duration-300 text-lg flex items-center justify-center gap-3"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      alt="WhatsApp"
      className="w-6 h-6"
    />
    WhatsApp Seller
  </a>
</div>

  </div>
</div>


    </div>
{/* Tabs Navigation */}
<div className="mb-8 flex flex-wrap gap-6 border-b border-gray-700 pb-2">
  {[
    { key: "specs", label: "Specifications", icon: <FiSettings /> },
    { key: "features", label: "Features", icon: <FiAward /> },
    { key: "details", label: "Additional Details", icon: <FiMapPin /> },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`relative flex items-center gap-2 pb-3 text-sm sm:text-base font-semibold uppercase tracking-wide transition-all duration-300 ${
        activeTab === tab.key
          ? "text-blue-400"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      <span className="text-lg">{tab.icon}</span>
      {tab.label}
      {/* Animated underline */}
      <span
        className={`absolute left-0 bottom-0 h-[2px] rounded-full transition-all duration-300 ${
          activeTab === tab.key
            ? "w-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
            : "w-0 bg-transparent"
        }`}
      ></span>
    </button>
  ))}
</div>

{/* Tabs Content Wrapper */}
<div className="bg-[#2b3035] border border-gray-700 p-6 rounded-xl shadow-lg transition-all duration-300">

  {/* SPECIFICATIONS TAB */}
  {activeTab === "specs" && (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[
        { label: "Engine", value: `${car.engine} cc`, icon: <FiSettings /> },
        { label: "Power", value: `${car.power} bhp`, icon: <FiZap /> },
        { label: "Torque", value: `${car.torque} Nm`, icon: <FiTrendingUp /> },
        { label: "Drive Type", value: car.driveType, icon: <FiTruck /> },
        { label: "Top Speed", value: `${car.topSpeed} km/h`, icon: <FiAward /> },
        { label: "Ground Clearance", value: `${car.groundClearance} mm`, icon: <FiUsers /> },
        { label: "Fuel Tank", value: `${car.fuelTank} L`, icon: <FiDroplet /> },
        { label: "Seating", value: `${car.seater} Seats`, icon: <FiUsers /> },
        { label: "Year", value: car.manufacturedYear, icon: <FiCalendar /> },
      ]
        .filter((s) => s.value && s.value !== "undefined cc")
        .map((spec, i) => (
          <div
            key={i}
            className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300"
          >
            <div className="flex items-center mb-2 text-blue-400 text-lg gap-2">
              {spec.icon}
              <h4 className="font-semibold">{spec.label}</h4>
            </div>
            <p className="text-white text-lg font-medium">{spec.value}</p>
          </div>
        ))}
    </div>
  )}

  {/* FEATURES TAB */}
{activeTab === "features" && (
  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
    {/* Vehicle Info Cards */}
    {[
      { label: "Vehicle Type", value: car.vehicleType, icon: <FiTruck /> },
      { label: "Transmission", value: car.transmission, icon: <FiSettings /> },
      { label: "Fuel Type", value: car.fuelType, icon: <FiDroplet /> },
      { label: "Color", value: car.exteriorColor, icon: <FiAward /> },
    ].map((feature, i) => (
      <div
        key={i}
        className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300"
      >
        <div className="flex items-center mb-2 text-blue-400 text-lg gap-2">
          {feature.icon}
          <h4 className="font-semibold">{feature.label}</h4>
        </div>
        <p className="text-white text-lg font-medium">{feature.value}</p>
      </div>
    ))}

    {/* Performance Cards */}
    {[
      { label: "Engine", value: `${car.engine} cc`, icon: <FiSettings /> },
      { label: "Power", value: `${car.power} bhp`, icon: <FiZap /> },
      { label: "Torque", value: `${car.torque} Nm`, icon: <FiTrendingUp /> },
      { label: "Top Speed", value: `${car.topSpeed} km/h`, icon: <FiAward /> },
    ].map((perf, i) => (
      <div
        key={i}
        className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300"
      >
        <div className="flex items-center mb-2 text-blue-400 text-lg gap-2">
          {perf.icon}
          <h4 className="font-semibold">{perf.label}</h4>
        </div>
        <p className="text-white text-lg font-medium">{perf.value}</p>
      </div>
    ))}
  </div>
)}


  {/* DETAILS TAB */}
{activeTab === "details" && (
  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
    {/* Location Card */}
    <div className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300">
      <div className="flex items-center mb-3 text-blue-400 text-lg gap-2">
        <FiMapPin />
        <h4 className="font-semibold">Location</h4>
      </div>
      <p className="text-gray-300">
        {[car.address, car.city, car.state, car.pincode].filter(Boolean).join(", ")}
      </p>
    </div>

    {/* Seller Name Card */}
    <div className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300">
      <div className="flex items-center mb-3 text-blue-400 text-lg gap-2">
        <FiUsers />
        <h4 className="font-semibold">Seller Name</h4>
      </div>
      <p className="text-white font-medium">{car.sellerName}</p>
    </div>

    {/* Contact Card */}
    <div className="bg-[#343a40] border border-gray-700 p-5 rounded-lg hover:border-blue-500 hover:shadow-[0_0_15px_#3b82f650] transition-all duration-300">
      <div className="flex items-center mb-3 text-blue-400 text-lg gap-2">
        <FiPhone />
        <h4 className="font-semibold">Contact</h4>
      </div>
      <p className="text-white font-medium">{car.sellerphone}</p>
      {car.agent && (
        <p className="text-gray-300 mt-2">
          Verified By: <span className="text-blue-400">{car.agentName}</span>
        </p>
      )}
      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all">
        <FiPhone /> Contact Seller
      </button>
    </div>
  </div>
)}

  
</div>

      




    </div>
  );
}
