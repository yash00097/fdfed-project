import { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import carData from "../data/brands_models.json";

const BrandModelSelector = ({ value, onChange, disabled = false }) => {
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
      model: "" // Reset model when brand changes
    });
  };

  const handleModelChange = (event, newValue) => {
    onChange({
      ...value,
      model: newValue || ""
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Brand Autocomplete */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-semibold text-gray-300">Brand</label>
        <Autocomplete
          value={value.brand}
          onChange={handleBrandChange}
          options={brandOptions}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search brand..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'oklch(27.9% 0.041 260.031)',
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#4B5563',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6B7280',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3B82F6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9CA3AF',
                },
                '& .MuiAutocomplete-popupIndicator': {
                  color: '#9CA3AF',
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: '#9CA3AF',
                },
              }}
            />
          )}
        />
      </div>

      {/* Model Autocomplete */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-semibold text-gray-300">Model</label>
        <Autocomplete
          value={value.model}
          onChange={handleModelChange}
          options={modelOptions}
          disabled={!value.brand || disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={value.brand ? "Select model..." : "Select brand first"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'oklch(27.9% 0.041 260.031)',
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#4B5563',
                  },
                  '&:hover fieldset': {
                    borderColor: '#6B7280',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3B82F6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#9CA3AF',
                },
                '& .MuiAutocomplete-popupIndicator': {
                  color: '#9CA3AF',
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: '#9CA3AF',
                },
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

export default BrandModelSelector;
