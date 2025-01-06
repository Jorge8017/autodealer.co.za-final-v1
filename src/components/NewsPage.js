import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import './NewsPage.css';

const CONTENT_API_URL = process.env.REACT_APP_CONTENT_API_URL;

export default function NewsPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${CONTENT_API_URL}/wp-json/wp/v2/posts/${articleId}?_embed`);
        setArticle(response.data);
      } catch (err) {
        setError('Failed to fetch article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const formatArticleDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">{error}</div>;
  if (!article) return <div className="error-state">Article not found</div>;

  return (
    <div className="news-page">
      <article className="article-content">
        <header className="article-header">
          {article._embedded?.['wp:featuredmedia']?.[0] && (
            <div className="featured-image-container">
              <img
                src={article._embedded['wp:featuredmedia'][0].source_url}
                alt={article.title.rendered}
                className="featured-image"
              />
            </div>
          )}
          <div className="article-meta">
            <span className="article-date">{formatArticleDate(article.date)}</span>
          </div>
          <h1 
            className="article-title"
            dangerouslySetInnerHTML={{ __html: article.title.rendered }}
          />
        </header>
        
        <div 
          className="article-body"
          dangerouslySetInnerHTML={{ __html: article.content.rendered }}
        />
      </article>
    </div>
  );
}