import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import './FindDealerPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const DEALERS_API_ENDPOINT = process.env.REACT_APP_DEALERS_API_ENDPOINT;

export default function FindDealerPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  // Fetch dealers based on selected region
  const fetchDealers = async (region = '') => {
    setLoading(true);
    try {
      const endpoint = `${API_BASE_URL}${DEALERS_API_ENDPOINT}?getdealers=1${
        region ? `&Region=${encodeURIComponent(region)}` : ''
      }`;
      
      const response = await axios.get(endpoint);
      
      if (response.data && response.data.listings) {
        const dealersList = Array.isArray(response.data.listings) 
          ? response.data.listings 
          : [response.data.listings];
        setDealers(dealersList);
        
        // If there's a search term, filter immediately
        if (searchTerm) {
          filterDealersBySearchTerm(searchTerm, dealersList);
        }
      } else {
        setDealers([]);
        setFilteredDealers([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch dealers');
      console.error('Error fetching dealers:', err);
      setDealers([]);
      setFilteredDealers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter dealers based on search term
  const filterDealersBySearchTerm = (term, dealersList = dealers) => {
    if (!term) {
      setFilteredDealers([]);
      setShowSuggestions(false);
      return;
    }

    const searchTermLower = term.toLowerCase();
    const filtered = dealersList.filter((dealer) =>
      dealer.dealershipname?.toLowerCase().startsWith(searchTermLower)
    );

    setFilteredDealers(filtered);
    setShowSuggestions(true);
  };

  // Debounced version of filter function
  const debouncedFilter = useCallback(
    debounce((term) => filterDealersBySearchTerm(term), 300),
    [dealers]
  );

  // Initial fetch of dealers
  useEffect(() => {
    fetchDealers();
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedFilter(term);
  };

  const handleRegionSelect = async (region) => {
    const newRegion = region === selectedRegion ? '' : region;
    setSelectedRegion(newRegion);
    setSearchTerm(''); // Clear search term when changing region
    await fetchDealers(newRegion);
  };

  const handleDealerSelect = (dealer) => {
    setSearchTerm(dealer.dealershipname);
    setShowSuggestions(false);
    const dealerSlug = dealer.dealershipname.toLowerCase().replace(/\s+/g, '-');
    navigate(`/car-dealership/${dealerSlug}`, { state: { dealerInfo: dealer } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    if (filteredDealers.length > 0) {
      const matchingDealer = filteredDealers.find(
        dealer => dealer.dealershipname.toLowerCase() === searchTerm.toLowerCase()
      );
      if (matchingDealer) {
        handleDealerSelect(matchingDealer);
      }
    }
  };

  return (
    <div className="find-dealer-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find a Dealer</h1>
          <p className="hero-subtitle">Search for authorized car dealers near you</p>
          <div className="search-container">
            <form onSubmit={handleSubmit} className="dealer-search-bar">
              <div className="search-content">
                <div className="search-bar-content">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search for dealers..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => {
                        if (searchTerm) setShowSuggestions(true);
                      }}
                    />
                  </div>
                </div>
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {showSuggestions && (
              <div className="dealer-suggestions">
                {loading && <div className="dealer-suggestions-loading">Loading dealers...</div>}
                {error && <div className="dealer-suggestions-error">{error}</div>}
                {!loading && !error && filteredDealers.length > 0 ? (
                  filteredDealers.map((dealer) => (
                    <div
                      key={dealer.DealerID}
                      className="dealer-suggestion-item"
                      onClick={() => handleDealerSelect(dealer)}
                    >
                      <div className="dealer-suggestion-name">
                        {dealer.dealershipname} <span className="dealer-count">({dealer.total || 0})</span>
                      </div>
                      <div className="dealer-suggestion-location">{dealer.region}</div>
                    </div>
                  ))
                ) : (
                  !loading && searchTerm && <div className="no-results">No dealers found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-container">
        <div className="form-section">
          <h2 className="form-section-header">Filter Dealers by Province</h2>
          <div className="province-buttons">
            {provinces.map((province) => (
              <button
                key={province}
                className={`province-button ${selectedRegion === province ? 'active' : ''}`}
                onClick={() => handleRegionSelect(province)}
                type="button"
              >
                {province}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}