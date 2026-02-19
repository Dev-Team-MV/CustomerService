import { useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { AttachMoney } from '@mui/icons-material'
import { formatPriceInput, parsePriceInput } from '../constants/priceFormat'

const PriceInput = ({ label, value, onChange, ...props }) => {
  const [inputValue, setInputValue] = useState(
    value !== undefined && value !== null ? formatPriceInput(String(value)) : ''
  );

  // Cuando el usuario escribe
  const handleInputChange = (e) => {
    const raw = e.target.value;
    // Permite solo números, comas y puntos
    if (/^[\d.,]*$/.test(raw)) {
      setInputValue(raw);
      onChange(parsePriceInput(raw));
    }
  };

  // Al salir del input, formatea
  const handleBlur = () => {
    setInputValue(formatPriceInput(inputValue));
  };

  return (
    <TextField
      label={label}
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <AttachMoney sx={{ color: '#8CA551' }} />
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};
export default PriceInput