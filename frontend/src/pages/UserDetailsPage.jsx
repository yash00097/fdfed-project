import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const UserDetailsPage = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/backend/user/detailed/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setUserDetails(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/40">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200 mb-2">User not found</h2>
          <p className="text-gray-400">The requested user does not exist.</p>
        </div>
      </div>
    );
  }

  const { user, sellRequests, boughtCars, requestedCars, soldRevenue, boughtRevenue, sellRequestsStatus, soldCars, boughtCarsList, carRequestsList } = userDetails;

  // Add fallback values for missing data structures
  const safeSellRequestsStatus = sellRequestsStatus || { available: 0, pending: 0, rejected: 0 };
  const safeSoldCars = soldCars || [];
  const safeBoughtCarsList = boughtCarsList || [];
  const safeCarRequestsList = carRequestsList || [];
  const safeUser = user || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 mt-30">
        <h1 className="text-3xl font-bold tracking-tight mb-6">User Details</h1>

        {/* User Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">User Summary</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Email</th>
                  
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sell Requests</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Bought Cars</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Requested Cars</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sold Revenue</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Bought Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 border-b border-gray-800">{safeUser.email ?? '—'}</td>
                  
                  <td className="py-3 px-4 border-b border-gray-800">{safeUser.username ?? '—'}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-blue-400 font-medium">{sellRequests}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-medium">{boughtCars}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-yellow-300 font-medium">{requestedCars}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-purple-300 font-semibold">₹{soldRevenue}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-purple-300 font-semibold">₹{boughtRevenue}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sell Request Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Sell Request Status</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Available</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Pending</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Rejected</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-medium">{safeSellRequestsStatus.available}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-yellow-300 font-medium">{safeSellRequestsStatus.pending}</td>
                  <td className="py-3 px-4 border-b border-gray-800 text-red-400 font-medium">{safeSellRequestsStatus.rejected}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sold Cars */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Sold Cars</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Brand</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Model</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car Number</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Sold Price</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {safeSoldCars.map(car => (
                  <tr key={car._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-800">{car?.brand ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{car?.model ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{car?.vehicleType ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{car?.carNumber ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-semibold">₹{car?.price ?? 0}</td>
                    <td className="py-3 px-4 border-b border-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(car?.status ?? '') === 'sold' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {car?.status ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bought Cars */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Bought Cars</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Model</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Car Number</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Bought From</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                {safeBoughtCarsList.map(purchase => (
                  <tr key={purchase._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-800">{purchase?.car?.model ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{purchase?.car?.carNumber ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{purchase?.car?.sellerName ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800 text-green-400 font-semibold">₹{purchase?.totalPrice ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>  
          </div>
        </div>

        {/* Car Requests */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-200">Car Requests</h2>
          <div className="rounded-xl border border-gray-700 bg-gray-900/40 overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-900/60">
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Brand</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Model</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Transmission</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Fuel</th>
                  <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Year Range</th>
                </tr>
              </thead>
              <tbody>
                {safeCarRequestsList.map(request => (
                  <tr key={request._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 border-b border-gray-800">{request?.brand ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{request?.model ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{request?.vehicleType ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{request?.transmission ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{request?.fuelType ?? '—'}</td>
                    <td className="py-3 px-4 border-b border-gray-800">{request?.manufacturedYearRange?.minYear ?? 'N/A'} - {request?.manufacturedYearRange?.maxYear ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetailsPage;