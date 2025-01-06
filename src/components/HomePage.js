import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPriceZAR } from '../utils';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import './HomePage.css';
import './NewSection.css';
import truBruLogo from '../assets/images/tru-bru-logo.png';
import VideoModal from './VideoModal';

const HomePage = () => {
  const [featuredContent, setFeaturedContent] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [randomCars, setRandomCars] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const navigate = useNavigate();

  // Podcast episodes data
  const podcastEpisodes = [
    {
      id: 1,
      title: "Rise of the RSi - How Toyota Got its Mojo Back",
      videoId: "nOrhKNBgzTk",
      image: "https://img.youtube.com/vi/nOrhKNBgzTk/hqdefault.jpg"
    },
    {
      id: 2,
      title: "Rolling with the ROC: Bryan Habana",
      videoId: "G4YLRJe8hSM",
      image: "https://img.youtube.com/vi/G4YLRJe8hSM/hqdefault.jpg"
    },
    {
      id: 3,
      title: "The Fast Lane EP10",
      videoId: "4xzwHI04Kiw",
      image: "https://img.youtube.com/vi/4xzwHI04Kiw/hqdefault.jpg"
    },
    {
      id: 4,
      title: "ROC & Former Springbok Captain Jean de Villiers Take a Drive in a Toyota Prado!",
      videoId: "yalxuzI5YnY",
      image: "https://img.youtube.com/vi/yalxuzI5YnY/hqdefault.jpg"
    },
  ];

  const carModels = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van'];
  
  const formatMileage = (mileage) => {
    return `${mileage}km/h`;
  };

  const formatCarDetails = (transmission, mileage) => {
    return `${transmission} • ${formatMileage(mileage)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const scrollPodcasts = (direction) => {
    const container = document.querySelector('.podcast-grid');
    const scrollAmount = 300;
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const generateCarSlug = (car) => {
    return `used-${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  const handleFilterChange = async (filter, value) => {
    if (filter === 'bodytype') {
      setSelectedBodyType(value);
      await fetchCarsData(value);
      navigate(`/cars-for-sale?${filter}=${value}`);
    } else if (filter === 'sort') {
      navigate(`/cars-for-sale?${filter}=${value}`);
    }
  };

  const fetchCarsData = async (bodyType = '') => {
    setLoading(true);
    try {
      if (bodyType) {
        const filteredResponse = await axios.get(
          `${process.env.REACT_APP_DEALER_API}-new.php?getlistings=1&bodytype=${bodyType}`
        );
        if (filteredResponse.data.listings && Array.isArray(filteredResponse.data.listings)) {
          setFilteredCars(filteredResponse.data.listings);
        }
      } else {
        setFilteredCars([]);
      }

      const randomCarsResponse = await axios.get(`${process.env.REACT_APP_DEALER_API}.php?getlistings=1`);
      if (randomCarsResponse.data.listings && Array.isArray(randomCarsResponse.data.listings)) {
        setRandomCars(randomCarsResponse.data.listings);
      }
    } catch (err) {
      setError('Failed to fetch car data');
      console.error('Car fetching error:', err);
    }
    setLoading(false);
  };

  // Effect hooks
  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_WP_API}/posts/?tags=17&per_page=3&_embed`
        );
      } catch (err) {
        console.error('Failed to fetch featured content:', err);
      }
    };

    fetchFeaturedContent();
    fetchCarsData();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          'https://content.hsmdns.co.za/wp-json/wp/v2/posts/?categories=5&tags_exclude=17&per_page=6&_embed'
        );
        setArticles(response.data);
      } catch (err) {
        console.error('Failed to fetch news articles:', err);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="home-page">
      <main className="main-content">
        {/* Featured Content Section */}
        {featuredContent.length > 0 && (
          <section className="featured-section">
            <div className="featured-slide active">
              <div className="featured-card">
                <div className="featured-main">
                  <div className="time-badge">News</div>
                  <Link 
                    to={`/news/${featuredContent[0].id}`}
                    className="featured-main-link"
                  >
                    {featuredContent[0]._embedded?.['wp:featuredmedia'] && (
                      <img 
                        src={featuredContent[0]._embedded['wp:featuredmedia'][0].source_url}
                        alt={featuredContent[0].title.rendered}
                      />
                    )}
                    <div className="featured-info-overlay">
                      <h2 
                        className="featured-title"
                        dangerouslySetInnerHTML={{ __html: featuredContent[0].title.rendered }}
                      />
                      <div className="featured-specs">
                        {formatDate(featuredContent[0].date)}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="featured-thumbnails">
                  {/* Second Article */}
                  <Link 
                    to={`/news/${featuredContent[1]?.id}`}
                    className="featured-secondary"
                  >
                    <img 
                      src={featuredContent[1]?._embedded?.['wp:featuredmedia']?.[0]?.source_url}
                      alt={featuredContent[1]?.title.rendered}
                      loading="lazy"
                    />
                  </Link>
                  {/* Second Article Title */}
                  <div className="featured-secondary text-content">
                    <Link 
                      to={`/news/${featuredContent[1]?.id}`}
                      className="thumbnail-content"
                    >
                      <h3 dangerouslySetInnerHTML={{ __html: featuredContent[1]?.title.rendered }} />
                      <span className="thumbnail-date">{formatDate(featuredContent[1]?.date)}</span>
                    </Link>
                  </div>
                  {/* Third Article Image */}
                  <Link 
                    to={`/news/${featuredContent[2]?.id}`}
                    className="featured-secondary"
                  >
                    <img 
                      src={featuredContent[2]?._embedded?.['wp:featuredmedia']?.[0]?.source_url}
                      alt={featuredContent[2]?.title.rendered}
                      loading="lazy"
                    />
                  </Link>
                  {/* Third Article Title */}
                  <div className="featured-secondary text-content">
                    <Link 
                      to={`/news/${featuredContent[2]?.id}`}
                      className="thumbnail-content"
                    >
                      <h3 dangerouslySetInnerHTML={{ __html: featuredContent[2]?.title.rendered }} />
                      <span className="thumbnail-date">{formatDate(featuredContent[2]?.date)}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Podcast Section */}
        <section className="podcast-section">
          <div className="podcast-container">
            <h2 className="podcast-title">Our Podcast's Latest</h2>
            <button 
              className="podcast-scroll-button left"
              onClick={() => scrollPodcasts('left')}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button 
              className="podcast-scroll-button right"
              onClick={() => scrollPodcasts('right')}
              aria-label="Scroll right"
            >
              ›
            </button>
            <div className="podcast-grid">
              <div className="podcast-card podcast-logo-card">
                <div className="podcast-image-container">
                  <img 
                    src={truBruLogo}
                    alt="Tru Bru Logo"
                    className="podcast-logo-image"
                  />
                </div>
              </div>
              
              {podcastEpisodes.map((episode) => (
                <div 
                  key={episode.id}
                  className="podcast-card"
                  onClick={() => {
                    if (episode.videoId) {
                      setSelectedVideoId(episode.videoId);
                      setIsVideoModalOpen(true);
                    }
                  }}
                  style={{ cursor: episode.videoId ? 'pointer' : 'default' }}
                >
                  <div className={`podcast-image-container ${episode.videoId ? 'video-card' : ''}`}>
                    <img 
                      src={episode.image}
                      alt={episode.title}
                    />
                    {episode.videoId && (
                      <div className="video-play-button">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                        </svg>
                      </div>
                    )}
                    <div className="podcast-content">
                      <h3>{episode.title}</h3>
                      <p>{episode.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Filters Section */}
        <div className="filters-wrapper">
          <div className="home-filters-container">
            <div className="filter-buttons">
              {carModels.map((model) => (
                <button
                  key={model}
                  className={`filter-button ${selectedBodyType === model ? 'active' : ''}`}
                  onClick={() => handleFilterChange('bodytype', model)}
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

        {/* Car Grid */}
        <div className="car-grid">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
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
            ))
          ) : (
            randomCars.map((car) => (
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
            ))
          )}
        </div>

        {/* News Section */}
        <section className="news-section">
          <div className="news-container">
            <h2 className="news-title">Latest car news</h2>
            <div className="news-grid">
              {articles.map((article) => (
                <article key={article.id} className="news-card">
                  <Link 
                    to={`/news/${article.id}`}
                    className="news-card-link"
                  >
                    {article._embedded && article._embedded['wp:featuredmedia'] && (
                      <div className="news-image-container">
                        <img
                          src={article._embedded['wp:featuredmedia'][0].source_url}
                          alt={article.title.rendered}
                          className="news-image"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="news-content">
                      <h3 
                        className="news-card-title"
                        dangerouslySetInnerHTML={{ __html: article.title.rendered }}
                      />
                      <span className="news-date">{formatDate(article.date)}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Video Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedVideoId(null);
          }}
          videoId={selectedVideoId}
        />
      </main>
    </div>
  );
};

export default HomePage;