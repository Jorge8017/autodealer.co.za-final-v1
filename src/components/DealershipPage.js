import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { formatPriceZAR } from '../utils';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import './DealershipPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DEALER_API_ENDPOINT = process.env.REACT_APP_DEALER_API_ENDPOINT;
const FEATURED_API_ENDPOINT = process.env.REACT_APP_FEATURED_API_ENDPOINT;

export default function DealershipPage() {
  const { dealershipSlug } = useParams();
  const location = useLocation();
  const dealerInfo = location.state?.dealerInfo;
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('New');
  const [selectedBodyType, setSelectedBodyType] = useState('');

  // Fetch dealer's cars
  useEffect(() => {
    const fetchDealerCars = async () => {
      setLoading(true);
      try {
        if (!dealerInfo?.dealershipname) {
          throw new Error('Dealer information not found');
        }

        let apiUrl = `${API_BASE_URL}${DEALER_API_ENDPOINT}?getlistings=1&Min-price=10000&Max-price=7000000&dealershipname=${encodeURIComponent(dealerInfo.dealershipname)}&sortorder=${sortOrder}`;
        
        if (selectedBodyType) {
          apiUrl += `&bodytype=${encodeURIComponent(selectedBodyType)}`;
        }
        
        apiUrl += `&page=${page}`;

        const response = await axios.get(apiUrl);
        
        if (response.data.listings) {
          setCars(response.data.listings);
          setTotalPages(response.data.total_pages || 1);
        } else {
          setCars([]);
          setTotalPages(1);
        }
      } catch (err) {
        setError('Failed to fetch cars');
        console.error('Error:', err);
      }
      setLoading(false);
    };

    fetchDealerCars();
  }, [dealerInfo, page, sortOrder, selectedBodyType]);

  const formatMileage = (mileage) => {
    return `${mileage}km/h`;
  };

  const formatCarDetails = (transmission, mileage) => {
    return `${transmission} • ${formatMileage(mileage)}`;
  };

  const generateCarSlug = (car) => {
    return `${car.year}-${car.make}-${car.model}-${car.region}-${car.city}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setPage(1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;
  if (!dealerInfo) return <div className="error-state">Dealer not found</div>;

  const formattedDealerName = dealerInfo.dealershipname.replace(/^(.*?)\s*-\s*.*$/, '$1');

  return (
    <div className="inventory-page">
      <main className="inventory-content">
        <div className="dealer-header">
          <h1 className="inventory-title">New & Used Cars For Sale by {formattedDealerName}</h1>
        </div>

        <div className="filters-sort-container">
          <div className="sort-options">
            <button
              className={`sort-option ${sortOrder === 'New' ? 'active' : ''}`}
              onClick={() => handleSortChange('New')}
            >
              Newly Listed
            </button>
            <button
              className={`sort-option ${sortOrder === 'PriceLow' ? 'active' : ''}`}
              onClick={() => handleSortChange('PriceLow')}
            >
              Price low to high
            </button>
            <button
              className={`sort-option ${sortOrder === 'PriceHigh' ? 'active' : ''}`}
              onClick={() => handleSortChange('PriceHigh')}
            >
              Price high to low
            </button>
          </div>

          <div className="filter-dropdowns">
            <div className="filter-dropdown">
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="filter-select"
              >
                <option value="">Body Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Bakkie">Bakkie</option>
                <option value="Coupe">Coupe</option>
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
}