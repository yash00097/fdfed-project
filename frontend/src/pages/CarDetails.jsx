import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Gear,
  Lightning,
  ArrowClockwise,
  Truck,
  Speedometer,
  ArrowsExpand,
  FuelPump,
  Person,
  Calendar,
  CarFront,
  Palette,
  Speedometer2,
  CardText,
  CalendarDate,
  Tag,
  CalendarCheck,
  CalendarPlus,
  TelephoneFill,
  ChatDotsFill,
  ChevronLeft,
  ChevronRight,
  CartFill,
} from "react-bootstrap-icons"
import { useCart } from "../contexts/CartContext"

export default function CarDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state) => state.user)
  const { addToCart, cartItems } = useCart()

  // Check if car is already in cart
  const isInCart = cartItems.some((item) => item._id === id)

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("specs")

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/backend/cars/${id}`)
        const data = await res.json()

        if (data.success) {
          setCar(data.car)
        } else {
          setError(data.message || "Failed to fetch car details")
        }
      } catch (err) {
        setError("Error loading car details: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCar()
    }
  }, [id])

  const carPhotos = car?.photos || []

  const changeMainImage = (imageUrl, index) => {
    setCurrentImageIndex(index)
  }

  const navigateImages = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % carPhotos.length)
    } else {
      setCurrentImageIndex((prev) => (prev === 0 ? carPhotos.length - 1 : prev - 1))
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "sold":
        return "bg-red-500"
      default:
        return "bg-slate-600"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available For Purchase"
      case "pending":
        return "Pending Approval"
      case "sold":
        return "Already Sold"
      default:
        return "Not Available"
    }
  }

  const formatPrice = (price) => {
    return price?.toLocaleString("en-IN") || "0"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleBuyNow = () => {
    if (!currentUser) {
      alert("Please sign in to purchase this vehicle")
      navigate("/sign-in")
      return
    }
    if (car.status === "available") {
      navigate(`/buy/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Car not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pt-20">
      {/* Main Content Container with top padding to avoid navbar overlap */}
      <div className="container mx-auto px-4 py-8 mt-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-4 text-blue-400">
              {car.brand} {car.model}
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {car.vehicleType}
              </span>
              <span className="inline-block bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {car.transmission}
              </span>
              <span className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {car.fuelType}
              </span>
              <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                {car.status === "available" ? "Available" : car.status}
              </span>
            </div>
          </div>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg">
            ₹{formatPrice(car.price)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Images and Tabs */}
          <div className="lg:col-span-2">
            {/* Main Image with Dark Background */}
            <div className="relative mb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl">
              <img
                src={
                  carPhotos.length > 0
                    ? carPhotos[currentImageIndex]
                    : "/placeholder.svg?height=600&width=1000&query=car"
                }
                alt={`${car.brand} ${car.model}`}
                className="w-full h-[500px] object-contain p-8"
              />

              {/* Image Navigation Arrows - Always Visible */}
              <button
                onClick={() => navigateImages("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-xl"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={() => navigateImages("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-xl"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {carPhotos.length || 1}
              </div>
            </div>

            {/* Thumbnails Gallery - Bottom aligned like the image */}
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {carPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => changeMainImage(photo, index)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-3 transition-all duration-300 hover:scale-105 ${currentImageIndex === index
                      ? "border-blue-500 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-blue-500/50"
                      : "border-slate-700 hover:border-blue-400 opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-32 h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-700 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-4 font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === "specs"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-white hover:border-b-2 hover:border-slate-500"
                    }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("features")}
                  className={`pb-4 font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === "features"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-white hover:border-b-2 hover:border-slate-500"
                    }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-4 font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === "details"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-white hover:border-b-2 hover:border-slate-500"
                    }`}
                >
                  Additional Details
                </button>
              </div>
            </div>

            {/* Tabs Content */}
            <div>
              {activeTab === "specs" && (
                <div className="grid grid-cols-3 gap-4">
                  <SpecCard icon={<Gear size={24} />} title="Engine" value={`${car.engine} CC`} />
                  <SpecCard icon={<Lightning size={24} />} title="Power" value={`${car.power} HP`} />
                  <SpecCard icon={<ArrowClockwise size={24} />} title="Torque" value={`${car.torque} Nm`} />
                  <SpecCard icon={<Truck size={24} />} title="Drive Type" value={car.driveType} />
                  <SpecCard icon={<Speedometer size={24} />} title="Top Speed" value={`${car.topSpeed} Kmph`} />
                  <SpecCard
                    icon={<ArrowsExpand size={24} />}
                    title="Ground Clearance"
                    value={`${car.groundClearance} mm`}
                  />
                  <SpecCard icon={<FuelPump size={24} />} title="Fuel Tank" value={`${car.fuelTank} Liters`} />
                  <SpecCard icon={<Person size={24} />} title="Seating" value={`${car.seater} Seats`} />
                  <SpecCard icon={<Calendar size={24} />} title="Manufactured Year" value={car.manufacturedYear} />
                </div>
              )}

              {/* Features Tab */}
              {activeTab === "features" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105">
                    <h5 className="text-lg font-bold mb-4">Vehicle Information</h5>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <CarFront size={18} /> Vehicle Type
                        </span>
                        <span className="text-blue-400 font-medium">{car.vehicleType}</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Gear size={18} /> Transmission
                        </span>
                        <span className="text-blue-400 font-medium">{car.transmission}</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <FuelPump size={18} /> Fuel Type
                        </span>
                        <span className="text-blue-400 font-medium">{car.fuelType}</span>
                      </li>
                      <li className="flex justify-between items-center transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Palette size={18} /> Exterior Color
                        </span>
                        <span className="text-blue-400 font-medium">{car.exteriorColor}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105">
                    <h5 className="text-lg font-bold mb-4">Performance</h5>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Speedometer2 size={18} /> Engine
                        </span>
                        <span className="text-blue-400 font-medium">{car.engine} CC</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Lightning size={18} /> Power
                        </span>
                        <span className="text-blue-400 font-medium">{car.power} HP</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <ArrowClockwise size={18} /> Torque
                        </span>
                        <span className="text-blue-400 font-medium">{car.torque} Nm</span>
                      </li>
                      <li className="flex justify-between items-center transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Speedometer size={18} /> Top Speed
                        </span>
                        <span className="text-blue-400 font-medium">{car.topSpeed} Kmph</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Additional Details Tab */}
              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105">
                    <h5 className="text-lg font-bold mb-4">Registration Details</h5>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <CardText size={18} /> Car Number
                        </span>
                        <span className="text-blue-400 font-medium">{car.carNumber}</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <CalendarDate size={18} /> Manufactured Year
                        </span>
                        <span className="text-blue-400 font-medium">{car.manufacturedYear}</span>
                      </li>
                      <li className="flex justify-between items-center transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Tag size={18} /> Status
                        </span>
                        <span
                          className={`text-white px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                            car.status,
                          )}`}
                        >
                          {car.status}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 transition-all duration-300 hover:bg-slate-700 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105">
                    <h5 className="text-lg font-bold mb-4">Usage Information</h5>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <Speedometer size={18} /> Traveled Distance
                        </span>
                        <span className="text-blue-400 font-medium">{formatPrice(car.traveledKm)} km</span>
                      </li>
                      <li className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <CalendarCheck size={18} /> Listed Date
                        </span>
                        <span className="text-blue-400 font-medium">{formatDate(car.createdAt)}</span>
                      </li>
                      <li className="flex justify-between items-center transition-all duration-200 hover:bg-slate-600 hover:px-3 hover:py-2 hover:rounded-lg cursor-pointer">
                        <span className="flex items-center gap-2 text-slate-300">
                          <CalendarPlus size={18} /> Last Updated
                        </span>
                        <span className="text-blue-400 font-medium">{formatDate(car.updatedAt)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Car Details & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 sticky top-6">
              {/* Car Summary */}
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-4">Car Summary</h4>
                <div className="space-y-3">
                  <DetailItem label="Registration Number" value={car.carNumber} />
                  <DetailItem label="Vehicle Type" value={car.vehicleType} />
                  <DetailItem label="Transmission" value={car.transmission} />
                  <DetailItem label="Fuel Type" value={car.fuelType} />
                  <DetailItem label="Exterior Color" value={car.exteriorColor} />
                  <DetailItem label="Kilometers Driven" value={`${formatPrice(car.traveledKm)} km`} />
                  <DetailItem label="Seating Capacity" value={`${car.seater} Seater`} />
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <div className="text-3xl font-bold mb-2">₹{formatPrice(car.price)}</div>
                <div className="text-sm text-slate-400">₹{formatPrice(Math.round(car.price / 60))}/month</div>
              </div>

              <div className="mb-6">
                <button
                  className={`w-full py-3 rounded-lg font-bold transition ${getStatusBadgeClass(
                    car.status,
                  )} text-white`}
                >
                  {getStatusText(car.status)}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 space-y-3">
                <button
                  onClick={handleBuyNow}
                  disabled={car.status !== "available"}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${car.status === "available"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <CartFill size={20} /> BUY NOW
                </button>
                {currentUser && currentUser.role === "normalUser" && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        navigate("/sign-in")
                        return
                      }
                      if (!isInCart) {
                        addToCart(car)
                      }
                    }}
                    disabled={car.status !== "available" || isInCart}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                      isInCart
                        ? "bg-green-600 text-white cursor-default border border-green-500"
                        : car.status === "available"
                        ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-500"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    }`}
                  >
                    <CartFill size={20} /> {isInCart ? "IN CART" : "ADD TO CART"}
                  </button>
                )}
              </div>

              {/* Contact Section */}
              <div>
                <h5 className="font-bold mb-3">Have Questions?</h5>
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition flex items-center justify-center gap-2">
                    <TelephoneFill size={18} /> Contact Dealer
                  </button>
                  <button className="w-full py-2 px-4 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition flex items-center justify-center gap-2">
                    <ChatDotsFill size={18} /> Chat with Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecCard({ icon, title, value }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 transition-all duration-300 hover:bg-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 cursor-pointer">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 text-white p-2 rounded-lg transition-all duration-300 group-hover:bg-blue-500">{icon}</div>
        <h5 className="font-bold text-sm">{title}</h5>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between items-center pb-3 border-b border-slate-700 transition-all duration-200 hover:bg-slate-700 hover:px-2 hover:py-2 hover:rounded-lg cursor-pointer">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}
