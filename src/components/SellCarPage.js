import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import './SellCarPage.css';

export default function SellCarPage() {
  const [currentStep, setCurrentStep] = useState('personal'); 
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    additionalInfo: ''
  });

  const [carData, setCarData] = useState({
    make: '',
    model: '',
    year: '',
    transmission: '',
    mileage: '',
    fuelType: '',
    exteriorCondition: '',
    interiorCondition: ''
  });

  const [photos, setPhotos] = useState({
    frontView: null,
    backView: null,
    rightSideView: null,
    leftSideView: null,
    interiorViews: [],
    damagePhotos: []
  });

  const [previews, setPreviews] = useState({
    frontView: null,
    backView: null,
    rightSideView: null,
    leftSideView: null,
    interiorViews: [],
    damagePhotos: []
  });

  useEffect(() => {
    return () => {
      Object.values(previews).forEach(preview => {
        if (Array.isArray(preview)) {
          preview.forEach(URL.revokeObjectURL);
        } else if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [previews]);

  const handlePersonalNext = (e) => {
    e.preventDefault();
    setCurrentStep('car');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentStep('personal');
    window.scrollTo(0, 0);
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      alert('Please upload only image files');
      return;
    }

    if (type === 'interiorViews' || type === 'damagePhotos') {
      const maxFiles = type === 'interiorViews' ? 10 : 20;
      const currentFiles = photos[type];
      
      if (currentFiles.length + validFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} photos for ${type}`);
        return;
      }

      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      
      setPhotos(prev => ({
        ...prev,
        [type]: [...prev[type], ...validFiles]
      }));
      
      setPreviews(prev => ({
        ...prev,
        [type]: [...prev[type], ...newPreviews]
      }));
    } else {
      const file = validFiles[0];
      const previewUrl = URL.createObjectURL(file);

      setPhotos(prev => ({
        ...prev,
        [type]: file
      }));

      setPreviews(prev => ({
        ...prev,
        [type]: previewUrl
      }));
    }
  };

  const removePhoto = (type, index) => {
    if (type === 'interiorViews' || type === 'damagePhotos') {
      setPhotos(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
      
      URL.revokeObjectURL(previews[type][index]);
      setPreviews(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    } else {
      URL.revokeObjectURL(previews[type]);
      setPhotos(prev => ({ ...prev, [type]: null }));
      setPreviews(prev => ({ ...prev, [type]: null }));
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    Object.entries(personalData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    Object.entries(carData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    ['frontView', 'backView', 'rightSideView', 'leftSideView'].forEach(type => {
      if (photos[type]) {
        formDataToSend.append(type, photos[type]);
      }
    });
    
    photos.interiorViews.forEach((file, index) => {
      formDataToSend.append(`interiorViews[${index}]`, file);
    });
    
    photos.damagePhotos.forEach((file, index) => {
      formDataToSend.append(`damagePhotos[${index}]`, file);
    });

    try {
      const response = await fetch('/api/sell-car', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        alert('Form submitted successfully!');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    }
  };
  const FileUploadBox = ({ type, label, hint, multiple = false }) => (
    <div className="file-upload">
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFileSelect(e, type)}
        className="file-input"
        id={`file-${type}`}
      />
      {(!previews[type] || (Array.isArray(previews[type]) && previews[type].length === 0)) ? (
        <>
          <Upload className="file-upload-icon" />
          <p className="file-upload-text">{label}</p>
          {hint && <p className="file-upload-hint">{hint}</p>}
        </>
      ) : (
        <div className="preview-container">
          {Array.isArray(previews[type]) ? (
            previews[type].map((url, index) => (
              <div key={url} className="preview-image-wrapper">
                <img src={url} alt={`${type} preview ${index + 1}`} className="preview-image" />
                <button
                  className="remove-image"
                  onClick={() => removePhoto(type, index)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="preview-image-wrapper">
              <img src={previews[type]} alt={`${type} preview`} className="preview-image" />
              <button
                className="remove-image"
                onClick={() => removePhoto(type)}
                type="button"
              >
                ×
              </button>
            </div>
          )}
          {multiple && (
            <div className="file-upload upload-more">
              <Upload className="file-upload-icon" />
              <p className="file-upload-text">Add More Photos</p>
              {hint && <p className="file-upload-hint">{hint}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="sell-car-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Sell Your Car Today</h1>
          <p className="hero-subtitle">Get an instant offer in minutes - it's quick and easy!</p>
          <a href="#form-section" className="cta-button">Get Started</a>
        </div>
      </div>

      <div className="steps-container">
        <div className="step-card">
          <div className="step-icon">
            <Upload size={48} />
          </div>
          <h3 className="step-title">Step 1</h3>
          <p className="step-description">Enter your details</p>
        </div>
        <div className="step-card">
          <div className="step-icon">
            <Upload size={48} />
          </div>
          <h3 className="step-title">Step 2</h3>
          <p className="step-description">Provide car information</p>
        </div>
        <div className="step-card">
          <div className="step-icon">
            <Upload size={48} />
          </div>
          <h3 className="step-title">Step 3</h3>
          <p className="step-description">Get an instant offer</p>
        </div>
      </div>

      <div className="form-wrapper">
        {currentStep === 'personal' ? (
          <form id="form-section" className="form-container" onSubmit={handlePersonalNext}>
            <div className="form-section">
              <h2 className="form-section-header">Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 1</label>
                <input
                  type="text"
                  className="form-input"
                  value={personalData.addressLine1}
                  onChange={(e) => setPersonalData({...personalData, addressLine1: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 2</label>
                <input
                  type="text"
                  className="form-input"
                  value={personalData.addressLine2}
                  onChange={(e) => setPersonalData({...personalData, addressLine2: e.target.value})}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.city}
                    onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Province</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.province}
                    onChange={(e) => setPersonalData({...personalData, province: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.postalCode}
                    onChange={(e) => setPersonalData({...personalData, postalCode: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personalData.country}
                    onChange={(e) => setPersonalData({...personalData, country: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Information</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={personalData.additionalInfo}
                  onChange={(e) => setPersonalData({...personalData, additionalInfo: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="submit-button">Sell car now</button>
          </form>
        ) : null}
        {currentStep === 'car' && (
          <form id="form-section" className="form-container" onSubmit={handleFinalSubmit}>
            <button type="button" onClick={handleBack} className="back-button">
              <ArrowLeft size={20} /> Back to personal details
            </button>
            
            <div className="form-section">
              <h2 className="form-section-header">Car Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Make</label>
                  <select 
                    className="form-select"
                    value={carData.make}
                    onChange={(e) => setCarData({...carData, make: e.target.value})}
                    required
                  >
                    <option value="">Select Make</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Ford">Ford</option>
                    <option value="BMW">BMW</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    className="form-input"
                    value={carData.model}
                    onChange={(e) => setCarData({...carData, model: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select 
                    className="form-select"
                    value={carData.year}
                    onChange={(e) => setCarData({...carData, year: e.target.value})}
                    required
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transmission</label>
                  <select
                    className="form-select"
                    value={carData.transmission}
                    onChange={(e) => setCarData({...carData, transmission: e.target.value})}
                    required
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mileage (Kilometers)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={carData.mileage}
                    onChange={(e) => setCarData({...carData, mileage: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select
                    className="form-select"
                    value={carData.fuelType}
                    onChange={(e) => setCarData({...carData, fuelType: e.target.value})}
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Front View Photo</label>
                <FileUploadBox
                  type="frontView"
                  label="Upload front view photo"
                  hint="Required"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Back View Photo</label>
                <FileUploadBox
                  type="backView"
                  label="Upload back view photo"
                  hint="Required"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Side Views</label>
                <div className="form-grid">
                  <div className="form-group">
                    <FileUploadBox
                      type="leftSideView"
                      label="Upload left side photo"
                      hint="Required"
                    />
                  </div>
                  <div className="form-group">
                    <FileUploadBox
                      type="rightSideView"
                      label="Upload right side photo"
                      hint="Required"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interior Photos</label>
                <FileUploadBox
                  type="interiorViews"
                  label="Upload interior photos"
                  hint="Up to 10 photos"
                  multiple
                />
              </div>

              <div className="form-group">
                <label className="form-label">Damage Photos (if any)</label>
                <FileUploadBox
                  type="damagePhotos"
                  label="Upload damage photos"
                  hint="Up to 20 photos"
                  multiple
                />
              </div>
            </div>

            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}
