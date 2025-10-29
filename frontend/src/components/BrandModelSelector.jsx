import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { motion } from "framer-motion";
import carData from "../data/brands_models.json";

// Copied from SellCar.jsx to match animations
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

const BrandModelSelector = ({
  value,
  onChange,
  disabled = false,
  brandError,
  showBrandError,
  modelError,
  showModelError,
  onBlurBrand,
  onBlurModel,
}) => {
  const [brandOptions, setBrandOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  // Extract all brands from the JSON data
  useEffect(() => {
    const brands = Object.keys(carData).sort();
    setBrandOptions(brands);
  }, []);

  // Update models when brand changes
  useEffect(() => {
    if (value.brand && carData[value.brand]) {
      const models = carData[value.brand].sort();
      setModelOptions(models);
    } else {
      setModelOptions([]);
    }
  }, [value.brand]);

  const handleBrandChange = (event, newValue) => {
    onChange({
      brand: newValue || "",
      model: "", // Reset model when brand changes
    });
  };

  const handleModelChange = (event, newValue) => {
    onChange({
      ...value,
      model: newValue || "",
    });
  };

  // Helper to determine border color
  const getBorderColor = (showError, error) => {
    return showError && !!error ? "#EF4444" : "#4B5563"; // #EF4444 is red-500
  };

  const getHoverBorderColor = (showError, error) => {
    return showError && !!error ? "#EF4444" : "#6B7280";
  };

  const getFocusedBorderColor = (showError, error) => {
    return showError && !!error ? "#EF4444" : "#3B82F6";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Brand Autocomplete */}
      <motion.div variants={itemVariants} className="relative flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Brand
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Autocomplete
          value={value.brand}
          onChange={handleBrandChange}
          onBlur={onBlurBrand}
          options={brandOptions}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search brand..."
              error={showBrandError && !!brandError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#334155", // bg-slate-700
                  color: "#e2e8f0", // text-slate-200
                  padding: "12px", // <-- CHANGED: Match p-3 (12px)
                  "& fieldset": {
                    borderColor: getBorderColor(showBrandError, brandError),
                  },
                  "&:hover fieldset": {
                    borderColor: getHoverBorderColor(
                      showBrandError,
                      brandError
                    ),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: getFocusedBorderColor(
                      showBrandError,
                      brandError
                    ),
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#e2e8f0", // text-slate-200 (color when typing)
                  padding: "0px !important", // Input itself has no padding
                  "&::placeholder": {
                    color: "#9ca3af", // <-- CHANGED: text-slate-400
                    opacity: 1, // Ensure placeholder is fully opaque
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "#9ca3af", // text-slate-400
                },
                "& .MuiAutocomplete-clearIndicator": {
                  color: "#9ca3af", // text-slate-400
                },
              }}
            />
          )}
        />
        {showBrandError && brandError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1 flex items-center gap-1"
          >
            <span>⚠</span> {brandError}
          </motion.p>
        )}
      </motion.div>

      {/* Model Autocomplete */}
      <motion.div variants={itemVariants} className="relative flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Model
          <span className="text-red-400 ml-1">*</span>
        </label>
        <Autocomplete
          value={value.model}
          onChange={handleModelChange}
          onBlur={onBlurModel}
          options={modelOptions}
          disabled={!value.brand || disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                value.brand ? "Select model..." : "Select brand first"
              }
              error={showModelError && !!modelError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#334155", // bg-slate-700
                  color: "#e2e8f0", // text-slate-200
                  padding: "12px", // <-- CHANGED: Match p-3 (12px)
                  "& fieldset": {
                    borderColor: getBorderColor(showModelError, modelError),
                  },
                  "&:hover fieldset": {
                    borderColor: getHoverBorderColor(
                      showModelError,
                      modelError
                    ),
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: getFocusedBorderColor(
                      showModelError,
                      modelError
                    ),
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#e2e8f0", // text-slate-200 (color when typing)
                  padding: "0px !important", // Input itself has no padding
                  "&::placeholder": {
                    color: "#9ca3af", // <-- CHANGED: text-slate-400
                    opacity: 1, // Ensure placeholder is fully opaque
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "#9ca3af", // text-slate-400
                },
                "& .MuiAutocomplete-clearIndicator": {
                  color: "#9ca3af", // text-slate-400
                },
              }}
            />
          )}
        />
        {showModelError && modelError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1 flex items-center gap-1"
          >
            <span>⚠</span> {modelError}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default BrandModelSelector;
