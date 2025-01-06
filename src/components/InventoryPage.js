import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import './InventoryPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DEALER_API_ENDPOINT = process.env.REACT_APP_DEALER_API_ENDPOINT;
const FEATURED_API_ENDPOINT = process.env.REACT_APP_FEATURED_API_ENDPOINT;


const InventoryPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const region = searchParams.get('region') || '';
  const bodytype = searchParams.get('bodytype') || '';
  const maxPrice = searchParams.get('max-price');

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState(bodytype);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortOrder, setSortOrder] = useState('newly-listed');

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const transmissions = ['Automatic', 'Manual'];
  const bodyTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'];
  const regions = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const SORT_ORDERS = {
    'newly-listed': '',
    'old-to-new': 'Old',
    'price-low': 'PriceLow',
    'price-high': 'PriceHigh',
    'mileage-low': 'MileageLow',
    'mileage-high': 'MileageHigh'
  };

  const formatMileage = (mileage) => `${mileage} km/h`;
  const formatCarDetails = (transmission, mileage) => `${transmission} • ${formatMileage(mileage)}`;
  
  const generateCarSlug = (car) => {
    return `${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        let apiUrl = `${API_BASE_URL}${DEALER_API_ENDPOINT}?getlistings=1`;
        
        if (maxPrice) {
          apiUrl += `&Max-price=${maxPrice}`;
        } else {
          apiUrl += '&Max-price=7000000'; 
        }
        
        if (make) apiUrl += `&Makes=${make}`;
        if (model) apiUrl += `&Models=${model}`;
        if (selectedYear) apiUrl += `&MinYear=${selectedYear}&MaxYear=${selectedYear}`;
        if (selectedTransmission) apiUrl += `&transmission=${selectedTransmission}`;
        if (selectedBodyType) apiUrl += `&bodytype=${selectedBodyType}`;
        if (selectedRegion) apiUrl += `&Region=${selectedRegion}`;
        
        apiUrl += `&sortorder=${SORT_ORDERS[sortOrder]}`;
        apiUrl += `&page=${page}`;
        apiUrl += `&dealershipname=`;
        apiUrl += `&sortorder=Used`;

        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.listings) {
          setCars(response.data.listings);
          setTotalPages(response.data.total_pages || 1);
        } else {
          setCars([]);
          setTotalPages(1);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch car data');
        console.error('API Error:', err);
      }
      setLoading(false);
    };

    fetchCars();
  }, [make, model, page, selectedYear, selectedTransmission, selectedBodyType, selectedRegion, sortOrder, maxPrice]);

  useEffect(() => {
    if (make && !model) {
      const searchParams = new URLSearchParams(location.search); 
      searchParams.delete('model');
      navigate(`/cars-for-sale?${searchParams.toString()}`);
    }
  }, [make, model, location.search, navigate]);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScroll();
  }, [availableModels, checkScroll]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleFilterChange = (filterType, value) => {
    setPage(1);
    const searchParams = new URLSearchParams(location.search);

    switch (filterType) {
      case 'bodytype':
        setSelectedBodyType(value);
        if (value) {
          searchParams.set('bodytype', value);
        } else {
          searchParams.delete('bodytype');
        }
        break;
      case 'year':
        setSelectedYear(value);
        break;
      case 'transmission':
        setSelectedTransmission(value);
        break;
      case 'region':
        setSelectedRegion(value);
        break;
      case 'sort':
        setSortOrder(value);
        break;
      default:
        break;
    }

    navigate(`/cars-for-sale?${searchParams.toString()}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;

  const pageTitle = make ? `Used ${make} Cars for Sale` : 'Cars for Sale';

  return (
    <div className="inventory-page">
      <main className="inventory-content">
        <h1 className="inventory-title">{pageTitle}</h1>
        
        <div className="filters-sort-container">
          <div className="sort-options">
            <button
              className={`sort-option ${sortOrder === 'newly-listed' ? 'active' : ''}`}
              onClick={() => handleFilterChange('sort', 'newly-listed')}
            >
              Newly Listed
            </button>
            <button
              className={`sort-option ${sortOrder === 'price-low' ? 'active' : ''}`}
              onClick={() => handleFilterChange('sort', 'price-low')}
            >
              Price low to high
            </button>
            <button
              className={`sort-option ${sortOrder === 'price-high' ? 'active' : ''}`}
              onClick={() => handleFilterChange('sort', 'price-high')}
            >
              Price high to low
            </button>
            <button
              className={`sort-option ${sortOrder === 'mileage-low' ? 'active' : ''}`}
              onClick={() => handleFilterChange('sort', 'mileage-low')}
            >
              Mileage low to high
            </button>
          </div>

          <div className="filter-dropdowns">
            <div className="filter-dropdown">
              <select
                value={selectedBodyType}
                onChange={(e) => handleFilterChange('bodytype', e.target.value)}
                className="filter-select"
              >
                <option value="">Body Type</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-dropdown">
              <select
                value={selectedTransmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                className="filter-select"
              >
                <option value="">Transmission</option>
                {transmissions.map((transmission) => (
                  <option key={transmission} value={transmission}>{transmission}</option>
                ))}
              </select>
            </div>

            <div className="filter-dropdown">
              <select
                value={selectedYear}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="filter-select"
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-dropdown">
              <select
                value={selectedRegion}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="filter-select"
              >
                <option value="">Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="car-grid">
          {cars.map((car) => (
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
                    {car.price}
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

        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination">
              {page > 1 && (
                <button onClick={() => handlePageChange(page - 1)}>Previous</button>
              )}
              <span>Page {page} of {totalPages}</span>
              {page < totalPages && (
                <button onClick={() => handlePageChange(page + 1)}>Next</button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InventoryPage;
