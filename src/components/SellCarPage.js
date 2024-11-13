import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import './SellCarPage.css';

export default function SellCarPage() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    transmission: '',
    mileage: '',
    fuelType: '',
    exteriorCondition: '',
    interiorCondition: '',
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    
    // Append single photos
    ['frontView', 'backView', 'rightSideView', 'leftSideView'].forEach(type => {
      if (photos[type]) {
        formDataToSend.append(type, photos[type]);
      }
    });
    
    // Append multiple photos
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
          <p className="step-description">Enter your car details and receive an instant offer</p>
        </div>
        <div className="step-card">
          <div className="step-icon">
            <Upload size={48} />
          </div>
          <h3 className="step-title">Step 2</h3>
          <p className="step-description">Book a free vehicle inspection at your location</p>
        </div>
        <div className="step-card">
          <div className="step-icon">
            <Upload size={48} />
          </div>
          <h3 className="step-title">Step 3</h3>
          <p className="step-description">Get paid instantly and we handle all the paperwork</p>
        </div>
      </div>

      <form id="form-section" className="form-container" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-header">Car Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Make</label>
              <select 
                className="form-select"
                value={formData.make}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
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
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <select 
                className="form-select"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select
                className="form-select"
                value={formData.transmission}
                onChange={(e) => setFormData({...formData, transmission: e.target.value})}
              >
                <option value="">Select Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mileage (Kilometres)</label>
              <input
                type="number"
                className="form-input"
                value={formData.mileage}
                onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                value={formData.fuelType}
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exterior Condition</label>
              <select
                className="form-select"
                value={formData.exteriorCondition}
                onChange={(e) => setFormData({...formData, exteriorCondition: e.target.value})}
              >
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Interior Condition</label>
              <select
                className="form-select"
                value={formData.interiorCondition}
                onChange={(e) => setFormData({...formData, interiorCondition: e.target.value})}
              >
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Front View</label>
            <FileUploadBox
              type="frontView"
              label="Click or drag files to upload front view photo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Back View</label>
            <FileUploadBox
              type="backView"
              label="Click or drag files to upload back view photo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Right Side View</label>
            <FileUploadBox
              type="rightSideView"
              label="Click or drag files to upload right side photo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Left Side View</label>
            <FileUploadBox
              type="leftSideView"
              label="Click or drag files to upload left side photo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interior Views</label>
            <FileUploadBox 
              type="interiorViews"
              label="Click or drag files to upload interior photos"
              hint="(up to 10 photos)"
              multiple={true}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Damage Photos</label>
            <FileUploadBox 
              type="damagePhotos"
              label="Click or drag files to upload damage photos"
              hint="(up to 20 photos)"
              multiple={true}
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-header">Personal Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 1</label>
            <input
              type="text"
              className="form-input"
              value={formData.addressLine1}
              onChange={(e) => setFormData({...formData, addressLine1: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address Line 2</label>
            <input
              type="text"
              className="form-input"
              value={formData.addressLine2}
              onChange={(e) => setFormData({...formData, addressLine2: e.target.value})}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Province</label>
              <input
                type="text"
                className="form-input"
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.postalCode}
                onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <textarea
              className="form-input"
              rows="4"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
}

