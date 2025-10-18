import React, { useState, useEffect } from "react";
import Card from "../components/Card.jsx";

export default function Inventory() {
  // Initialize filters from localStorage if available
  const storedFilters = JSON.parse(localStorage.getItem("carFilters")) || {
    vehicleType: "",
    transmission: "",
    seater: "",
    exteriorColor: "",
    fuelType: "",
    traveledKm: "",
    manufacturedYear: "",
    price: "",
  };

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(storedFilters);
  const [error, setError] = useState(null);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("carFilters", JSON.stringify(filters));
  }, [filters]);

  // Fetch cars from backend
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

  // Fetch all cars on mount
  useEffect(() => {
    fetchCars(filters);
  }, []);

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    const clearedFilters = {
      vehicleType: "",
      transmission: "",
      seater: "",
      exteriorColor: "",
      fuelType: "",
      traveledKm: "",
      manufacturedYear: "",
      price: "",
    };
    setFilters(clearedFilters);        // clear all filter inputs
    fetchCars(clearedFilters);         // fetch all cars automatically
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
    <div className="min-h-screen bg-gray-900 py-10 px-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Available Cars</h1>

      {/* Filter Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">Filter Cars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">

          {/* Vehicle Type */}
          <select
            name="vehicleType"
            value={filters.vehicleType}
            onChange={handleFilterChange}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          >
            <option value="">Vehicle Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="off-road">Off-Road</option>
            <option value="sport">Sport</option>
            <option value="muscle">Muscle</option>
          </select>

          {/* Transmission */}
          <select
            name="transmission"
            value={filters.transmission}
            onChange={handleFilterChange}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          >
            <option value="">Transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>

          {/* Fuel Type */}
          <select
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          >
            <option value="">Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="gas">Gas</option>
          </select>

          {/* Seater */}
          <input
            type="number"
            name="seater"
            value={filters.seater}
            onChange={handleFilterChange}
            placeholder="Seater"
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          />

          {/* Exterior Color */}
          <input
            type="text"
            name="exteriorColor"
            value={filters.exteriorColor}
            onChange={handleFilterChange}
            placeholder="Exterior Color"
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          />

          {/* Manufactured Year */}
          <input
            type="number"
            name="manufacturedYear"
            value={filters.manufacturedYear}
            onChange={handleFilterChange}
            placeholder="Manufactured Year"
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
          />

          {/* Traveled Km */}
          <div>
            <label className="text-sm text-gray-400 mb-1">
              Max Traveled Km: {filters.traveledKm || "Any"}
            </label>
            <input
              type="range"
              name="traveledKm"
              min="0"
              max="200000"
              step="5000"
              value={filters.traveledKm}
              onChange={handleFilterChange}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-sm text-gray-400 mb-1">
              Max Price: ₹{filters.price || "Any"}
            </label>
            <input
              type="range"
              name="price"
              min="0"
              max="5000000"
              step="50000"
              value={filters.price}
              onChange={handleFilterChange}
              className="w-full accent-green-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={resetFilters}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Reset Filters
          </button>

          <button
            onClick={() => fetchCars(filters)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Cars Grid */}
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
  );
}