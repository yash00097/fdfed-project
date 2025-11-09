import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchUnreadCountStart,
  fetchUnreadCountSuccess,
  fetchUnreadCountFailure,
} from "../redux/notification/notificationSlice";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import sellRequestBgImage from "../assets/images/sellRequestBgImage1.jpg";
import BrandModelSelector from "../components/BrandModelSelector.jsx";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const FormField = ({
  id,
  label,
  as: Component = "input",
  error,
  touched,
  showError,
  ...props
}) => (
  <motion.div variants={itemVariants} className="relative">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-slate-300 mb-1"
    >
      {label}
      {props.required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <Component
      id={id}
      className={`w-full bg-slate-700 border text-slate-200 p-3 rounded-lg focus:ring-2 focus:border-transparent transition duration-200 ${
        showError && error
          ? "border-red-500 focus:ring-red-500"
          : touched && !error
          ? "border-green-500 focus:ring-green-500"
          : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"
      }`}
      {...props}
    />
    {showError && error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 text-xs mt-1 flex items-center gap-1"
      >
        <span>⚠</span> {error}
      </motion.p>
    )}
  </motion.div>
);

const SelectField = ({
  id,
  label,
  options,
  error,
  touched,
  showError,
  ...props
}) => (
  <motion.div variants={itemVariants} className="relative">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-slate-300 mb-1"
    >
      {label}
      {props.required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <select
      id={id}
      className={`w-full bg-slate-700 border text-slate-200 p-3 rounded-lg focus:ring-2 focus:border-transparent transition duration-200 appearance-none ${
        showError && error
          ? "border-red-500 focus:ring-red-500"
          : touched && !error
          ? "border-green-500 focus:ring-green-500"
          : "border-slate-600 focus:ring-blue-500 focus:border-blue-500"
      }`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
    {showError && error && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-400 text-xs mt-1 flex items-center gap-1"
      >
        <span>⚠</span> {error}
      </motion.p>
    )}
  </motion.div>
);

const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";
  const re = /^[0-9]{10}$/;
  return re.test(phone) ? null : "Please enter a valid 10-digit phone number";
};

const validatePincode = (pincode) => {
  if (!pincode) return "Pincode is required";
  const re = /^[0-9]{6}$/;
  return re.test(pincode) ? null : "Please enter a valid 6-digit pincode";
};

const validateCarNumber = (number) => {
  if (!number) return "Registration number is required";
  const re = /^[A-Z]{2}\s?[0-9]{2}\s?[A-Z]{2}\s?[0-9]{4}$/i;
  return re.test(number)
    ? null
    : "Please enter a valid vehicle registration number (e.g., MH 12 AB 3456)";
};

const validateManufacturedYear = (year) => {
  if (!year) return "Manufactured year is required";
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  if (yearNum < 1900 || yearNum > currentYear) {
    return `Year must be between 1900 and ${currentYear}`;
  }
  return null;
};

const validateTraveledKm = (km) => {
  if (!km) return "Kilometers driven is required";
  if (km < 0) return "Kilometers cannot be negative";
  return null;
};

const validatePrice = (price) => {
  if (!price) return "Price is required";
  if (price < 0) return "Price cannot be negative";
  return null;
};

const validateSeater = (seater) => {
  if (!seater) return "Number of seats is required";
  if (seater < 2) return "Must have at least 2 seats";
  return null;
};

const validateRequired = (value, fieldName) => {
  if (!value) return `${fieldName} is required`;
  return null;
};

export default function SellCar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

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
    sellerPhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  useEffect(() => {
    if (submitSuccess && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitSuccess]);

  const validateField = (name, value) => {
    switch (name) {
      case "sellerPhone":
        return validatePhone(value);
      case "pincode":
        return validatePincode(value);
      case "carNumber":
        return validateCarNumber(value);
      case "manufacturedYear":
        return validateManufacturedYear(value);
      case "traveledKm":
        return validateTraveledKm(value);
      case "price":
        return validatePrice(value);
      case "seater":
        return validateSeater(value);
      case "brand":
      case "model":
      case "vehicleType":
      case "transmission":
      case "fuelType":
      case "exteriorColor":
      case "sellerName":
      case "address":
      case "city":
      case "state":
        return validateRequired(
          value,
          name.charAt(0).toUpperCase() + name.slice(1)
        );
      case "photos":
        return value.length < 4 ? "At least 4 photos are required" : null;
      default:
        return null;
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("/backend/upload/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    console.log(
      "Files selected:",
      files.length,
      "Current photos:",
      formData.photos.length
    );

    setUploadingPhotos(true);

    try {
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      const cloudinaryUrls = await Promise.all(uploadPromises);
      const previewUrls = files.map((file) => URL.createObjectURL(file));

      setFormData((prev) => {
        const newPhotos = [...prev.photos, ...cloudinaryUrls];
        console.log("Updated photos in formData:", newPhotos);
        return {
          ...prev,
          photos: newPhotos,
        };
      });

      setPhotoPreviews((prev) => [...prev, ...previewUrls]);

      const totalPhotos = formData.photos.length + cloudinaryUrls.length;
      if (totalPhotos >= 4) {
        setErrors((prev) => ({
          ...prev,
          photos: null,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          photos: `${totalPhotos}/4 photos uploaded. ${
            4 - totalPhotos
          } more needed.`,
        }));
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      setErrors((prev) => ({
        ...prev,
        photos: "Failed to upload photos. Please try again.",
      }));
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      photos: newPhotos,
    }));

    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoPreviews[index]);

    if (newPhotos.length < 4) {
      setErrors((prev) => ({
        ...prev,
        photos: `${newPhotos.length}/4 photos uploaded. ${
          4 - newPhotos.length
        } more needed.`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        photos: null,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (!touched[name]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };
  const handleBrandModelChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      brand: newValue.brand,
      model: newValue.model,
    }));

    if (errors.brand && newValue.brand) {
      setErrors((prev) => ({ ...prev, brand: null }));
    }
    if (errors.model && newValue.model) {
      setErrors((prev) => ({ ...prev, model: null }));
    }
    if (newValue.brand && !touched.brand) {
      setTouched((prev) => ({ ...prev, brand: true }));
    }
    if (newValue.model && !touched.model) {
      setTouched((prev) => ({ ...prev, model: true }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    const error = validateField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };
  const handleBrandBlur = () => {
    setTouched((prev) => ({ ...prev, brand: true }));
    const error = validateField("brand", formData.brand);
    setErrors((prev) => ({ ...prev, brand: error }));
  };

  const handleModelBlur = () => {
    setTouched((prev) => ({ ...prev, model: true }));
    const error = validateField("model", formData.model);
    setErrors((prev) => ({ ...prev, model: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};
    const allTouched = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
      allTouched[key] = true;
    });

    setErrors(newErrors);
    setTouched(allTouched);
    const hasErrors = Object.keys(newErrors).length > 0;

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        sellerphone: formData.sellerPhone,
      };
      const response = await fetch("/backend/sell-car/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);

        const fetchNewCount = async () => {
          dispatch(fetchUnreadCountStart());
          try {
            const countRes = await fetch("/backend/notification/unread-count");
            const countData = await countRes.json();
            if (countData.success) {
              dispatch(fetchUnreadCountSuccess(countData.count));
            } else {
              dispatch(fetchUnreadCountFailure("Failed to fetch count"));
            }
          } catch (error) {
            console.error("Failed to fetch unread count:", error);
            dispatch(fetchUnreadCountFailure("Failed to fetch count"));
          }
        };

        fetchNewCount();

        // Reset form
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
          sellerPhone: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          photos: [],
        });

        photoPreviews.forEach((url) => URL.revokeObjectURL(url));
        setPhotoPreviews([]);

        setTouched({});
        setErrors({});

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert(
          "Error: " +
            (result.error || result.message || "Unknown error occurred")
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        alert("Please log in to sell your car");
        navigate("/signin");
      } else {
        alert("Error submitting form. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isFormValid = () => {
    const hasValidationErrors = Object.values(errors).some(
      (error) => error !== null
    );
    const allFieldsFilled =
      formData.brand &&
      formData.model &&
      formData.vehicleType &&
      formData.transmission &&
      formData.manufacturedYear &&
      formData.fuelType &&
      formData.seater &&
      formData.exteriorColor &&
      formData.carNumber &&
      formData.traveledKm &&
      formData.price &&
      formData.sellerName &&
      formData.sellerPhone &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.pincode &&
      formData.photos.length >= 4;

    return !hasValidationErrors && allFieldsFilled;
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0 overflow-y-auto "
      style={{
        backgroundImage: `url(${sellRequestBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        ref={formRef}
        className="max-w-4xl w-full mx-auto mt-30 bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 p-8 rounded-2xl my-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={10}
            showBorder={false}
            className="custom-class text-3xl font-semibold"
          >
            Sell Your Car
          </GradientText>
          <p className="text-slate-400 mt-2">
            Fill out the details below to get the best price for your vehicle.
          </p>
        </motion.div>

        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg"
          >
            <p className="text-green-400 font-semibold flex items-center gap-2">
              <span>✅</span>
              Car Sell Request Submitted Successfully! Our agent will contact
              you shortly.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <BrandModelSelector
            value={{ brand: formData.brand, model: formData.model }}
            onChange={handleBrandModelChange}
            onBlurBrand={handleBrandBlur}
            onBlurModel={handleModelBlur}
            brandError={errors.brand}
            modelError={errors.model}
            showBrandError={shouldShowError("brand")}
            showModelError={shouldShowError("model")}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              id="vehicleType"
              name="vehicleType"
              label="Vehicle Type"
              value={formData.vehicleType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.vehicleType}
              touched={touched.vehicleType}
              showError={shouldShowError("vehicleType")}
              required
              options={[
                { value: "", label: "Select Vehicle Type", disabled: true },
                { value: "sedan", label: "Sedan" },
                { value: "suv", label: "SUV" },
                { value: "hatchback", label: "Hatchback" },
                { value: "coupe", label: "Coupe" },
                { value: "convertible", label: "Convertible" },
                { value: "off-road", label: "Off-road" },
                { value: "sport", label: "Sport" },
                { value: "muscle", label: "Muscle" },
              ]}
            />
            <SelectField
              id="transmission"
              name="transmission"
              label="Transmission"
              value={formData.transmission}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.transmission}
              touched={touched.transmission}
              showError={shouldShowError("transmission")}
              required
              options={[
                { value: "", label: "Select Transmission", disabled: true },
                { value: "manual", label: "Manual" },
                { value: "automatic", label: "Automatic" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              id="manufacturedYear"
              name="manufacturedYear"
              label="Manufactured Year"
              type="number"
              placeholder="e.g., 2022"
              value={formData.manufacturedYear}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.manufacturedYear}
              touched={touched.manufacturedYear}
              showError={shouldShowError("manufacturedYear")}
              min="1900"
              max={new Date().getFullYear()}
              required
            />
            <SelectField
              id="fuelType"
              name="fuelType"
              label="Fuel Type"
              value={formData.fuelType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fuelType}
              touched={touched.fuelType}
              showError={shouldShowError("fuelType")}
              required
              options={[
                { value: "", label: "Select Fuel Type", disabled: true },
                { value: "diesel", label: "Diesel" },
                { value: "petrol", label: "Petrol" },
                { value: "electric", label: "Electric" },
                { value: "gas", label: "Gas" },
              ]}
            />
            <SelectField
              id="seater"
              name="seater"
              label="Number of Seats"
              as="select"
              value={formData.seater}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.seater}
              touched={touched.seater}
              showError={shouldShowError("seater")}
              required
              options={[
                { value: "", label: "Select Number of Seats", disabled: true },
                { value: "2", label: "2" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
                { value: "9", label: "9" },
                { value: "10", label: "10" },
                { value: "12", label: "12" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="exteriorColor"
              name="exteriorColor"
              label="Exterior Color"
              type="text"
              placeholder="e.g., Midnight Black"
              value={formData.exteriorColor}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.exteriorColor}
              touched={touched.exteriorColor}
              showError={shouldShowError("exteriorColor")}
              required
            />
            <FormField
              id="carNumber"
              name="carNumber"
              label="Registration Number"
              type="text"
              placeholder="e.g., MH 12 AB 3456"
              value={formData.carNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.carNumber}
              touched={touched.carNumber}
              showError={shouldShowError("carNumber")}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="traveledKm"
              name="traveledKm"
              label="Kilometers Driven"
              type="number"
              placeholder="e.g., 50000"
              value={formData.traveledKm}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.traveledKm}
              touched={touched.traveledKm}
              showError={shouldShowError("traveledKm")}
              min="0"
              required
            />
            <FormField
              id="price"
              name="price"
              label="Expected Price (₹)"
              type="number"
              placeholder="e.g., 800000"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.price}
              touched={touched.price}
              showError={shouldShowError("price")}
              min="0"
              required
            />
          </div>

          <motion.div
            variants={itemVariants}
            className="border-t border-slate-700 pt-6 space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-200">
              Your Contact & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                id="sellerName"
                name="sellerName"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.sellerName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.sellerName}
                touched={touched.sellerName}
                showError={shouldShowError("sellerName")}
                required
              />
              <FormField
                id="sellerPhone"
                name="sellerPhone"
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                value={formData.sellerPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.sellerPhone}
                touched={touched.sellerPhone}
                showError={shouldShowError("sellerPhone")}
                required
              />
            </div>
            <FormField
              as="textarea"
              id="address"
              name="address"
              label="Full Address"
              placeholder="123, Main Street, Suburbia"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              touched={touched.address}
              showError={shouldShowError("address")}
              rows="2"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                id="city"
                name="city"
                label="City"
                type="text"
                placeholder="Mumbai"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.city}
                touched={touched.city}
                showError={shouldShowError("city")}
                required
              />
              <FormField
                id="state"
                name="state"
                label="State"
                type="text"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.state}
                touched={touched.state}
                showError={shouldShowError("state")}
                required
              />
              <FormField
                id="pincode"
                name="pincode"
                label="Pincode"
                type="text"
                placeholder="400001"
                value={formData.pincode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.pincode}
                touched={touched.pincode}
                showError={shouldShowError("pincode")}
                required
              />
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="border-t border-slate-700 pt-6"
          >
            <label className="block text-xl font-semibold text-slate-200">
              Upload Photos
            </label>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              A minimum of 4 photos are required.{" "}
              {formData.photos.length > 0 &&
                `(${formData.photos.length} uploaded)`}
            </p>
            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-slate-300 mb-2">Photo Previews:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              name="photos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
              disabled={uploadingPhotos || isSubmitting}
            />

            {uploadingPhotos && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-400 text-xs mt-2 flex items-center gap-1"
              >
                <span>⏳</span> Uploading photos...
              </motion.p>
            )}

            {shouldShowError("photos") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
              >
                <span>⚠</span> {errors.photos}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <motion.button
              type="submit"
              disabled={isSubmitting || !isFormValid() || uploadingPhotos}
              className={`w-full p-4 rounded-lg font-semibold text-lg transition duration-200 ${
                isSubmitting || !isFormValid() || uploadingPhotos
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              whileHover={
                !isSubmitting && isFormValid() && !uploadingPhotos
                  ? { scale: 1.02 }
                  : {}
              }
              whileTap={
                !isSubmitting && isFormValid() && !uploadingPhotos
                  ? { scale: 0.98 }
                  : {}
              }
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </span>
              ) : (
                "Submit Sell Request"
              )}
            </motion.button>
            <p className="text-sm text-slate-500 text-center mt-4">
              Our agent will contact you shortly to verify the details.
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
