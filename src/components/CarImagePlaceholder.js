import React from 'react';

const CarImagePlaceholder = ({ type = 'default', carInfo, onClick }) => {
  const icons = {
    coming: (
      <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="var(--primary-red)" strokeWidth="2">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M9 3h6l2 3h-10z" />
      </svg>
    ),
    unavailable: (
      <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="var(--dark-gray)" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="8" x2="16" y2="16" />
        <line x1="16" y1="8" x2="8" y2="16" />
      </svg>
    ),
    contact: (
      <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="var(--primary-red)" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
      </svg>
    )
  };

  const messages = {
    coming: 'Photos Coming Soon',
    unavailable: 'No Images Available',
    contact: 'Contact Dealer for Photos'
  };

  return (
    <div className="placeholder-container" onClick={onClick}>
      <img 
        src="/autodealer-logo-light.png" 
        alt="Autodealer" 
        className="logo" 
        width="200" 
        height="60" 
      />
      {icons[type]}
      <h3 className="message">{messages[type]}</h3>
      {carInfo && (
        <div className="car-info">
          <div className="car-year-make">{carInfo.year} {carInfo.make}</div>
          <div className="car-model">{carInfo.model}</div>
        </div>
      )}
    </div>
  );
};

export default CarImagePlaceholder;