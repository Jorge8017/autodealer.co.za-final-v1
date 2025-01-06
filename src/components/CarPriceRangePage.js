import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car } from 'lucide-react';
import './CarPriceRangePage.css';

export default function CarPriceRangePage() {
  const navigate = useNavigate();
  
  const pageTitle = 'Cars for Sale in South Africa | AutoDealer';
  const pageDescription = 'Browse top-selling car brands and affordable cars in South Africa. Find quality used cars in your price range.';
  
  const brands = [
    {
      id: 'toyota',
      name: 'Toyota Cars',
      logo: '/brand-logos/toyota-logo.svg',
      price: 'View All Toyota Cars'
    },
    {
      id: 'volkswagen',
      name: 'Volkswagen Cars',
      logo: '/brand-logos/vw-logo.svg',
      price: 'View All Volkswagen Cars'
    },
    {
      id: 'suzuki',
      name: 'Suzuki Cars',
      logo: '/brand-logos/suzuki-logo.svg',
      price: 'View All Suzuki Cars'
    },
    {
      id: 'hyundai',
      name: 'Hyundai Cars',
      logo: '/brand-logos/hyundai-logo.svg',
      price: 'View All Hyundai Cars'
    }
  ];

  const priceRanges = [
    {
      id: 'under-20000',
      label: '≤ R20,000',
      description: 'Cars under R20,000',
      maxPrice: '20000'
    },
    {
      id: 'under-30000',
      label: '≤ R30,000',
      description: 'Cars under R30,000',
      maxPrice: '30000'
    },
    {
      id: 'under-50000',
      label: '≤ R50,000',
      description: 'Cars under R50,000',
      maxPrice: '50000'
    },
    {
      id: 'under-70000',
      label: '≤ R70,000',
      description: 'Cars under R70,000',
      maxPrice: '70000'
    },
    {
      id: 'under-100000',
      label: '≤ R100,000',
      description: 'Cars under R100,000',
      maxPrice: '100000'
    }
  ];

  const handlePriceCardClick = (range) => {
    navigate(`/cars-for-sale?max-price=${range.maxPrice}`);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="price-range-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Cars For Sale In South Africa</span>
        </div>

        <h1 className="page-title">Cars for sale in South Africa</h1>

        <section>
          <h2 className="section-title">Top-Selling Car Brands</h2>
          <div className="brand-grid">
            {brands.map(brand => (
              <Link 
                to={`/cars-for-sale?make=${brand.id}`} 
                key={brand.id} 
                className="brand-card"
              >
                <img src={brand.logo} alt={brand.name} className="brand-logo" />
                <h3 className="brand-name">{brand.name}</h3>
                <p className="price-from">{brand.price}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">All Cars from Under R20,000</h2>
          <div className="price-grid">
            {priceRanges.map(range => (
              <div key={range.id} className="price-card">
                <Car className="price-icon" />
                <h3 className="price-label">{range.label}</h3>
                <p className="price-description">{range.description}</p>
                <button
                  className="available-deals-button"
                  onClick={() => handlePriceCardClick(range)}
                >
                  Available Deals
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}