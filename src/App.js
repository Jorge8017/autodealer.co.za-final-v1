import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import InventoryPage from './components/InventoryPage';
import CarDetailPage from './components/CarDetailPage';
import PhotoGalleryPage from './components/PhotoGalleryPage';
import SellCarPage from './components/SellCarPage';
import { SiteFooter } from './components/SiteFooter';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-wrapper">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cars-for-sale" element={<InventoryPage />} />
              <Route path="/car-for-sale/:carSlug/:id" element={<CarDetailPage />} />
              <Route path="/car-for-sale/:id/photos" element={<PhotoGalleryPage />} />
              <Route path="/sell-car" element={<SellCarPage />} />
            </Routes>
          </main>
          <SiteFooter />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;