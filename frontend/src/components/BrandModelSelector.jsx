import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { motion } from "framer-motion";
import carData from "../data/brands_models.json";

// Animation variants (same as SellCar.jsx)
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

  // Load brand list
  useEffect(() => {
    const brands = Object.keys(carData).sort();
    setBrandOptions(brands);
  }, []);

  // Update models when brand changes
  useEffect(() => {
    if (value.brand && carData[value.brand]) {
      setModelOptions([...carData[value.brand]].sort());
    } else {
      setModelOptions([]);
    }
  }, [value.brand]);

  // Handle brand (supports free text)
  const handleBrandChange = (_, newValue) => {
    onChange({
      brand: newValue || "",
      model: "", // reset model on brand change
    });
  };

  // Handle model (supports free text)
  const handleModelChange = (_, newValue) => {
    onChange({
      ...value,
      model: newValue || "",
    });
  };

  // Border color helpers
  const getBorderColor = (showError, error) =>
    showError && error ? "#EF4444" : "#4B5563";

  const getHoverBorderColor = (showError, error) =>
    showError && error ? "#EF4444" : "#6B7280";

  const getFocusedBorderColor = (showError, error) =>
    showError && error ? "#EF4444" : "#3B82F6";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BRAND */}
      <motion.div variants={itemVariants} className="relative flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Brand <span className="text-red-400 ml-1">*</span>
        </label>

        <Autocomplete
          freeSolo
          value={value.brand || ""}
          onChange={handleBrandChange}
          onInputChange={(_, newInputValue) =>
            onChange({ brand: newInputValue, model: "" })
          }
          onBlur={onBlurBrand}
          options={brandOptions}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Type or select brand"
              error={showBrandError && !!brandError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#334155",
                  color: "#e2e8f0",
                  padding: "12px",
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
                  color: "#e2e8f0",
                  padding: "0px !important",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "#9ca3af",
                },
                "& .MuiAutocomplete-clearIndicator": {
                  color: "#9ca3af",
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

      {/* MODEL */}
      <motion.div variants={itemVariants} className="relative flex flex-col">
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Model <span className="text-red-400 ml-1">*</span>
        </label>

        <Autocomplete
          freeSolo
          value={value.model || ""}
          onChange={handleModelChange}
          onInputChange={(_, newInputValue) =>
            onChange({ ...value, model: newInputValue })
          }
          onBlur={onBlurModel}
          options={modelOptions}
          disabled={!value.brand || disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                value.brand
                  ? "Type or select model"
                  : "Select brand first"
              }
              error={showModelError && !!modelError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#334155",
                  color: "#e2e8f0",
                  padding: "12px",
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
                  color: "#e2e8f0",
                  padding: "0px !important",
                  "&::placeholder": {
                    color: "#9ca3af",
                    opacity: 1,
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "#9ca3af",
                },
                "& .MuiAutocomplete-clearIndicator": {
                  color: "#9ca3af",
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
