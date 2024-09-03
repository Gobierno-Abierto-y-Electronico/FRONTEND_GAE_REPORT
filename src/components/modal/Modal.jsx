// Modal.jsx
import React from 'react';
import './Modal.css';

export const Modal = ({ show, onClose, children }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="modal-close" onClick={onClose}>X</button>
                <div className="modal-header">
                    <h4 className="modal-title">Razón</h4>  {/* Cambiado a "Razón" */}
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};
