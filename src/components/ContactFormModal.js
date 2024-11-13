import React, { useState } from 'react';
import './ContactFormModal.css';

const ContactFormModal = ({ isOpen, onClose, carData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    region: '',
    message: '',
    sendAlerts: false
  });

  const [errors, setErrors] = useState({});

  const regions = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'Kwazulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await fetch('/api/contact-dealer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            carId: carData.id,
            dealerId: carData.dealerId
          }),
        });

        if (response.ok) {
          alert('Message sent successfully!');
          onClose();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        alert('Error sending message: ' + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Contact Dealer</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="car-info">
          <p>{carData?.year} {carData?.make} {carData?.model}</p>
          <p>{carData?.dealershipname}</p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Name*"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email*"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              placeholder="Mobile*"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
            {errors.mobile && <span className="error">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            >
              <option value="">-- Region --</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="sendAlerts"
              checked={formData.sendAlerts}
              onChange={(e) => setFormData({ ...formData, sendAlerts: e.target.checked })}
            />
            <label htmlFor="sendAlerts">Send me alerts for similar cars</label>
          </div>

          <div className="form-group">
            <textarea
              placeholder="Message*"
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
            {errors.message && <span className="error">{errors.message}</span>}
          </div>

          <button type="submit" className="submit-button">Send Message</button>

          <p className="terms">
            By continuing I understand and agree with Car Magazine's{' '}
            <a href="/terms-and-conditions">Terms & Conditions</a> and{' '}
            <a href="/privacy-policy">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;