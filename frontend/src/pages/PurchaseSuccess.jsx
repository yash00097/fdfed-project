import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import bgImage from '../assets/images/inventoryBgImage.jpg';

export default function PurchaseSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { purchaseData } = location.state || {};

  useEffect(() => {
    console.log('PurchaseSuccess - location.state:', location.state);
    console.log('PurchaseSuccess - purchaseData:', purchaseData);
    
    if (!purchaseData) {
      console.log('No purchase data found, redirecting to home');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [purchaseData, navigate, location.state]);

  if (!purchaseData) {
    return (
      <div 
        className="min-h-screen pt-32 pb-12 px-4 flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
        }}
      >
        <div className="text-white text-xl">Loading purchase details...</div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="min-h-screen pt-32 pb-12 px-4 bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-white text-3xl font-bold text-center mb-8">Purchase Successful</h1>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Order Confirmation Header */}
          <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-semibold text-lg">Order Confirmation</span>
          </div>

          <div className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Thank You Message */}
            <h2 className="text-2xl font-bold text-green-600 text-center mb-3">
              Thank You for Your Purchase!
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Your order has been successfully placed. We will contact you shortly with further details about your vehicle delivery.
            </p>

            {/* Order Details Section */}
            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-semibold text-green-800">Order Details</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Order ID:</span>
                  <span className="text-gray-900 font-semibold">
                    #{purchaseData._id ? purchaseData._id.slice(-8).toUpperCase() : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Purchase Date:</span>
                  <span className="text-gray-900 font-semibold">
                    {purchaseData.purchaseDate ? formatDate(purchaseData.purchaseDate) : formatDate(new Date())}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Payment Method:</span>
                  <span className="text-gray-900 font-semibold">
                    {purchaseData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Net Banking'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Amount:</span>
                  <span className="text-gray-900 font-bold text-lg">
                    ₹{(purchaseData.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3 border-t border-green-200">
                  <span className="text-gray-700 font-medium block mb-1">Delivery Address:</span>
                  <span className="text-gray-900 text-sm">
                    {purchaseData.address}, {purchaseData.city}, {purchaseData.state} - {purchaseData.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Car Details Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold text-blue-600">Car Details</span>
              </div>

              {purchaseData.car && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    {(purchaseData.car.images?.[0] || purchaseData.car.photos?.[0]) && (
                      <img 
                        src={purchaseData.car.images?.[0] || purchaseData.car.photos?.[0]} 
                        alt={`${purchaseData.car.brand} ${purchaseData.car.model}`}
                        className="w-28 h-24 object-cover rounded-2xl flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-2">
                        {purchaseData.car.brand} {purchaseData.car.model} ({purchaseData.car.year || purchaseData.car.manufacturedYear})
                      </h3>
                      <div className="flex gap-2 flex-wrap mb-2">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium">
                          {purchaseData.car.vehicleType || 'Car'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {purchaseData.car.fuelType}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                          {purchaseData.car.transmission}
                        </span>
                      </div>
                      <div className="text-blue-600 font-bold text-lg">
                        ₹{(purchaseData.car.price || purchaseData.totalPrice || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-800 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
              
              <button
                onClick={() => navigate('/inventory')}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
