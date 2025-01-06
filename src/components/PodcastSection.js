import React, { useState } from 'react';
import VideoModal from './VideoModal';
import truBruLogo from '../assets/images/tru-bru-logo.png';

const PodcastSection = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const episodes = [
    {
      id: 1,
      title: "Rise of the RSi",
      videoId: "nOrhKNBgzTk",
    },
    {
      id: 2,
      title: "Full 90 Minute Update",
      image: "/path-to-image2.jpg",
    },
    {
      id: 3,
      title: "Latest Updates",
      image: "/path-to-image3.jpg",
    }
  ];

  return (
    <section className="podcast-section">
      <div className="podcast-container">
        <h2 className="podcast-title">Latest episodes</h2>
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
          
          <div className="podcast-card" onClick={() => setIsVideoModalOpen(true)}>
            <div className="podcast-image-container video-card">
              <img 
                src={`https://img.youtube.com/vi/nOrhKNBgzTk/hqdefault.jpg`}
                alt={episodes[0].title}
              />
              <div className="video-play-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                </svg>
              </div>
              <div className="podcast-content">
                <h3>{episodes[0].title}</h3>
                <p>{episodes[0].description}</p>
              </div>
            </div>
          </div>

          {episodes.slice(1).map((episode) => (
            <div key={episode.id} className="podcast-card">
              <div className="podcast-image-container">
                <img src={episode.image} alt={episode.title} />
                <div className="podcast-content">
                  <h3>{episode.title}</h3>
                  <p>{episode.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="nOrhKNBgzTk"
      />
    </section>
  );
};

export default PodcastSection;
