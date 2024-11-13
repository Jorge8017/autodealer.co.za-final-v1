import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatPriceZAR } from '../utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './InventoryPage.css';

const InventoryPage = () => {
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
  
  // State for filters
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortOrder, setSortOrder] = useState('newly-listed');

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';

  // Sort order constants
  const SORT_ORDERS = {
    'newly-listed': '',
    'old-to-new': 'Old',
    'price-low': 'PriceLow',
    'price-high': 'PriceHigh',
    'mileage-low': 'MileageLow',
    'mileage-high': 'MileageHigh'
  };

  // Options for filter dropdowns
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const transmissions = ['Automatic', 'Manual'];
  const bodyTypes = ['Sedan', 'SUV', 'Coupe', 'Wagon', 'Convertible'];
  const regions = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  // Check scroll capability
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Add scroll check whenever models change
  useEffect(() => {
    checkScroll();
  }, [availableModels]);

  // Add scroll event listener
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
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Function to get make ID from URL or another source
  const getMakeId = async (makeName) => {
    try {
      const response = await fetch('https://dealer.carmag.co.za/app/ajax.php?getmakes');
      const makes = await response.json();
      const makeInfo = makes.find(m => m.name.toLowerCase() === makeName.toLowerCase());
      return makeInfo?.id;
    } catch (error) {
      console.error('Error fetching makes:', error);
      return null;
    }
  };

  // Fetch models for specific make
  const fetchModelsForMake = async (makeId) => {
    if (!makeId) return;
    
    setLoadingModels(true);
    try {
      const response = await fetch(`https://dealer.carmag.co.za/app/ajax.php?getranges=1&ID=${makeId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAvailableModels(data);
      } else {
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Fetch models when make changes
  useEffect(() => {
    const initModels = async () => {
      if (make) {
        const makeId = await getMakeId(make);
        if (makeId) {
          await fetchModelsForMake(makeId);
        }
      } else {
        setAvailableModels([]);
      }
    };

    initModels();
  }, [make]);

  // Fetch cars data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let apiUrl = '';

        // If no filters are applied, use the default URL
        if (!make && !model && !selectedYear && !selectedTransmission && 
            !selectedBodyType && !selectedRegion) {
          apiUrl = 'https://dealer.carmag.co.za/autodealer-api-new.php?getlistings=1&Category=&Makes=&Models=&Variant=&Region=&City=&MinYear=&MaxYear=&Max-Mileage=&Min-price=&Max-price=7000000&bodytype=&Colour=&dealershipname=&sortorder=${SORT_ORDERS[sortOrder]}&page=${page}';
        } else {
          // If filters are applied, construct the URL with filters
          apiUrl = 'https://dealer.carmag.co.za/autodealer-api-new.php?getlistings=1';
          if (make) apiUrl += `&Makes=${make}`;
          if (model) apiUrl += `&Models=${model}`;
          if (selectedYear) apiUrl += `&MinYear=${selectedYear}&MaxYear=${selectedYear}`;
          if (selectedTransmission) apiUrl += `&transmission=${selectedTransmission}`;
          if (selectedBodyType) apiUrl += `&bodytype=${selectedBodyType}`;
          if (selectedRegion) apiUrl += `&Region=${selectedRegion}`;
          
          // Add sort order and default parameters
          apiUrl += `&sortorder=${SORT_ORDERS[sortOrder]}`;
          apiUrl += `&Max-price=7000000`;
          apiUrl += `&page=${page}`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.listings && Array.isArray(data.listings)) {
          setCars(data.listings);
          setTotalPages(data.total_pages || 1);
        } else {
          setCars([]);
          setTotalPages(1);
        }
      } catch (err) {
        setError('Failed to fetch car data');
      }
      setLoading(false);
    };

    fetchData();
  }, [make, model, page, selectedYear, selectedTransmission, selectedBodyType, selectedRegion, sortOrder]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (filterType, value) => {
    setPage(1);
    switch (filterType) {
      case 'year':
        setSelectedYear(value);
        break;
      case 'transmission':
        setSelectedTransmission(value);
        break;
      case 'bodyType':
        setSelectedBodyType(value);
        break;
      case 'region':
        setSelectedRegion(value);
        break;
      case 'sort':
        setSortOrder(value);
        break;
      case 'model':
        navigate(`/cars-for-sale?make=${make}&model=${value}`);
        break;
      default:
        break;
    }
  };

  const generateCarSlug = (car) => {
    return `${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  if (loading) return <div>Loading cars...</div>;
  if (error) return <div>{error}</div>;

  const pageTitle = make ? `Used ${make} Cars for Sale` : 'Cars for Sale';

  return (
    <div className="inventory-page">
      <main className="inventory-content">
        <h1 className="inventory-title">{pageTitle}</h1>
        
        {/* Model Filters */}
        {make && !loadingModels && availableModels.length > 0 && (
          <div className="model-filters">
            {canScrollLeft && (
              <button 
                className="scroll-button left"
                onClick={() => handleScroll('left')}
                aria-label="Scroll left"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            <div 
              className="model-filters-scroll"
              ref={scrollContainerRef}
              onScroll={checkScroll}
            >
              {availableModels.map((modelOption) => (
                <button
                  key={modelOption.id}
                  className={`model-filter-btn ${model === modelOption.name ? 'active' : ''}`}
                  onClick={() => handleFilterChange('model', modelOption.name)}
                >
                  {modelOption.name}
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button 
                className="scroll-button right"
                onClick={() => handleScroll('right')}
                aria-label="Scroll right"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}

        {/* Filter Dropdowns */}
        <div className="filter-dropdowns">
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

          <div className="filter-dropdown">
            <select
              value={selectedYear}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="filter-select"
            >
              <option value="">Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
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
              value={selectedBodyType}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="filter-select"
            >
              <option value="">Body Type</option>
              {bodyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="sort-options">
          <button
            className={`sort-option ${sortOrder === 'newly-listed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('sort', 'newly-listed')}
          >
            Newly Listed
          </button>
          <button
            className={`sort-option ${sortOrder === 'old-to-new' ? 'active' : ''}`}
            onClick={() => handleFilterChange('sort', 'old-to-new')}
          >
            Old to New
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
          <button
            className={`sort-option ${sortOrder === 'mileage-high' ? 'active' : ''}`}
            onClick={() => handleFilterChange('sort', 'mileage-high')}
          >
            Mileage high to low
          </button>
        </div>
        
        {/* Car Grid */}
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
                    {formatPriceZAR(car.price)}
                  </div>
                </div>
                <div className="car-info">
                  <div className="car-title">
                    {car.year} {car.make} {car.model}
                  </div>
                  <div className="car-details">
                    {`${car.km} • ${car.transmission}\n${car.city}, ${car.region}`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
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
      </main>
    </div>
  );
};

export default InventoryPage;