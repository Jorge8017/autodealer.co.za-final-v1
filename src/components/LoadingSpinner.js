import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercentage(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const rotation = (percentage / 100) * 180 - 90; // Convert percentage to degrees

  return (
    <div className="loader-container">
      <div className="speedometer">
        <div className="gauge">
          <div className="ticks">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="tick" style={{ transform: `rotate(${i * 18 - 90}deg)` }} />
            ))}
          </div>
          <div 
            className="needle" 
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="center-point" />
        </div>
        <div className="percentage">{percentage}%</div>
      </div>
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;