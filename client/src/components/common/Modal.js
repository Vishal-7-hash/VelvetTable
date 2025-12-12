import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                {children}
                <button className="btn btn-primary" onClick={onClose}>OK</button>
            </div>
        </div>
    );
};

export default Modal;