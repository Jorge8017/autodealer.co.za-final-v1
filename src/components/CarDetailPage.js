import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPriceZAR } from '../utils';
import ContactFormModal from './ContactFormModal';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import './CarDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DEALER_API_ENDPOINT = process.env.REACT_APP_DEALER_API_ENDPOINT;
const FEATURED_API_ENDPOINT = process.env.REACT_APP_FEATURED_API_ENDPOINT;

const CarDetailPage = () => {
  const { id, carSlug } = useParams();
  const navigate = useNavigate();
  
  // State declarations
  const [carData, setCarData] = useState(null);
  const [suggestedCars, setSuggestedCars] = useState([]);
  const [mainImage, setMainImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Format mileage with km/h
  const formatMileage = (mileage) => {
    return `${mileage}km/h`;
  };

  // Format car details
  const formatCarDetails = (transmission, mileage) => {
    return `${transmission} • ${formatMileage(mileage)}`;
  };

  // Generate car slug
  const generateCarSlug = (car) => {
    return `used-${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  // Handlers
  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  const handleImageNavigation = (direction) => {
    if (direction === 'next') {
      setMainImage(prev => prev === images.length - 1 ? 0 : prev + 1);
    } else {
      setMainImage(prev => prev === 0 ? images.length - 1 : prev - 1);
    }
  };

  const handleModalNavigation = (direction) => {
    const currentIndex = images.findIndex(img => img === modalImage);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    }
    
    setModalImage(images[newIndex]);
    setMainImage(newIndex);
  };

  const handleGalleryNavigation = () => {
    navigate(`/car-for-sale/${id}/photos`);
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Fetch car data and suggested cars
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch main car data
        const carResponse = await fetch(`${API_BASE_URL}${DEALER_API_ENDPOINT}?getlistings=1&single=1&ID=${id}`);
        const carData = await carResponse.json();
        
        if (carData.listings && carData.listings.length > 0) {
          setCarData(carData.listings[0]);
        } else {
          setError('Car data not found');
        }

        // Fetch featured cars for suggestions
        const featuredResponse = await axios.get(`${API_BASE_URL}${FEATURED_API_ENDPOINT}`);
        const featuredIds = featuredResponse.data.car_ids;

        const featuredDetailsPromises = featuredIds.map(featuredId =>
          axios.get(`${API_BASE_URL}${FEATURED_API_ENDPOINT}`)
        );

        const featuredResults = await Promise.all(featuredDetailsPromises);
        const featuredCars = featuredResults
          .map(response => response.data.listings?.[0])
          .filter(car => car && car.id !== id);

        setSuggestedCars(featuredCars);
      } catch (err) {
        setError('Failed to fetch car data');
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Handle keyboard navigation
  const handleKeyPress = useCallback((e) => {
    if (isModalOpen && e.key === 'Escape') {
      handleCloseModal();
    } else if (e.key === 'ArrowLeft') {
      handleImageNavigation('prev');
    } else if (e.key === 'ArrowRight') {
      handleImageNavigation('next');
    }
  }, [isModalOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Control body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isContactModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isContactModalOpen]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;
  if (!carData) return <div className="error-state">No car data available.</div>;

  const images = [
    carData.image1, carData.image2, carData.image3, carData.image4, carData.image5,
    carData.image6, carData.image7, carData.image8, carData.image9, carData.image10,
  ].filter(Boolean);

  const features = carData.Features ? carData.Features.split('\n').filter(Boolean) : [];
  const highlights = features.slice(0, Math.ceil(features.length / 3));
  const equipment = features.slice(Math.ceil(features.length / 3), Math.ceil(features.length * 2/3));
  const additionalFeatures = features.slice(Math.ceil(features.length * 2/3));
  return (
    <div className="car-detail-page">
      {isModalOpen && (
        <div className="image-modal" onClick={handleCloseModal}>
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

      <ContactFormModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        carData={carData}
      />

      <div className="content-wrapper">
        <nav className="navigation-breadcrumb">
          <Link to="/cars-for-sale">Cars for Sale</Link> /
          <Link to={`/cars-for-sale?make=${carData.make}`}>{carData.make}</Link> /
          <Link to={`/cars-for-sale?model=${carData.model}`}>{carData.model}</Link> / 
          <span>{carData.year}</span>
        </nav>

        <div className="main-header">
          <h1 className="detail-page-title">
            {carData.year} {carData.make} {carData.model}
          </h1>
        </div>

        <div className="image-gallery">
          <div className="main-image-section">
            <div className="main-image-container">
              {carData.category && (
                <div className="category-label">{carData.category}</div>
              )}
              <img 
                src={images[mainImage]} 
                alt={`${carData.year} ${carData.make} ${carData.model}`} 
                className="main-image"
                onClick={() => handleImageClick(images[mainImage])}
              />
              <div className="photo-count" onClick={handleGalleryNavigation}>
                All Photos ({images.length})
              </div>
              <button 
                className="main-image-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('prev');
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button 
                className="main-image-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNavigation('next');
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          </div>

          <div className="side-images-grid">
            {images.slice(0, 5).map((img, index) => (
              <div
                key={index}
                className={`side-image ${mainImage === index ? 'active' : ''}`}
                onClick={() => setMainImage(index)}
              >
                <img 
                  src={img} 
                  alt={`${carData.make} ${carData.model} view ${index + 1}`} 
                  loading="lazy"
                />
              </div>
            ))}
            {images.length > 5 && (
              <div 
                className="side-image view-all"
                onClick={handleGalleryNavigation}
              >
                <span>View All Photos</span>
              </div>
            )}
          </div>
        </div>

        <div className="car-details-layout">
          <div className="car-details-main">
            <div className="car-subtitle">
              {formatCarDetails(carData.transmission, carData.km)} • {carData.bodytype}
            </div>
            <div className="price-section">
              <div className="current-price">{formatPriceZAR(carData.price)}</div>
            </div>

            <div className="details-grid">
              <div className="specs-column">
                <div className="spec-item">
                  <div className="spec-label">Make</div>
                  <div className="spec-value">{carData.make}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Model</div>
                  <div className="spec-value">{carData.model}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Mileage</div>
                  <div className="spec-value">{formatMileage(carData.km)}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">VIN</div>
                  <div className="spec-value">{carData.vin || 'N/A'}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Location</div>
                  <div className="spec-value">{carData.city}, {carData.region}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Seller</div>
                  <div className="spec-value">{carData.dealershipname}</div>
                </div>
              </div>

              <div className="specs-column">
                <div className="spec-item">
                  <div className="spec-label">Engine</div>
                  <div className="spec-value">{carData.engine || 'N/A'}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Drivetrain</div>
                  <div className="spec-value">{carData.drivetrain || 'N/A'}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Transmission</div>
                  <div className="spec-value">{carData.transmission}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Body Style</div>
                  <div className="spec-value">{carData.bodytype}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Exterior Color</div>
                  <div className="spec-value">{carData.colour}</div>
                </div>
                <div className="spec-item">
                  <div className="spec-label">Seller Type</div>
                  <div className="spec-value">Dealer</div>
                </div>
              </div>
            </div>

            <div className="content-sections">
              {carData.description && (
                <section className="description">
                  <h2>Description</h2>
                  <p>{carData.description}</p>
                </section>
              )}

              {highlights.length > 0 && (
                <section className="features">
                  <h2>Highlights</h2>
                  <ul>
                    {highlights.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {equipment.length > 0 && (
                <section className="equipment">
                  <h2>Equipment</h2>
                  <ul>
                    {equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {additionalFeatures.length > 0 && (
                <section className="additional-features">
                  <h2>Additional Features</h2>
                  <ul>
                    {additionalFeatures.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          <aside className="contact-sidebar">
            <div className="contact-dealer">
              <h3>Contact Dealer</h3>
              <button 
                className="contact-button"
                onClick={handleContactClick}
              >
                Send Message
              </button>
            </div>

            <div className="dealer-info">
              <h3>{carData.dealershipname}</h3>
              <p>{carData.city}, {carData.region}</p>
              <p>{carData.phone}</p>
            </div>
          </aside>
        </div>

        {suggestedCars.length > 0 && (
          <div className="similar-cars-wrapper">
            <div className="similar-cars-container">
              <h2>Cars You May Also Like</h2>
              <div className="car-grid">
                {suggestedCars.map((car) => (
                  <Link 
                    to={`/car-for-sale/${generateCarSlug(car)}/${car.id}`} 
                    key={car.id} 
                    className="car-item-link"
                  >
                    <div className="car-item">
                      <div className="car-item-image-container">
                        <img 
                          src={car.image1} 
                          alt={`${car.year} ${car.make} ${car.model}`}
                          loading="lazy"
                        />
                        <div className="car-item-price">
                          {formatPriceZAR(car.price)}
                        </div>
                      </div>
                      <div className="car-info">
                        <div className="car-title">
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className="car-details">
                          {formatCarDetails(car.transmission, car.km)}
                          {`\n${car.city}, ${car.region}`}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarDetailPage;