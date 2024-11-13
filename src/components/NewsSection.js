import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewSection.css';

const NewSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          'https://content.hsmdns.co.za/wp-json/wp/v2/posts/?categories=5&per_page=10'
        );
        setArticles(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news articles');
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleNext = () => {
    if (currentIndex < articles.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) return <div>Loading news...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="news-section">
      <div className="news-container">
        <h2 className="news-title">Latest car news</h2>
        <div className="news-grid">
          {articles.slice(currentIndex, currentIndex + 3).map((article) => (
            <article key={article.id} className="news-card">
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="news-card-link"
              >
                {article.featured_media && (
                  <div className="news-image-container">
                    <img
                      src={article._embedded?.['wp:featuredmedia']?.[0]?.source_url}
                      alt={article.title.rendered}
                      className="news-image"
                    />
                  </div>
                )}
                <div className="news-content">
                  <h3 
                    className="news-card-title"
                    dangerouslySetInnerHTML={{ __html: article.title.rendered }}
                  />
                  <span className="news-date">{formatDate(article.date)}</span>
                </div>
              </a>
            </article>
          ))}
        </div>
        
        <div className="news-navigation">
          <button 
            onClick={handlePrev} 
            className="nav-button prev"
            disabled={currentIndex === 0}
          >
            ‹
          </button>
          <button 
            onClick={handleNext} 
            className="nav-button next"
            disabled={currentIndex >= articles.length - 3}
          >
            ›
          </button>
        </div>

        <div className="news-footer">
          <button className="view-more-news">
            View more car news
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewSection;