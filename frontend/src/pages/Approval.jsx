import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function Approval() {
  const { currentUser } = useSelector((state) => state.user);
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [technicalSpecs, setTechnicalSpecs] = useState({
    engine: '',
    torque: '',
    power: '',
    groundClearance: '',
    topSpeed: '',
    fuelTank: '',
    driveType: ''
  });

  // Fetch pending cars assigned to the agent
  const fetchPendingCars = async () => {
    try {
      const res = await fetch('/backend/agent/assigned', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setPendingCars(data.cars);
      }
    } catch (error) {
      console.error('Error fetching pending cars:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, []);

  // Handle car approval
  const handleApprove = async (carId) => {
    try {
      const res = await fetch(`/backend/agent/approve/${carId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(technicalSpecs)
      });
      const data = await res.json();
      if (data.success) {
        alert('Car approved successfully!');
        setShowApprovalForm(false);
        setSelectedCar(null);
        setTechnicalSpecs({
          engine: '',
          torque: '',
          power: '',
          groundClearance: '',
          topSpeed: '',
          fuelTank: '',
          driveType: ''
        });
        fetchPendingCars(); // Refresh the list
      } else {
        alert('Failed to approve car');
      }
    } catch (error) {
      console.error('Error approving car:', error);
      alert('Error approving car');
    }
  };

  // Handle car rejection
  const handleReject = async (carId) => {
    if (window.confirm('Are you sure you want to reject this car?')) {
      try {
        const res = await fetch(`/backend/agent/reject/${carId}`, {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          alert('Car rejected successfully!');
          fetchPendingCars(); // Refresh the list
        } else {
          alert('Failed to reject car');
        }
      } catch (error) {
        console.error('Error rejecting car:', error);
        alert('Error rejecting car');
      }
    }
  };

  // Open approval form with technical specs
  const openApprovalForm = (car) => {
    setSelectedCar(car);
    setShowApprovalForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading pending cars...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'agent') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Access denied. Agent role required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Car Approval Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and approve pending car listings</p>
        </div>

        {pendingCars.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-500">No pending cars to review</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCars.map((car) => (
              <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {car.photos && car.photos.length > 0 && (
                    <img
                      src={car.photos[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-gray-600">Car Number: {car.carNumber}</p>
                  <p className="text-gray-600">Year: {car.manufacturedYear}</p>
                  <p className="text-gray-600">Price: ₹{car.price?.toLocaleString()}</p>
                  <p className="text-gray-600">Seller: {car.sellerName}</p>
                  <p className="text-gray-600">Phone: {car.sellerphone}</p>
                  <p className="text-gray-600">Mileage: {car.traveledKm} km</p>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => openApprovalForm(car)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(car._id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approval Form Modal */}
        {showApprovalForm && selectedCar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Approve {selectedCar.brand} {selectedCar.model}
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Technical Specifications (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine (cc)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.engine}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, engine: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Torque (Nm)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.torque}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, torque: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 350"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Power (bhp)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.power}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, power: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 150"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ground Clearance (mm)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.groundClearance}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, groundClearance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 180"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Top Speed (km/h)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.topSpeed}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, topSpeed: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Tank (L)
                    </label>
                    <input
                      type="number"
                      value={technicalSpecs.fuelTank}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, fuelTank: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drive Type
                    </label>
                    <select
                      value={technicalSpecs.driveType}
                      onChange={(e) => setTechnicalSpecs({...technicalSpecs, driveType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Drive Type</option>
                      <option value="FWD">FWD (Front Wheel Drive)</option>
                      <option value="RWD">RWD (Rear Wheel Drive)</option>
                      <option value="AWD">AWD (All Wheel Drive)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handleApprove(selectedCar._id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve Car
                </button>
                <button
                  onClick={() => setShowApprovalForm(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}