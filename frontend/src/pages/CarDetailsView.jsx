import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Person,
  FileText,
  ExclamationTriangle,
  CheckCircleFill,
  Clock,
  Wrench,
  Activity,
  Shield,
  FuelPump,
  Lightning,
  Eye,
} from 'react-bootstrap-icons';

const CarDetailsView = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  const [car, setCar] = useState(null);
  const [seller, setSeller] = useState(null);
  const [agent, setAgent] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/backend/cars/${carId}`, {
          credentials: 'include',
        });

        const data = await res.json();

        if (data.success) {
          setCar(data.car);
          
          // Fetch seller details
          if (data.car.user) {
            const sellerRes = await fetch(`/backend/user/${data.car.user}`, {
              credentials: 'include',
            });
            const sellerData = await sellerRes.json();
            if (sellerData.success) {
              setSeller(sellerData.user);
            }
          }

          // Fetch agent details
          if (data.car.agent) {
            const agentRes = await fetch(`/backend/agent/detailed/${data.car.agent}`, {
              credentials: 'include',
            });
            const agentData = await agentRes.json();
            if (agentData.success) {
              setAgent(agentData.agent);
            }
          }

          // Fetch buyer details
          if (data.car.status === 'sold') {
            const purchaseRes = await fetch(`/backend/purchase/car/${carId}`, {
              credentials: 'include',
            });
            const purchaseData = await purchaseRes.json();
            if (purchaseData.success && purchaseData.purchase) {
              const purchaseBuyer = purchaseData.purchase.buyer || purchaseData.purchase.user;

              if (purchaseBuyer && typeof purchaseBuyer === 'object') {
                setBuyer(purchaseBuyer);
              } else if (purchaseBuyer) {
                const buyerRes = await fetch(`/backend/user/${purchaseBuyer}`, {
                  credentials: 'include',
                });
                const buyerData = await buyerRes.json();
                if (buyerData.success) {
                  setBuyer(buyerData.user);
                }
              }
            }
          }
        } else {
          console.error('Failed to fetch car:', data.message);
          setError(data.message || 'Failed to fetch car details');
        }
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to fetch car details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    }
  }, [carId]);

  const handleImageNavigation = (direction) => {
    if (!car?.images || car.images.length === 0) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'accepted': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'rejected': 'bg-red-500/20 text-red-400 border-red-500/50',
      'sold': 'bg-green-500/20 text-green-400 border-green-500/50',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/50',
      'cancelled': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'accepted':
        return <CheckCircleFill className="w-5 h-5" />;
      case 'rejected':
        return <ExclamationTriangle className="w-5 h-5" />;
      case 'sold':
      case 'completed':
        return <CheckCircleFill className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/40 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  const insuranceDaysLeft = car.insuranceDetails?.expiryDate
    ? Math.ceil((new Date(car.insuranceDetails.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const toEnglishText = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value !== 'string') return String(value);
    return value
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDateValue = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const formatValue = (value, fieldName = '') => {
    if (value === null || value === undefined || value === '') return 'N/A';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} item(s)` : 'N/A';
    }

    const dateLikeFields = ['createdAt', 'updatedAt', 'acceptedAt', 'purchasedAt', 'verificationDeadline', 'verificationStartTime', 'expiryDate', 'accidentDate'];
    if (dateLikeFields.includes(fieldName)) {
      return formatDateValue(value);
    }

    if (typeof value === 'string') {
      return toEnglishText(value);
    }

    return value;
  };

  const allDetailsSections = [
    {
      title: 'Car Workflow & Status',
      fields: [
        { label: 'Status', value: car.status },
        { label: 'Rejection Reason', value: car.rejectionReason },
        { label: 'Agent Name', value: car.agentName },
        { label: 'Verification Days', value: car.verificationDays },
        { label: 'Verification Deadline', value: formatValue(car.verificationDeadline, 'verificationDeadline') },
        { label: 'Verification Start Time', value: formatValue(car.verificationStartTime, 'verificationStartTime') },
        { label: 'Accepted Date', value: formatValue(car.acceptedAt, 'acceptedAt') },
        { label: 'Purchased Date', value: formatValue(car.purchasedAt, 'purchasedAt') },
      ],
    },
    {
      title: 'Seller Information & Location',
      fields: [
        { label: 'Seller Name', value: car.sellerName || seller?.username },
        { label: 'Seller Phone', value: car.sellerphone || seller?.phoneNumber },
        { label: 'Address', value: car.address },
        { label: 'City', value: car.city },
        { label: 'State', value: car.state },
        { label: 'Pincode', value: car.pincode },
      ],
    },
    {
      title: 'System Information',
      fields: [
        { label: 'Car Number / Registration', value: car.carNumber },
        { label: 'Price', value: car.price ? `₹${Number(car.price).toLocaleString('en-IN')}` : 'N/A' },
        { label: 'Created At', value: formatValue(car.createdAt, 'createdAt') },
        { label: 'Updated At', value: formatValue(car.updatedAt, 'updatedAt') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 pt-24 pb-8">
     <div className="relative z-50 max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
  type="button"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  onClick={() => {if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin/details");
    }}}
  className="relative z-50 mb-6 flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
>
  <ChevronLeft className="w-4 h-4" />
  Back
</motion.button>

        {/* Header with Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {car.brand} {car.model} <span className="text-gray-400 text-2xl md:text-3xl">({car.year})</span>
              </h1>
              <p className="text-gray-400">
                📍 {car.ownershipHistory?.[0]?.registrationCity || 'Registration city not specified'}
              </p>
            </div>
            <div className={`px-6 py-3 rounded-lg border flex items-center gap-2 font-semibold ${getStatusColor(car.status)}`}>
              {getStatusIcon(car.status)}
              <span>{car.status?.charAt(0).toUpperCase() + car.status?.slice(1)}</span>
            </div>
          </div>

          {/* Key Price Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Listing Price</p>
              <p className="text-2xl font-bold text-green-400">₹{car.price?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">No. of km Traveled</p>
              <p className="text-2xl font-bold text-blue-400">{car.mileage?.toLocaleString()} km</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Fuel Type</p>
              <p className="text-2xl font-bold text-yellow-400">{car.fuelType}</p>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery */}
        {car.images && car.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-700 mb-6"
          >
            <div className="relative">
              <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={car.images[currentImageIndex]}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxImage(car.images[currentImageIndex])}
                />
              </div>

              {/* Image Navigation */}
              {car.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {car.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Image Counter */}
            <p className="text-center text-gray-400 text-sm mt-4">
              {currentImageIndex + 1} / {car.images.length}
            </p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl border border-gray-700 mb-6 overflow-hidden"
        >
          <div className="flex flex-wrap border-b border-gray-700">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'accident', label: 'Accident History' },
              { id: 'ownership', label: 'Ownership History' },
              { id: 'insurance', label: 'Insurance' },
              { id: 'documents', label: 'Documents' },
              { id: 'parties', label: 'Parties' },
              { id: 'allDetails', label: 'All Details' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {car.description && (
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/50">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Seller Description
                    </h3>
                    <p className="text-gray-200 leading-relaxed">{car.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Lightning className="w-5 h-5 text-yellow-400" />
                    Basic Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Brand', value: car.brand },
                      { label: 'Model', value: car.model },
                      { label: 'Year', value: car.year },
                      { label: 'Transmission', value: car.transmission },
                      { label: 'Fuel Type', value: car.fuelType },
                      { label: 'Body Type', value: car.bodyType },
                      { label: 'No. of km Traveled', value: `${car.mileage?.toLocaleString()} km` },
                      { label: 'Seats', value: car.seatingCapacity },
                      { label: 'Color', value: car.color },
                    ].map((spec, idx) => (
                      <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">{spec.label}</p>
                        <p className="font-semibold text-white">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {car.engine && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-blue-400" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Engine', value: `${car.engine} cc`, icon: <FuelPump className="w-4 h-4" /> },
                        { label: 'Power', value: `${car.power} bhp`, icon: <Lightning className="w-4 h-4" /> },
                        { label: 'Torque', value: `${car.torque} Nm`, icon: <Activity className="w-4 h-4" /> },
                        { label: 'Top Speed', value: `${car.topSpeed} km/h` },
                        { label: 'Fuel Tank', value: `${car.fuelTank} L` },
                        { label: 'Ground Clearance', value: `${car.groundClearance} mm` },
                        { label: 'Drive Type', value: car.driveType || 'N/A' },
                      ].map((spec, idx) => (
                        <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                          <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                            {spec.icon}
                            {spec.label}
                          </p>
                          <p className="font-semibold text-white">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Accident History Tab */}
            {activeTab === 'accident' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {car.accidentHistory && car.accidentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {car.accidentHistory.map((incident, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-start gap-4">
                          <ExclamationTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-gray-400 text-sm">Incident Type</p>
                                <p className="font-semibold">{incident.incidentType}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Accident Date</p>
                                <p className="font-semibold">{new Date(incident.accidentDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Repair Status</p>
                                <p className="font-semibold">{incident.repairStatus}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Airbags Deployed</p>
                                <p className={`font-semibold ${incident.airbagsDeployed ? 'text-red-400' : 'text-green-400'}`}>
                                  {incident.airbagsDeployed ? 'Yes' : 'No'}
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-gray-400 text-sm">Insurance Claimed</p>
                                <p className={`font-semibold ${incident.insuranceClaimed ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {incident.insuranceClaimed ? 'Yes' : 'No'}
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-4">
                                <p className="text-gray-400 text-sm">Description</p>
                                <p className="font-semibold">{incident.description || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircleFill className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-300 font-semibold">No accident history recorded</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Ownership History Tab */}
            {activeTab === 'ownership' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {car.ownershipHistory && car.ownershipHistory.length > 0 ? (
                  <div className="space-y-4">
                    {car.ownershipHistory.map((owner, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-start gap-4">
                          <Person className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-gray-400 text-sm">Owner Sequence</p>
                                <p className="font-semibold">{owner.ownerSequence}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Usage Category</p>
                                <p className="font-semibold">{owner.usageCategory}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Registration City</p>
                                <p className="font-semibold">{owner.registrationCity}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Ownership Duration</p>
                                <p className="font-semibold">{owner.ownershipDuration}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Person className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 font-semibold">No ownership history available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {car.insuranceDetails ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 rounded-lg p-6 border border-blue-500/50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Policy Type</p>
                          <p className="text-xl font-bold text-white">{car.insuranceDetails.policyType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Provider</p>
                          <p className="text-xl font-bold text-white">{car.insuranceDetails.providerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">NCB %</p>
                          <p className="text-xl font-bold text-green-400">{car.insuranceDetails.ncbPercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Expiry Date</p>
                          <p className="text-lg font-bold text-white">
                            {new Date(car.insuranceDetails.expiryDate).toLocaleDateString()}
                          </p>
                          {insuranceDaysLeft !== null && (
                            <p className={`text-sm ${insuranceDaysLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {insuranceDaysLeft > 0 ? `${insuranceDaysLeft} days left` : 'Expired'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 font-semibold">No insurance details available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {car.documentUploads ? (
                  <div className="space-y-4">
                    {/* RC Documents */}
                    {(car.documentUploads.rcFront || car.documentUploads.rcBack) && (
                      <div>
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-400" />
                          Registration Certificate
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {car.documentUploads.rcFront && (
                            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">RC Front</span>
                                <button
                                  onClick={() =>
                                    window.open(car.documentUploads.rcFront, "_blank", "noopener,noreferrer")
                                  }
                                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                                Document Uploaded
                              </p>
                            </div>
                          )}
                          {car.documentUploads.rcBack && (
                            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">RC Back</span>
                                <button
                                  onClick={() =>
                                    window.open(car.documentUploads.rcBack, "_blank", "noopener,noreferrer")
                                  }
                                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                                Document Uploaded
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Insurance Copy */}
                    {car.documentUploads.insuranceCopy && (
                      <div>
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-yellow-400" />
                          Insurance Copy
                        </h4>
                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Insurance Document</span>
                            <button
                              onClick={() =>
                                window.open(car.documentUploads.insuranceCopy, "_blank", "noopener,noreferrer")
                              }
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                            Document Uploaded
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PUC Certificate */}
                    {car.documentUploads.pucCertificate && (
                      <div>
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-400" />
                          PUC Certificate
                        </h4>
                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">PUC Certificate</span>
                            <button
                              onClick={() =>
                                window.open(car.documentUploads.pucCertificate, "_blank", "noopener,noreferrer")
                              }
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                            Document Uploaded
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Service Logs */}
                    {car.documentUploads.serviceLogs && car.documentUploads.serviceLogs.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-purple-400" />
                          Service Logs ({car.documentUploads.serviceLogs.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {car.documentUploads.serviceLogs.map((log, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Service Log {idx + 1}</span>
                                <button
                                  onClick={() => window.open(log, "_blank", "noopener,noreferrer")}
                                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-gray-400 text-sm mt-2">
                                <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                                Document Uploaded
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NOC Document */}
                    {car.documentUploads.nocDocument && (
                      <div>
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-red-400" />
                          No Objection Certificate (NOC)
                        </h4>
                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">NOC Document</span>
                            <button
                              onClick={() =>
                                window.open(car.documentUploads.nocDocument, "_blank", "noopener,noreferrer")
                              }
                              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            <CheckCircleFill className="w-4 h-4 inline mr-1 text-green-400" />
                            Document Uploaded
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 font-semibold">No documents uploaded</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Parties Tab */}
            {activeTab === 'parties' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Car Status Section */}
                <div className={`rounded-lg p-6 border ${car.status === 'rejected' ? 'bg-red-600/20 border-red-500/50' : car.status === 'sold' ? 'bg-green-600/20 border-green-500/50' : car.status === 'available' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-yellow-600/20 border-yellow-500/50'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ExclamationTriangle className="w-5 h-5" />
                    Car Status & Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Current Status</p>
                      <p className="font-semibold text-lg">{car.status?.charAt(0).toUpperCase() + car.status?.slice(1)}</p>
                    </div>

                    {/* Rejection Details */}
                    {car.status === 'rejected' && (
                      <>
                        <div>
                          <p className="text-gray-400 text-sm">Rejected By</p>
                          <p className="font-semibold">{agent?.username || car.agentName || 'Admin/System'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-400 text-sm">Rejection Reason</p>
                          <p className="font-semibold bg-gray-700/30 p-3 rounded mt-1 border border-red-500/30">{car.rejectionReason || 'No reason provided'}</p>
                        </div>
                      </>
                    )}

                    {/* Verified/Accepted Details */}
                    {(car.status === 'available' || car.status === 'sold' || car.status === 'verification') && car.acceptedAt && (
                      <>
                        <div>
                          <p className="text-gray-400 text-sm">Accepted By Agent</p>
                          <p className="font-semibold">{agent?.username || car.agentName || 'Agent'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Acceptance Date</p>
                          <p className="font-semibold">{new Date(car.acceptedAt).toLocaleDateString()}</p>
                        </div>
                      </>
                    )}

                    {/* Verification Timeline */}
                    {car.status === 'verification' && car.verificationDeadline && (
                      <>
                        <div>
                          <p className="text-gray-400 text-sm">Verification Deadline</p>
                          <p className="font-semibold">{new Date(car.verificationDeadline).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Verification Days</p>
                          <p className="font-semibold">{car.verificationDays || 'N/A'} days</p>
                        </div>
                      </>
                    )}

                    {/* Sale Details */}
                    {car.status === 'sold' && car.purchasedAt && (
                      <div>
                        <p className="text-gray-400 text-sm">Sale Date</p>
                        <p className="font-semibold">{new Date(car.purchasedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Info */}
                {(seller || car.sellerName) && (
                  <div className="bg-blue-600/20 rounded-lg p-6 border border-blue-500/50">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Person className="w-5 h-5" />
                      Seller Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="font-semibold">{seller?.username || car.sellerName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="font-semibold">{seller?.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="font-semibold">{seller?.phoneNumber || car.sellerphone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Member Since</p>
                        <p className="font-semibold">{seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agent Info */}
                {agent && (
                  <div className={`rounded-lg p-6 border ${car.status === 'rejected' ? 'bg-red-600/20 border-red-500/50' : 'bg-green-600/20 border-green-500/50'}`}>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <CheckCircleFill className="w-5 h-5" />
                      Assigned Agent
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="font-semibold">{agent.agent?.username || agent.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="font-semibold">{agent.agent?.email || agent.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="font-semibold">{agent.agent?.phoneNumber || agent.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{car.status === 'rejected' ? 'Rejection Date' : 'Assigned Date'}</p>
                        <p className="font-semibold">{car.acceptedAt ? new Date(car.acceptedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buyer Info */}
                {buyer && (
                  <div className="bg-purple-600/20 rounded-lg p-6 border border-purple-500/50">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Person className="w-5 h-5" />
                      Buyer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="font-semibold">{buyer.username || buyer.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="font-semibold">{buyer.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="font-semibold">{buyer.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Purchase Date</p>
                        <p className="font-semibold">{car.purchasedAt ? new Date(car.purchasedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!seller && !agent && !buyer && (
                  <div className="text-center py-8">
                    <Person className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 font-semibold">No party information available</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* All Details Tab */}
            {activeTab === 'allDetails' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {allDetailsSections.map((section) => (
                  <div key={section.title} className="bg-gray-700/40 rounded-lg p-5 border border-gray-600">
                    <h4 className="text-lg font-bold mb-4">{section.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.fields.map((field) => (
                        <div key={field.label} className="bg-gray-800/70 rounded-lg p-3 border border-gray-700">
                          <p className="text-gray-400 text-sm">{field.label}</p>
                          <p className="font-semibold">{formatValue(field.value, field.label)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full"
          >
            <img
              src={lightboxImage}
              alt="Full size view"
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CarDetailsView;
