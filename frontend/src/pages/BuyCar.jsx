import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from '../assets/images/inventoryBgImage.jpg';

export default function BuyCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  // Validation state
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(value) ? '' : 'Please enter a valid 10-digit mobile number starting with 6-9';
      case 'streetAddress':
        return value.trim().length >= 5 ? '' : 'Address must be at least 5 characters';
      case 'city':
        return value.trim().length >= 2 ? '' : 'City name must be at least 2 characters';
      case 'state':
        return value ? '' : 'Please select a state';
      case 'pincode':
        const pincodeRegex = /^\d{6}$/;
        return pincodeRegex.test(value) ? '' : 'Pincode must be 6 digits';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });

    // Validate on change if field was touched
    if (touched[id]) {
      const error = validateField(id, value);
      setErrors({
        ...errors,
        [id]: error
      });
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    setTouched({
      ...touched,
      [id]: true
    });

    const error = validateField(id, value);
    setErrors({
      ...errors,
      [id]: error
    });
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-2.5 rounded-md border focus:outline-none bg-white";
    
    if (!touched[fieldName]) {
      return `${baseClass} border-gray-300 focus:border-gray-400`;
    }
    
    if (errors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500`;
    }
    
    if (formData[fieldName]) {
      return `${baseClass} border-green-500 focus:border-green-500`;
    }
    
    return `${baseClass} border-gray-300 focus:border-gray-400`;
  };

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/backend/cars/${id}`);
        const data = await res.json();
        console.log('Fetched car data:', data);
        if (data.success === false) {
          setError(data.message);
          setLoading(false);
          return;
        }
        // Extract car from the response object
        setCar(data.car || data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to make a purchase');
      navigate('/sign-in');
      return;
    }

    // Validate all fields
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'paymentMethod') {
        const error = validateField(key, formData[key]);
        if (error) allErrors[key] = error;
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      alert('Please fill all required fields correctly');
      return;
    }

    try {
      console.log('Submitting purchase with car price:', car.price);
      
      // Submit purchase to backend
      const purchaseData = {
        car: id,
        buyer: currentUser._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        totalPrice: car.price,
        status: 'pending'
      };

      console.log('Purchase data being sent:', purchaseData);

      const res = await fetch('/backend/purchase/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(purchaseData),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      // Check if there was an error
      if (!res.ok) {
        console.error('Purchase error:', data);
        alert(data.message || 'Failed to create purchase');
        return;
      }

      console.log('Purchase successful, showing modal');
      console.log('Car data:', car);
      console.log('Purchase data from backend:', data);
      
      // Set purchase data and show modal
      setPurchaseData({
        ...data,
        car: car
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('An error occurred while processing your purchase. Please try again: ' + error.message);
    }
  };

  const handleCancel = () => {
    navigate(`/car/${id}`);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
        }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
        }}
      >
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
        }}
      >
        <div className="text-white text-xl">Car not found</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-32 pb-12 px-4 bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
      }}
    >
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #000 !important;
          }
          select:-webkit-autofill,
          select:-webkit-autofill:hover,
          select:-webkit-autofill:focus,
          select:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #000 !important;
          }
        `}
      </style>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <div className="w-48 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purchase Details */}
          <div className="bg-[#1a1d21] rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-blue-600 px-6 py-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-semibold text-lg">Purchase Details</span>
            </div>
            
            <div className="bg-gray-100 p-6">
              {/* Price Details Section */}
              <div className="bg-white rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-gray-800">Price Details</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Base Price</span>
                    </div>
                    <span className="text-gray-800 font-medium">₹{(car?.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="border-t border-dotted border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-gray-800">Total Price:</span>
                      </div>
                      <span className="text-blue-600 font-bold text-xl">₹{(car?.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold text-blue-600">Personal Information</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={getFieldClassName('firstName')}
                    />
                    {touched.firstName && !errors.firstName && formData.firstName && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.firstName && errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={getFieldClassName('lastName')}
                    />
                    {touched.lastName && !errors.lastName && formData.lastName && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.lastName && errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={getFieldClassName('email')}
                    />
                    {touched.email && !errors.email && formData.email && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.email && errors.email && (
                      <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={getFieldClassName('phone')}
                    />
                    {touched.phone && !errors.phone && formData.phone && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.phone && errors.phone && (
                      <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-blue-600">Delivery Information</span>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={getFieldClassName('streetAddress')}
                  />
                  {touched.streetAddress && !errors.streetAddress && formData.streetAddress && (
                    <p className="text-green-600 text-xs mt-1">Looks good!</p>
                  )}
                  {touched.streetAddress && errors.streetAddress && (
                    <p className="text-red-600 text-xs mt-1">{errors.streetAddress}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={getFieldClassName('city')}
                    />
                    {touched.city && !errors.city && formData.city && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.city && errors.city && (
                      <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`${getFieldClassName('state')} bg-white`}
                    >
                      <option value="">Select State</option>
                      <option value="AP">Andhra Pradesh</option>
                      <option value="AR">Arunachal Pradesh</option>
                      <option value="AS">Assam</option>
                      <option value="BR">Bihar</option>
                      <option value="CG">Chhattisgarh</option>
                      <option value="GA">Goa</option>
                      <option value="GJ">Gujarat</option>
                      <option value="HR">Haryana</option>
                      <option value="HP">Himachal Pradesh</option>
                      <option value="JK">Jammu and Kashmir</option>
                      <option value="JH">Jharkhand</option>
                      <option value="KA">Karnataka</option>
                      <option value="KL">Kerala</option>
                      <option value="MP">Madhya Pradesh</option>
                      <option value="MH">Maharashtra</option>
                      <option value="MN">Manipur</option>
                      <option value="ML">Meghalaya</option>
                      <option value="MZ">Mizoram</option>
                      <option value="NL">Nagaland</option>
                      <option value="OD">Odisha</option>
                      <option value="PB">Punjab</option>
                      <option value="RJ">Rajasthan</option>
                      <option value="SK">Sikkim</option>
                      <option value="TN">Tamil Nadu</option>
                      <option value="TS">Telangana</option>
                      <option value="TR">Tripura</option>
                      <option value="UP">Uttar Pradesh</option>
                      <option value="UK">Uttarakhand</option>
                      <option value="WB">West Bengal</option>
                      <option value="DL">Delhi</option>
                    </select>
                    {touched.state && !errors.state && formData.state && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.state && errors.state && (
                      <p className="text-red-600 text-xs mt-1">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      pattern="[0-9]{6}"
                      maxLength="6"
                      className={getFieldClassName('pincode')}
                    />
                    {touched.pincode && !errors.pincode && formData.pincode && (
                      <p className="text-green-600 text-xs mt-1">Looks good!</p>
                    )}
                    {touched.pincode && errors.pincode && (
                      <p className="text-red-600 text-xs mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-semibold text-blue-600">Payment Method</span>
                </div>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                    formData.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium text-gray-800">Cash on Delivery</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                    formData.paymentMethod === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={formData.paymentMethod === 'netbanking'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-medium text-gray-800">Net Banking</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Purchase
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-gray-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && purchaseData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-green-600 px-6 py-4 flex items-center justify-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-semibold text-lg">Order Confirmation</span>
                </div>
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
                        {new Date().toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
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
                            className="w-32 h-28 object-cover rounded-2xl flex-shrink-0 border border-gray-300"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base mb-2">
                            {purchaseData.car.brand} {purchaseData.car.model} ({purchaseData.car.year || purchaseData.car.manufacturedYear})
                          </h3>
                          <div className="flex gap-2 flex-wrap mb-2">
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium">
                              {purchaseData.car.vehicleType || 'SUV'}
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
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate('/profile');
                    }}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-800 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate('/inventory');
                    }}
                    className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
