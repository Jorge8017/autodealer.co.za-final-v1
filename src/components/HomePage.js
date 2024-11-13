import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPriceZAR } from '../utils';
import axios from 'axios';
import './HomePage.css';
import './NewSection.css';

const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [randomCars, setRandomCars] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showAllNews, setShowAllNews] = useState(false);
  const navigate = useNavigate();

  const carModels = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van'];

  // Fetch featured car IDs and their details
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, fetch the featured car IDs
        const featuredResponse = await axios.get('https://dealer.carmag.co.za/featured-api.json');
        const featuredIds = featuredResponse.data.car_ids;

        // Then fetch details for each featured car
        const featuredDetailsPromises = featuredIds.map(id =>
          axios.get(`https://dealer.carmag.co.za/autodealer-api-new.php?getlistings=1&single=1&ID=${id}`)
        );

        const featuredResults = await Promise.all(featuredDetailsPromises);
        const featuredCarDetails = featuredResults
          .map(response => response.data.listings?.[0])
          .filter(car => car); // Filter out any undefined results

        setFeaturedCars(featuredCarDetails);

        // Fetch regular cars (excluding featured ones)
        const regularCarsResponse = await axios.get('https://dealer.carmag.co.za/autodealer-api.php?getlistings=1');
        if (regularCarsResponse.data.listings && Array.isArray(regularCarsResponse.data.listings)) {
          // Filter out featured cars from regular listings
          const regularCars = regularCarsResponse.data.listings.filter(
            car => !featuredIds.includes(parseInt(car.id))
          );
          setRandomCars(regularCars);
        }
      } catch (err) {
        setError('Failed to fetch car data');
        console.error('Car fetching error:', err);
      }
      setLoading(false);
    };

    fetchFeaturedCars();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          'https://content.hsmdns.co.za/wp-json/wp/v2/posts/?categories=5&per_page=10&_embed'
        );
        setArticles(response.data);
      } catch (err) {
        console.error('Failed to fetch news articles:', err);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    if (featuredCars.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((current) => 
        current === featuredCars.length - 1 ? 0 : current + 1
      );
    }, 30000);

    return () => clearInterval(timer);
  }, [featuredCars.length]);

  const handleFilterChange = (filter, value) => {
    navigate(`/cars-for-sale?${filter}=${value}`);
  };

  const generateCarSlug = (car) => {
    return `used-${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleNextArticles = () => {
    if (!showAllNews && currentArticleIndex < articles.length - 3) {
      setCurrentArticleIndex(currentArticleIndex + 1);
    }
  };

  const handlePrevArticles = () => {
    if (!showAllNews && currentArticleIndex > 0) {
      setCurrentArticleIndex(currentArticleIndex - 1);
    }
  };

  const handleViewMoreNews = () => {
    setShowAllNews(!showAllNews);
    setCurrentArticleIndex(0);
  };

  const handlePrevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((current) => 
      current === 0 ? featuredCars.length - 1 : current - 1
    );
  };

  const handleNextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((current) => 
      current === featuredCars.length - 1 ? 0 : current + 1
    );
  };

  if (loading) return <div>Loading cars...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="home-page">
      <main className="main-content">
        {featuredCars.length > 0 && (
          <section className="featured-section">
            {featuredCars.map((car, index) => (
              <div 
                key={car.id}
                className={`featured-slide ${index === activeSlide ? 'active' : ''}`}
              >
                <div className="featured-card">
                  <div className="featured-main">
                    <div className="time-badge">Featured</div>
                    <Link 
                      to={`/car-for-sale/${generateCarSlug(car)}/${car.id}`}
                      className="featured-main-link"
                    >
                      <img 
                        src={car.image1} 
                        alt={`${car.year} ${car.make} ${car.model}`} 
                      />
                      <div className="featured-info-overlay">
                        <h2 className="featured-title">
                          {car.year} {car.make} {car.model}
                        </h2>
                        <div className="featured-price">
                          {formatPriceZAR(car.price)}
                        </div>
                        <div className="featured-specs">
                          {car.engine || 'Engine'} • {car.transmission} • {car.km}
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="featured-thumbnails">
                    <div className="featured-secondary">
                      <img 
                        src={car.image2} 
                        alt={`${car.make} ${car.model} view 1`}
                        loading="lazy"
                      />
                    </div>
                    <div className="featured-secondary">
                      <img 
                        src={car.image3} 
                        alt={`${car.make} ${car.model} view 2`}
                        loading="lazy"
                      />
                    </div>
                    <div className="featured-secondary">
                      <img 
                        src={car.image4} 
                        alt={`${car.make} ${car.model} view 3`}
                        loading="lazy"
                      />
                    </div>
                    <div className="featured-nav-thumbnail">
                      <img 
                        src={car.image5} 
                        alt={`${car.make} ${car.model} view 4`}
                        loading="lazy"
                      />
                      <div className="nav-overlay">
                        <button 
                          onClick={handlePrevSlide}
                          className="nav-button prev"
                          aria-label="Previous car"
                        >
                          ‹
                        </button>
                        <button 
                          onClick={handleNextSlide}
                          className="nav-button next"
                          aria-label="Next car"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

<div className="filters-wrapper">
          <div className="home-filters-container">
            <div className="filter-buttons">
              {carModels.map((model) => (
                <button
                  key={model}
                  className="filter-button"
                  onClick={() => handleFilterChange('BodyStyle', model)}
                >
                  {model}
                </button>
              ))}
            </div>

            <div className="sort-options home">
              <button className="sort-button" onClick={() => handleFilterChange('sort', 'new')}>
                Newly listed
              </button>
              <button className="sort-button" onClick={() => handleFilterChange('sort', 'mileage')}>
                Lowest mileage
              </button>
              <button className="sort-button" onClick={() => handleFilterChange('sort', 'closest')}>
                Closest to me
              </button>
            </div>
          </div>
        </div>

        <h2>More Cars</h2>
        <div className="car-grid">
          {randomCars.map((car) => (
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
                    {`${car.engine || ''} ${car.transmission} ${car.km}\n${car.city}, ${car.region}`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="news-section">
          <div className="news-container">
            <h2 className="news-title">Latest car news</h2>
            <div className="news-grid">
              {(showAllNews ? articles : articles.slice(currentArticleIndex, currentArticleIndex + 3)).map((article) => (
                <article key={article.id} className="news-card">
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-card-link"
                  >
                    <div className="news-image-container">
                      {article._embedded && article._embedded['wp:featuredmedia'] && (
                        <img
                          src={article._embedded['wp:featuredmedia'][0].source_url}
                          alt={article.title.rendered}
                          className="news-image"
                        />
                      )}
                    </div>
                    <div className="news-content">
                      <h3 
                        className="news-card-title"
                        dangerouslySetInnerHTML={{ __html: article.title.rendered }}
                      />
                      <span className="news-date">{formatDate(article.date)}</span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
            
            {!showAllNews && (
              <div className="news-navigation">
                <button 
                  onClick={handlePrevArticles} 
                  className="nav-button prev"
                  disabled={currentArticleIndex === 0}
                >
                  ‹
                </button>
                <button 
                  onClick={handleNextArticles} 
                  className="nav-button next"
                  disabled={currentArticleIndex >= articles.length - 3}
                >
                  ›
                </button>
              </div>
            )}

            <div className="news-footer">
              <button className="view-more-news" onClick={handleViewMoreNews}>
                {showAllNews ? 'Show Less' : 'View more car news'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;