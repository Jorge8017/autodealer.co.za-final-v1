import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { RegionProvider } from './contexts/RegionContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import InventoryPage from './components/InventoryPage';
import CarDetailPage from './components/CarDetailPage';
import PhotoGalleryPage from './components/PhotoGalleryPage';
import SellCarPage from './components/SellCarPage';
import DealershipPage from './components/DealershipPage';
import CarPriceRangePage from './components/CarPriceRangePage';
import NewsPage from './components/NewsPage';
import { SiteFooter } from './components/SiteFooter';
import FindDealerPage from './components/FindDealerPage';
import { trackPageView } from './services/analytics';
import './App.css';

function AnalyticsWrapper() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location]);

  return null;
}

function AppContent() {
  return (
    <>
      <AnalyticsWrapper />
      <Navbar />
      <main className="main-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cars-for-sale" element={<InventoryPage />} />
          <Route path="/car-for-sale/:carSlug/:id" element={<CarDetailPage />} />
          <Route path="/car-for-sale/:id/photos" element={<PhotoGalleryPage />} />
          <Route path="/sell-car" element={<SellCarPage />} />
          <Route path="/find-dealer" element={<FindDealerPage />} />
          <Route path="/car-dealership/:dealershipSlug" element={<DealershipPage />} />
          <Route path="/cars-from-price/:minPrice" element={<CarPriceRangePage />} />
          <Route path="/news/:articleId" element={<NewsPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Router>
          <RegionProvider>
            <div className="app-container">
              <AppContent />
            </div>
          </RegionProvider>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
