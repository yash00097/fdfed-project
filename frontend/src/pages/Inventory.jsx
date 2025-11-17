import { useState, useEffect } from "react";
import Card from "../components/Card.jsx";
import BrandModelSelector from "../components/BrandModelSelector.jsx";
import inventoryBgImage from "../assets/images/inventoryBgImage.jpg";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import { useLocation } from "react-router-dom";

export default function Inventory() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const brandFromUrl = queryParams.get("brand") || "";

  const storedFilters = JSON.parse(localStorage.getItem("carFilters")) || {
    brand: brandFromUrl,
    model: "",
    transmission: "",
    fuelType: "",
    priceRange: "",
    vehicleType: "",
    exteriorColor: "",
    manufacturedYear: "",
    seater: "",
    traveledKm: "",
  };

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(storedFilters);
  const [error, setError] = useState(null);

  // Generate years 1990 -> current
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const kmOptions = [
    { value: "", label: "All" },
    { value: "10000", label: "Under 10,000 km" },
    { value: "25000", label: "Under 25,000 km" },
    { value: "50000", label: "Under 50,000 km" },
    { value: "75000", label: "Under 75,000 km" },
    { value: "100000", label: "Under 1,00,000 km" },
    { value: "150000", label: "Under 1,50,000 km" },
    { value: "200000", label: "Under 2,00,000 km" },
  ];

  useEffect(() => {
    localStorage.setItem("carFilters", JSON.stringify(filters));
  }, [filters]);

  const fetchCars = async (currentFilters) => {
    try {
      setLoading(true);
      const cleanFilters = {};

      Object.keys(currentFilters).forEach((k) => {
        if (currentFilters[k] !== "" && currentFilters[k] !== null) {
          cleanFilters[k] = currentFilters[k];
        }
      });

      const query = new URLSearchParams(cleanFilters).toString();

      const res = await fetch(`/backend/cars/inventory?${query}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();
      if (data.success) setCars(data.cars);
      else setCars([]);
    } catch (err) {
      setError(err.message);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandFromUrl) {
      const updated = { ...filters, brand: brandFromUrl };
      fetchCars(updated);
    } else {
      fetchCars(filters);
    }
  }, []);

  const handleBrandModelChange = (obj) => {
    setFilters((prev) => ({ ...prev, brand: obj.brand, model: obj.model }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    const cleared = {
      brand: "",
      model: "",
      transmission: "",
      fuelType: "",
      priceRange: "",
      vehicleType: "",
      exteriorColor: "",
      manufacturedYear: "",
      seater: "",
      traveledKm: "",
    };
    setFilters(cleared);
    fetchCars(cleared);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-600 rounded-full animate-spin"></div>
          <p className="text-xl">Loading available cars...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-3">Error loading cars</p>
          <p className="mb-3 text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCars(filters);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-800 text-white">

      {/* 🌟 FILTER SECTION (Compact, No big empty space) */}
      <div
        className="relative w-full flex items-end bg-cover bg-center pt-32 md:pt-36 pb-4"
        style={{
          backgroundImage: `url(${inventoryBgImage})`,
          minHeight: "45vh",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          <div className="space-y-2">

            {/* Title */}
            <div className="text-center">
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={10}
                showBorder={false}
                className="text-3xl md:text-4xl font-bold drop-shadow-2xl"
              >
                Find Your Perfect Car
              </GradientText>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 gap-2">

              <BrandModelSelector
                value={{ brand: filters.brand, model: filters.model }}
                onChange={handleBrandModelChange}
              />

              {/* FIRST ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <FilterSelect label="Transmission" name="transmission" value={filters.transmission} options={[
                  { value: "", label: "All" },
                  { value: "manual", label: "Manual" },
                  { value: "automatic", label: "Automatic" },
                ]} onChange={handleFilterChange} />

                <FilterSelect label="Fuel Type" name="fuelType" value={filters.fuelType} options={[
                  { value: "", label: "All" },
                  { value: "petrol", label: "Petrol" },
                  { value: "diesel", label: "Diesel" },
                  { value: "electric", label: "Electric" },
                  { value: "gas", label: "Gas" },
                ]} onChange={handleFilterChange} />

                <FilterSelect label="Price Range" name="priceRange" value={filters.priceRange} options={[
                  { value: "", label: "All" },
                  { value: "0-500000", label: "Under ₹5 Lakh" },
                  { value: "500001-1000000", label: "₹5 - ₹10 Lakh" },
                  { value: "1000001-2000000", label: "₹10 - ₹20 Lakh" },
                  { value: "2000001-5000000", label: "₹20 - ₹50 Lakh" },
                  { value: "5000001", label: "Above ₹50 Lakh" },
                ]} onChange={handleFilterChange} />

                <FilterSelect label="Vehicle Type" name="vehicleType" value={filters.vehicleType} options={[
                  { value: "", label: "All" },
                  { value: "sedan", label: "Sedan" },
                  { value: "suv", label: "SUV" },
                  { value: "hatchback", label: "Hatchback" },
                ]} onChange={handleFilterChange} />
              </div>

              {/* SECOND ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Color */}
                <FilterInput
                  label="Color"
                  name="exteriorColor"
                  placeholder="Enter color"
                  value={filters.exteriorColor}
                  onChange={handleFilterChange}
                />

                {/* Year */}
                <FilterSelect
                  label="Min. Year"
                  name="manufacturedYear"
                  value={filters.manufacturedYear}
                  options={[{ value: "", label: "All" },
                    ...yearOptions.map((y) => ({ value: y, label: y }))
                  ]}
                  onChange={handleFilterChange}
                />

                {/* Seater */}
                <FilterSelect
                  label="Seater"
                  name="seater"
                  value={filters.seater}
                  options={[
                    { value: "", label: "All" },
                    { value: "4", label: "4 Seater" },
                    { value: "5", label: "5 Seater" },
                  ]}
                  onChange={handleFilterChange}
                />

                {/* KM */}
                <FilterSelect
                  label="Max KM"
                  name="traveledKm"
                  value={filters.traveledKm}
                  options={kmOptions}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="mt-2 flex justify-center gap-4">
              <button
                onClick={resetFilters}
                className="bg-white/20 border border-white/40 px-6 py-2 rounded-md"
              >
                Reset
              </button>
              <button
                onClick={() => fetchCars(filters)}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md"
              >
                Apply
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ⭐ CAR SECTION — CARDS TOUCH LEFT & RIGHT */}
      <div className="py-6">
        <div className="w-full px-3 md:px-6 mx-auto">

          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={10}
            showBorder={false}
            className="text-3xl font-bold mb-4"
          >
            Available Cars
          </GradientText>

          {cars.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cars.map((car) => (
                <Card key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-xl">
              No cars match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Small helper components for cleaner UI */
function FilterSelect({ label, name, value, options, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-white mb-1 drop-shadow">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          bg-white/15 
          backdrop-blur-md 
          border border-white/30 
          rounded-lg 
          px-3 py-2.5 
          text-sm 
          text-white 
          focus:ring-2 focus:ring-cyan-400 
          focus:border-cyan-400 
          transition-all 
          duration-200 
          outline-none 
          hover:bg-white/25 
          cursor-pointer
        "
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            className="text-black bg-white"
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-white mb-1 drop-shadow">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="
          bg-white/15 
          backdrop-blur-md 
          border border-white/30 
          rounded-lg 
          px-3 py-2.5 
          text-sm 
          text-white 
          placeholder-white/70 
          focus:ring-2 focus:ring-cyan-400 
          focus:border-cyan-400 
          transition-all 
          duration-200 
          outline-none 
          hover:bg-white/25 
        "
      />
    </div>
  );
}
