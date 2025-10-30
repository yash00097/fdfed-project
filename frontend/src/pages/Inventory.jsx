import { useState, useEffect } from "react";
import Card from "../components/Card.jsx";
import BrandModelSelector from "../components/BrandModelSelector.jsx";
import inventoryBgImage from "../assets/images/inventoryBgImage.jpg";
import GradientText from "../react-bits/GradientText/GradientText.jsx";

export default function Inventory() {
  const storedFilters = JSON.parse(localStorage.getItem("carFilters")) || {
    brand: "",
    model: "",
    transmission: "",
    fuelType: "",
    priceRange: "",
    vehicleType: "",
    exteriorColor: "",
    manufacturedYear: "",
    seater: "",
    traveledKm: ""
  };

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(storedFilters);
  const [error, setError] = useState(null);

  // Generate year options (from 1990 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear; year >= 1990; year--) {
    yearOptions.push(year);
  }

  // KM range options
  const kmOptions = [
    { value: "", label: "All" },
    { value: "10000", label: "Under 10,000 km" },
    { value: "25000", label: "Under 25,000 km" },
    { value: "50000", label: "Under 50,000 km" },
    { value: "75000", label: "Under 75,000 km" },
    { value: "100000", label: "Under 1,00,000 km" },
    { value: "150000", label: "Under 1,50,000 km" },
    { value: "200000", label: "Under 2,00,000 km" }
  ];

  useEffect(() => {
    localStorage.setItem("carFilters", JSON.stringify(filters));
  }, [filters]);

  const fetchCars = async (currentFilters) => {
    try {
      setLoading(true);

      // Remove empty filters
      const cleanFilters = {};
      Object.keys(currentFilters).forEach((key) => {
        if (currentFilters[key] !== "" && currentFilters[key] !== null) {
          cleanFilters[key] = currentFilters[key];
        }
      });

      const queryParams = new URLSearchParams(cleanFilters).toString();
      console.log('Fetching cars with URL:', `/backend/cars/inventory?${queryParams}`);

      const res = await fetch(`/backend/cars/inventory?${queryParams}`, {
        credentials: "include",
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Response data:', data);

      if (data.success) {
        setCars(data.cars);
      } else {
        console.error('API returned success: false', data.message);
        setCars([]);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(filters);
  }, []);

  const handleBrandModelChange = (brandModel) => {
    setFilters(prev => ({
      ...prev,
      brand: brandModel.brand,
      model: brandModel.model
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    const clearedFilters = {
      brand: "",
      model: "",
      transmission: "",
      fuelType: "",
      priceRange: "",
      vehicleType: "",
      exteriorColor: "",
      manufacturedYear: "",
      seater: "",
      traveledKm: ""
    };
    setFilters(clearedFilters);
    fetchCars(clearedFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin"></div>
          <p className="text-xl text-gray-300">Loading available cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading cars</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCars(filters);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div
        className="relative w-full h-108 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${inventoryBgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 mt-50">
          <div className="p-10 mb-10">
            {/* Dropdowns */}
            <div className="grid grid-cols-1 gap-6">
              {/* Brand Model Selector Component */}
              <BrandModelSelector
                value={{ brand: filters.brand, model: filters.model }}
                onChange={handleBrandModelChange}
              />

              {/* First Row of Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Transmission */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Transmission</label>
                  <select
                    name="transmission"
                    value={filters.transmission}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={filters.fuelType}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Price Range</label>
                  <select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All</option>
                    <option value="0-500000">Under ₹5 Lakh</option>
                    <option value="500001-1000000">₹5 - ₹10 Lakh</option>
                    <option value="1000001-2000000">₹10 - ₹20 Lakh</option>
                    <option value="2000001-5000000">₹20 - ₹50 Lakh</option>
                    <option value="5000001">Above ₹50 Lakh</option>
                  </select>
                </div>

                {/* Vehicle Type */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={filters.vehicleType}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                  </select>
                </div>
              </div>

              {/* Second Row of Filters - New Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Exterior Color */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Exterior Color</label>
                  <input
                    type="text"
                    name="exteriorColor"
                    value={filters.exteriorColor}
                    onChange={handleFilterChange}
                    placeholder="Enter color"
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  />
                </div>

                {/* Manufactured Year */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Min. Manufactured Year</label>
                  <select
                    name="manufacturedYear"
                    value={filters.manufacturedYear}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All Years</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seater */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Seater</label>
                  <select
                    name="seater"
                    value={filters.seater}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    <option value="">All</option>
                    <option value="2">2 Seater</option>
                    <option value="4">4 Seater</option>
                    <option value="5">5 Seater</option>
                    <option value="6">6 Seater</option>
                    <option value="7">7 Seater</option>
                    <option value="8">8+ Seater</option>
                  </select>
                </div>

                {/* Max KM Driven */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-300">Max KM Driven</label>
                  <select
                    name="traveledKm"
                    value={filters.traveledKm}
                    onChange={handleFilterChange}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  >
                    {kmOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="my-8 flex justify-center gap-4">
              <button
                onClick={resetFilters}
                className="bg-transparent border border-slate-500 text-slate-300 hover:bg-slate-700/50 px-10 py-3 rounded-lg font-medium transition-colors"
              >
                Reset Filter
              </button>
              <button
                onClick={() => fetchCars(filters)}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-lg font-medium transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section for Cars */}
      <div className="py-10 px-6">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={10}
          showBorder={false}
          className="custom-class text-3xl font-semibold"
        >
          Available Cars
        </GradientText>

        {cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cars.map((car) => (
              <Card key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center text-lg">
            No cars match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
