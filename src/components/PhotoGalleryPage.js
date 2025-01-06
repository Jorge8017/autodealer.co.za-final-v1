import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './PhotoGalleryPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DEALER_API_ENDPOINT = process.env.REACT_APP_DEALER_API_ENDPOINT;

const PhotoGalleryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carData, setCarData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}${DEALER_API_ENDPOINT}?getlistings=1&single=1&ID=${id}`);
        const data = await response.json();
        
        if (data.listings && data.listings.length > 0) {
          setCarData(data.listings[0]);
        } else {
          setError('Car data not found');
        }
      } catch (err) {
        setError('Failed to fetch car data');
      }
      setLoading(false);
    };

    fetchCarData();
  }, [id]);

  // Add event listener for ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;
  if (!carData) return <div className="error-state">No photos available.</div>;

  const allImages = [
    carData.image1, carData.image2, carData.image3, carData.image4, carData.image5,
    carData.image6, carData.image7, carData.image8, carData.image9, carData.image10
  ].filter(Boolean);

  // In a real application, you'd want to have proper categorization from your API
  const categories = {
    all: allImages,
    exterior: allImages.slice(0, Math.floor(allImages.length * 0.6)),
    interior: allImages.slice(Math.floor(allImages.length * 0.6)),
  };

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const handleModalNavigation = (direction) => {
    const currentIndex = categories[activeCategory].findIndex(img => img === modalImage);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === categories[activeCategory].length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? categories[activeCategory].length - 1 : currentIndex - 1;
    }
    
    setModalImage(categories[activeCategory][newIndex]);
  };
  return (
    <div className="photo-gallery-page">
      {/* Image Modal */}
      {isModalOpen && (
        <div className="gallery-modal" onClick={handleCloseModal}>
          <button className="modal-close-btn" onClick={handleCloseModal}>×</button>
          <button 
            className="modal-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              handleModalNavigation('prev');
            }}
          >
            ‹
          </button>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={modalImage} alt="Expanded view" />
          </div>
          <button 
            className="modal-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              handleModalNavigation('next');
            }}
          >
            ›
          </button>
        </div>
      )}

      <div className="gallery-header">
        <button className="close-button" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="category-tabs">
          <button 
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Photos ({categories.all.length})
          </button>
          <button 
            className={`category-tab ${activeCategory === 'exterior' ? 'active' : ''}`}
            onClick={() => setActiveCategory('exterior')}
          >
            Exterior ({categories.exterior.length})
          </button>
          <button 
            className={`category-tab ${activeCategory === 'interior' ? 'active' : ''}`}
            onClick={() => setActiveCategory('interior')}
          >
            Interior ({categories.interior.length})
          </button>
        </div>
        <div className="gallery-title">
          {carData.year} {carData.make} {carData.model}
        </div>
      </div>

      <div className="gallery-grid">
        {categories[activeCategory].map((image, index) => (
          <div 
            key={index} 
            className="gallery-item"
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image} 
              alt={`${carData.make} ${carData.model} view ${index + 1}`} 
              loading="lazy" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGalleryPage;