import React, { useState } from 'react';
import './MultiSelectDropdown.css';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    return (
        <div className="multi-select-dropdown">
            <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
                {selected.length > 0 ? selected.join('; ') : placeholder}
            </div>
            {isOpen && (
                <div className="dropdown-list">
                    {options.map(option => (
                        <label key={option} className="dropdown-item">
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => handleSelect(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;