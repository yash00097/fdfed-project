import React, { useState, useEffect } from 'react';
import Card from "../components/Card.jsx";

export default function Inventory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailableCars = async () => {
    try {
      const res = await fetch('/backend/cars/inventory', { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        setCars(data.cars);
      } else {
        console.error('Failed to fetch available cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCars();
  }, []);

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

  if (cars.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-400 text-xl">No cars available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-white mb-10">Available Cars</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.map((car) => (
          <Card key={car._id} car={car} />
        ))}
      </div>
    </div>
  );
}