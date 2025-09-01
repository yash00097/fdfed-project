import { useState } from "react";

export default function SellCar() {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    vehicleType: "",
    transmission: "",
    manufacturedYear: "",
    fuelType: "",
    seater: "",
    exteriorColor: "",
    carNumber: "",
    traveledKm: "",
    price: "",
    sellerName: "",
    sellerphone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    photos: [],
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos") {
      setFormData({ ...formData, photos: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.photos.length < 4) {
        return alert("Please upload at least 4 photos.");
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === "photos") {
        formData.photos.forEach((file) => {
          data.append("photos", file);
        });
      } else {
        // Only append non-empty values
        if (formData[key] !== "") {
          data.append(key, formData[key]);
        }
      }
    }

    // Debug log
    console.log("Form data being sent:");
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
      const res = await fetch("/backend/cars/sell", {
        method: "POST",
        body: data,
        credentials: 'include',
      });

      const result = await res.json();
      if (result.success) {
        alert("Car Sell Request Submitted Successfully!");
        setFormData({
          brand: "",
          model: "",
          vehicleType: "",
          transmission: "",
          manufacturedYear: "",
          fuelType: "",
          seater: "",
          exteriorColor: "",
          carNumber: "",
          traveledKm: "",
          price: "",
          sellerName: "",
          sellerphone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          photos: [],
        });
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-2xl mt-30">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sell Your Car</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Car Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            name="brand" 
            placeholder="Brand (e.g., Toyota, Honda)"
            value={formData.brand} 
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />

          <input 
            type="text" 
            name="model" 
            placeholder="Model (e.g., Camry, Civic)"
            value={formData.model} 
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select 
            name="vehicleType" 
            value={formData.vehicleType}
            onChange={handleChange} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="off-road">Off-road</option>
            <option value="sport">Sport</option>
            <option value="muscle">Muscle</option>
          </select>

          <select 
            name="transmission" 
            value={formData.transmission}
            onChange={handleChange} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required
          >
            <option value="">Select Transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="number" 
            name="manufacturedYear" 
            placeholder="Year"
            value={formData.manufacturedYear} 
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />

          <select 
            name="fuelType" 
            value={formData.fuelType}
            onChange={handleChange} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required
          >
            <option value="">Fuel Type</option>
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="electric">Electric</option>
            <option value="gas">Gas</option>
          </select>

          <input 
            type="number" 
            name="seater" 
            placeholder="Seats"
            value={formData.seater} 
            onChange={handleChange}
            min="2"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            name="exteriorColor" 
            placeholder="Exterior Color"
            value={formData.exteriorColor} 
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />

          <input 
            type="text" 
            name="carNumber" 
            placeholder="Registration Number"
            value={formData.carNumber} 
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="number" 
            name="traveledKm" 
            placeholder="Kilometers Driven"
            value={formData.traveledKm} 
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />

          <input 
            type="number" 
            name="price" 
            placeholder="Expected Price (₹)"
            value={formData.price} 
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
        </div>

        {/* Location Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Location Details</h3>
          
          <textarea 
            name="address" 
            placeholder="Full Address"
            value={formData.address} 
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4" 
            required 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              name="city" 
              placeholder="City"
              value={formData.city} 
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />

            <input 
              type="text" 
              name="state" 
              placeholder="State"
              value={formData.state} 
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />

            <input 
              type="text" 
              name="pincode" 
              placeholder="Pincode"
              value={formData.pincode} 
              onChange={handleChange}
              pattern="[0-9]{6}"
              maxLength="6"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
        </div>

        {/* Photos */}
        <div className="border-t pt-4">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            Upload Photos (Minimum 4 required)
          </label>
          <input 
            type="file" 
            name="photos" 
            multiple 
            accept="image/*"
            onChange={handleChange} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
          />
          <p className="text-sm text-gray-500 mt-2">
            Please upload clear photos of exterior, interior, engine, and odometer
          </p>
        </div>

        {/* Seller Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              name="sellerName" 
              placeholder="Your Full Name"
              value={formData.sellerName} 
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />

            <input 
              type="tel" 
              name="sellerphone" 
              placeholder="Phone Number (10 digits)"
              value={formData.sellerphone} 
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength="10"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
        >
          Submit Sell Request
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          After submission, our agent will contact you to verify details and complete the listing.
        </p>
      </form>
    </div>
  );
}