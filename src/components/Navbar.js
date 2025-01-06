import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { useRegion } from '../contexts/RegionContext';
import { Search, ChevronDown } from 'lucide-react';
import lightLogo from '../assets/images/autodealer-logo-light.png';
import darkLogo from '../assets/images/autodealer-logo-dark.png';
import './Navbar.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const APP_API_ENDPOINT = process.env.REACT_APP_APP_API_ENDPOINT;

const Navbar = () => {
  const { theme } = useContext(ThemeContext);
  const { selectedRegion, updateRegion } = useRegion();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [makeSuggestions, setMakeSuggestions] = useState([]);
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [regions, setRegions] = useState(['Region']);

  const logo = theme === 'light' ? lightLogo : darkLogo;

  // Fetch makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${APP_API_ENDPOINT}?getmakes`);
        const makesData = response.data;
        if (Array.isArray(makesData)) {
          setMakeSuggestions(makesData);
        } else {
          console.error("Unexpected data format from 'getmakes':", makesData);
        }
      } catch (error) {
        console.error('Error fetching car makes:', error);
      }
    };
    fetchMakes();
  }, []);
  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${APP_API_ENDPOINT}?getregions=1`);
        const defaultRegions = [
          'Region',
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
        if (response.data && Array.isArray(response.data)) {
          setRegions(['Region', ...response.data]);
        } else {
          setRegions(defaultRegions);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        setRegions([
          'Region',
          'Eastern Cape',
          'Free State',
          'Gauteng',
          'Kwazulu-Natal',
          'Limpopo',
          'Mpumalanga',
          'Northern Cape',
          'North West',
          'Western Cape'
        ]);
      }
    };
    fetchRegions();
  }, []);

  // Fetch models when make is selected
  useEffect(() => {
    const makeTag = selectedTags.find(tag => tag.type === 'make');
    if (makeTag) {
      fetchModels(makeTag.id);
    }
  }, [selectedTags]);

  const fetchModels = async (makeId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${APP_API_ENDPOINT}?getranges=1&ID=${makeId}`
      );
      const modelsData = response.data;
      if (Array.isArray(modelsData)) {
        setModelSuggestions(modelsData);
      } else {
        console.error("Unexpected data format from 'getranges':", modelsData);
      }
    } catch (error) {
      console.error('Error fetching car models:', error);
    }
  };

  // Update suggestions based on search term
  useEffect(() => {
    if (searchTerm) {
      if (!selectedTags.some(tag => tag.type === 'make')) {
        setFilteredSuggestions(
          makeSuggestions.filter(make =>
            make.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredSuggestions(
          modelSuggestions.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchTerm, makeSuggestions, modelSuggestions, selectedTags]);

  const isActive = (path) => {
    if (path === '/cars-for-sale') {
      return location.pathname.startsWith('/cars-for-sale') || location.pathname.startsWith('/car-for-sale') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = () => {
    const makeTag = selectedTags.find(tag => tag.type === 'make');
    const modelTag = selectedTags.find(tag => tag.type === 'model');

    let searchUrl = '/cars-for-sale';
    let params = new URLSearchParams();

    if (makeTag) {
      params.append('make', makeTag.name);
      if (modelTag) {
        params.append('model', modelTag.name);
      }
    }

    if (selectedRegion !== 'Region') {
      params.append('region', selectedRegion);
    }

    if (params.toString()) {
      searchUrl += `?${params.toString()}`;
    }

    navigate(searchUrl);
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm && !selectedTags.find(tag => tag.name.toLowerCase() === searchTerm.trim().toLowerCase())) {
        const matchedMake = makeSuggestions.find(make =>
          make.name.toLowerCase() === searchTerm.trim().toLowerCase()
        );
        const matchedModel = modelSuggestions.find(model =>
          model.name.toLowerCase() === searchTerm.trim().toLowerCase()
        );

        if (matchedMake) {
          setSelectedTags([...selectedTags, { ...matchedMake, type: 'make' }]);
          setSearchTerm('');
        } else if (matchedModel && selectedTags.some(tag => tag.type === 'make')) {
          setSelectedTags([...selectedTags, { ...matchedModel, type: 'model' }]);
          setSearchTerm('');
        }
      } else if (selectedTags.length > 0) {
        handleSearch();
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!selectedTags.find(tag => tag.name.toLowerCase() === suggestion.name.toLowerCase())) {
      if (!selectedTags.some(tag => tag.type === 'make')) {
        setSelectedTags([...selectedTags, { ...suggestion, type: 'make' }]);
      } else {
        setSelectedTags([...selectedTags, { ...suggestion, type: 'model' }]);
      }
      setSearchTerm('');
    }
  };

  const removeTag = (type) => {
    setSelectedTags(selectedTags.filter(tag => tag.type !== type));
    if (type === 'make') {
      setModelSuggestions([]);
    }
  };

  const handleRegionChange = (e) => {
    const newRegion = e.target.value;
    updateRegion(newRegion);

    // Update URL with region parameter
    const searchParams = new URLSearchParams(location.search);
    if (newRegion !== 'Region') {
      searchParams.set('region', newRegion);
    } else {
      searchParams.delete('region');
    }

    // Navigate to the same page with updated region parameter
    const newSearch = searchParams.toString();
    navigate({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : ''
    });
  };
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logo} alt="Auto Dealer Logo" className="logo-image" />
        </Link>

        <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/cars-for-sale" className={isActive('/cars-for-sale')}>Buy a Car</Link>
            <Link to="/sell-car" className={isActive('/sell-car')}>Sell a Car</Link>
            <Link to="/find-dealer" className={isActive('/find-dealer')}>Find a Dealer</Link>
          </nav>

          <div className="search-section">
            <div className="search-bar">
              <div className="region-select-container">
                <select
                  className="region-select"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  aria-label="Select region"
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="region-select-arrow" />
              </div>

              <div className="search-content">
                <div className="search-bar-content">
                  <div className="tags">
                    {selectedTags.map(tag => (
                      <span key={tag.id} className="tag">
                        {tag.name}
                        <button
                          onClick={() => removeTag(tag.type)}
                          className="tag-close"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="search-input-wrapper">
                    {selectedTags.length < 2 && <input
                      type="text"
                      placeholder="What are you looking for?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />}
                  </div>
                </div>
                <button className="search-button" onClick={handleSearch}>
                  <Search size={20} />
                </button>
              </div>
            </div>

            {filteredSuggestions.length > 0 && (
              <div className="suggestion-list">
                {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;