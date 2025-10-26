import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import requestBgImage from "../assets/images/sellRequestBgImage1.jpg";

// Framer Motion variants for animations
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

// Reusable FormField component
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

// Reusable SelectField component
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

// Validation functions
const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === "") return `${fieldName} is required`;
  return null;
};

const validateYear = (year) => {
  if (!year || year.toString().trim() === "") return "Year is required";
  const yearStr = year.toString().trim();
  if (!/^\d+$/.test(yearStr)) return "Year must be a number";

  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(yearStr);
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
    return `Year must be between 1900 and ${currentYear}`;
  }
  return null;
};

export default function RequestCar() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    vehicleType: "",
    transmission: "",
    fuelType: "",
    minYear: "",
    maxYear: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validate individual field
  const validateField = (name, value) => {
    const allData = { ...formData, [name]: value };

    switch (name) {
      case "brand":
      case "model":
      case "vehicleType":
      case "transmission":
      case "fuelType":
        return validateRequired(value, name.charAt(0).toUpperCase() + name.slice(1));
      case "minYear":
        const minYearError = validateYear(value);
        if (minYearError) return minYearError;
        if (allData.maxYear && value && allData.maxYear && parseInt(value) > parseInt(allData.maxYear)) {
          return "Min year cannot be after max year";
        }
        return null;
      case "maxYear":
        const maxYearError = validateYear(value);
        if (maxYearError) return maxYearError;
        if (allData.minYear && value && allData.minYear && parseInt(value) < parseInt(allData.minYear)) {
          return "Max year cannot be before min year";
        }
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const allData = { ...formData, [name]: value };

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true, }));

    // Validate the field that was just blurred
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error, }));
    setShowErrors((prev) => ({ ...prev, [name]: !!error, }));

    // If a year field was changed, re-validate the other one too
    if (name === "minYear" && allData.maxYear) {
      const maxYearError = validateField("maxYear", allData.maxYear);
      setErrors((prev) => ({ ...prev, maxYear: maxYearError }));
      setShowErrors((prev) => ({...prev, maxYear: !!maxYearError }));
    } else if (name === "maxYear" && allData.minYear) {
      const minYearError = validateField("minYear", allData.minYear);
      setErrors((prev) => ({ ...prev, minYear: minYearError }));
      setShowErrors((prev) => ({ ...prev, minYear: !!minYearError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields and show all errors on submit
    const newErrors = {};
    const newShowErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        newShowErrors[key] = true;
      }
    });

    setErrors(newErrors);
    setShowErrors(newShowErrors);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const hasErrors = Object.values(newErrors).some(error => error !== null);

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        manufacturedYearRange: {
          minYear: formData.minYear,
          maxYear: formData.maxYear,
        },
      };
      delete requestData.minYear;
      delete requestData.maxYear;

      const res = await fetch("/backend/request-car/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          brand: "",
          model: "",
          vehicleType: "",
          transmission: "",
          fuelType: "",
          minYear: "",
          maxYear: ""
        });
        setTouched({});
        setErrors({});
        setShowErrors({});
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert("Error: " + (result.error || result.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Submit error:", err);
      if (err.message && (err.message.includes("401") || err.message.includes("Unauthorized"))) {
        alert("Please log in to request a car");
        navigate("/signin");
      } else {
        alert("Error submitting request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    Object.values(errors).every(error => error === null) &&
    Object.values(formData).every(value => value && value.toString().trim() !== "");

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-screen lg:py-0 overflow-y-auto"
      style={{
        backgroundImage: `url(${requestBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        className="max-w-4xl w-full mx-auto mt-30 bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 p-8 rounded-2xl my-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={10}
            className="text-3xl font-semibold"
          >
            Request Your Dream Car
          </GradientText>
          <p className="text-slate-400 mt-2">
            Tell us what you're looking for, and we'll find it for you.
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
              Request Submitted Successfully! We will notify you when a matching
              car is available.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="brand"
              name="brand"
              label="Brand"
              type="text"
              placeholder="e.g., Toyota"
              value={formData.brand}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.brand}
              touched={touched.brand}
              showError={showErrors.brand}
              required
            />
            <FormField
              id="model"
              name="model"
              label="Model"
              type="text"
              placeholder="e.g., Camry"
              value={formData.model}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.model}
              touched={touched.model}
              showError={showErrors.model}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField
              id="vehicleType"
              name="vehicleType"
              label="Vehicle Type"
              value={formData.vehicleType}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.vehicleType}
              touched={touched.vehicleType}
              showError={showErrors.vehicleType}
              required
              options={[
                { value: "", label: "Select Type", disabled: true },
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
              showError={showErrors.transmission}
              required
              options={[
                { value: "", label: "Select Transmission", disabled: true },
                { value: "manual", label: "Manual" },
                { value: "automatic", label: "Automatic" },
              ]}
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
              showError={showErrors.fuelType}
              required
              options={[
                { value: "", label: "Select Fuel Type", disabled: true },
                { value: "diesel", label: "Diesel" },
                { value: "petrol", label: "Petrol" },
                { value: "electric", label: "Electric" },
                { value: "gas", label: "Gas" },
              ]}
            />
          </div>

          <motion.div variants={itemVariants} className="border-t border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-slate-200 mb-4">
              Manufacturing Year Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                id="minYear"
                name="minYear"
                label="From Year"
                type="number"
                placeholder="e.g., 2018"
                value={formData.minYear}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.minYear}
                touched={touched.minYear}
                showError={showErrors.minYear}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              <FormField
                id="maxYear"
                name="maxYear"
                label="To Year"
                type="number"
                placeholder="e.g., 2022"
                value={formData.maxYear}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.maxYear}
                touched={touched.maxYear}
                showError={showErrors.maxYear}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <motion.button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`w-full p-4 rounded-lg font-semibold text-lg transition duration-200 ${
                isSubmitting || !isFormValid
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              whileHover={!isSubmitting && isFormValid ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && isFormValid ? { scale: 0.98 } : {}}
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
                "Submit Request"
              )}
            </motion.button>
            <p className="text-sm text-slate-500 text-center mt-4">
              We'll notify you when we find cars that match your criteria.
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
