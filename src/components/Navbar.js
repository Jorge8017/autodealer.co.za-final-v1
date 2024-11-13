import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import lightLogo from '../assets/images/autodealer-logo-light.png';
import darkLogo from '../assets/images/autodealer-logo-dark.png';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [makeSuggestions, setMakeSuggestions] = useState([]);
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const logo = theme === 'light' ? lightLogo : darkLogo;

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Fetch makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await axios.get('https://dealer.carmag.co.za/app/ajax.php?getmakes');
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

  // Fetch models based on selected make ID
  useEffect(() => {
    const makeTag = selectedTags.find(tag => tag.type === 'make');
    if (makeTag) {
      fetchModels(makeTag.id);
    }
  }, [selectedTags]);

  const fetchModels = async (makeId) => {
    try {
      const response = await axios.get(
        `https://dealer.carmag.co.za/app/ajax.php?getranges=1&ID=${makeId}`
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

  const handleSearch = () => {
    const makeTag = selectedTags.find(tag => tag.type === 'make');
    const modelTag = selectedTags.find(tag => tag.type === 'model');
    
    let searchUrl = '/cars-for-sale';
    
    if (makeTag) {
      searchUrl += `?make=${encodeURIComponent(makeTag.name)}`;
      if (modelTag) {
        searchUrl += `&model=${encodeURIComponent(modelTag.name)}`;
      }
    }

    navigate(searchUrl);
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm && !selectedTags.find(tag => tag.name.toLowerCase() === searchTerm.trim().toLowerCase())) {
        const matchedMake = makeSuggestions.find(make => make.name.toLowerCase() === searchTerm.trim().toLowerCase());
        const matchedModel = modelSuggestions.find(model => model.name.toLowerCase() === searchTerm.trim().toLowerCase());

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

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src={logo} alt="Auto Dealer Logo" className="logo-image" />
        </Link>

        <div className="mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-links">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/cars-for-sale" className={isActive('/cars-for-sale')}>Buy a Car</Link>
            <Link to="/sell-car" className={`btn-primary ${isActive('/sell-car')}`}>Sell a Car</Link>
          </nav>

          <div className="search-section">
            <div className="search-bar">
              <div className="search-bar-content">
                <div className="tags">
                  {selectedTags.map(tag => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                      <button onClick={() => removeTag(tag.type)} className="tag-close">×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={selectedTags.length === 0 ? 'Search for cars by make...' : 'Enter model...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={selectedTags.length >= 2}
                />
              </div>
              <button className="search-button" onClick={handleSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
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

          <button
            onClick={toggleTheme}
            className="theme-toggle-button"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={20} className="theme-icon" />
            ) : (
              <Sun size={20} className="theme-icon" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;