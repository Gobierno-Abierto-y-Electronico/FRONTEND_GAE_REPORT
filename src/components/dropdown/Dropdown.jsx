import React, { useState } from 'react';
import './dropdown.css';

export const DropdownButton = ({ onSelect }) => {
  const [selectedReason, setSelectedReason] = useState("default");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const reasons = ["Enfermedad", "Viene Tarde", "Otro"];

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSelect = (reason) => {
    if (reason === "Otro") {
      setSelectedReason(reason);
      setShowCustomInput(true);
    } else {
      setSelectedReason(reason);
      setDropdownOpen(false);
      setShowCustomInput(false);
      onSelect(reason);
    }
  };

  const handleCustomReasonChange = (e) => {
    setCustomReason(e.target.value);
  };

  const handleSaveCustomReason = () => {
    if (customReason.trim() !== '') {
      setSelectedReason(customReason);
      onSelect(customReason);
      setCustomReason('');
      setShowCustomInput(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="dropdown">
      <button className="btn" type="button" id="dropdownMenuButton" onClick={toggleDropdown}>
        {selectedReason === "default" ? "Selecciona una razón" : selectedReason}
      </button>
      <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`} aria-labelledby="dropdownMenuButton">
        {reasons.map(reason => (
          <a
            key={reason}
            className="dropdown-item"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleSelect(reason);
            }}
          >
            {reason}
          </a>
        ))}
        {showCustomInput && (
          <div className="custom-reason-input">
            <input
              type="text"
              value={customReason}
              onChange={handleCustomReasonChange}
              placeholder="Escribe tu razón"
            />
            <button onClick={handleSaveCustomReason}>Guardar</button>
          </div>
        )}
      </div>
    </div>
  );
};
