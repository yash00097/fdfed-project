import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [eligiblePurchases, setEligiblePurchases] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [filterRating, setFilterRating] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [reviewsToShow, setReviewsToShow] = useState(4);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Fetch all reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:3000/backend/reviews');
        if (response.data.success) {
          setReviews(response.data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  // Fetch eligible purchases if user is logged in
  useEffect(() => {
    const fetchEligiblePurchases = async () => {
      if (!currentUser) return;

      try {
        const response = await axios.get('http://localhost:3000/backend/reviews/eligible', {
          withCredentials: true
        });
        if (response.data.success) {
          setEligiblePurchases(response.data.purchases);
          setCanReview(response.data.canReview);
        }
      } catch (error) {
        console.error('Error fetching eligible purchases:', error);
      }
    };

    fetchEligiblePurchases();
  }, [currentUser]);

  const handleAddReview = () => {
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/backend/reviews/${reviewId}`, {
        withCredentials: true
      });
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleReviewSubmitted = (newReview) => {
    if (editingReview) {
      setReviews(reviews.map(r => r._id === newReview._id ? newReview : r));
    } else {
      setReviews([newReview, ...reviews]);
      setCanReview(false);
    }
    setShowReviewModal(false);
    setEditingReview(null);
  };

  // Get unique brands from reviews
  const uniqueBrands = [...new Set(reviews.map(review => review.car?.brand).filter(Boolean))].sort();

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      const ratingMatch = filterRating === 'all' || review.rating === parseInt(filterRating);
      const brandMatch = filterBrand === 'all' || review.car?.brand === filterBrand;
      return ratingMatch && brandMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  // Get reviews to display with pagination
  const displayedReviews = filteredAndSortedReviews.slice(0, reviewsToShow);

  const handleViewMore = () => {
    setReviewsToShow(prev => prev + 4);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <style>{`
        .reviews-page-container {
          min-height: 100vh;
          background: radial-gradient(ellipse at center, rgba(60, 40, 35, 0.8) 0%, rgba(30, 20, 18, 0.95) 50%, rgba(10, 8, 7, 1) 100%), linear-gradient(180deg, #0a0807 0%, #1e1412 50%, #0a0807 100%);
          padding: 100px 20px 60px 20px;
        }

        .reviews-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .reviews-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
        }

        .reviews-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
        }

        .controls-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(30, 30, 30, 0.5);
          border-radius: 15px;
          border: 1px solid rgba(255, 78, 80, 0.2);
        }

        .filter-group {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .filter-select {
          padding: 10px 15px;
          border-radius: 10px;
          border: 2px solid rgba(255, 78, 80, 0.3);
          background: rgba(20, 20, 25, 0.8);
          color: #f5f5f5;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #ff4e50;
          box-shadow: 0 0 0 3px rgba(255, 78, 80, 0.15);
        }

        .filter-select:hover {
          border-color: #ff4e50;
        }

        .reviews-count {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          font-weight: 600;
        }

        .back-button {
          padding: 10px 20px;
          background: rgba(255, 78, 80, 0.15);
          border: 2px solid rgba(255, 78, 80, 0.3);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .back-button:hover {
          background: rgba(255, 78, 80, 0.25);
          border-color: #ff4e50;
          transform: translateY(-2px);
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .no-reviews {
          text-align: center;
          padding: 80px 20px;
          background: rgba(30, 30, 30, 0.5);
          border-radius: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .no-reviews-icon {
          font-size: 5rem;
          margin-bottom: 20px;
        }

        .no-reviews-text {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .reviews-title {
            font-size: 2rem;
          }

          .controls-container {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select {
            width: 100%;
          }

          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="reviews-page-container">
        <div className="reviews-header">
          <motion.h1
            className="reviews-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Customer Reviews
          </motion.h1>
          <motion.p
            className="reviews-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real experiences from our valued customers
          </motion.p>
        </div>

        <div className="controls-container">
          <div className="filter-group">
            <button className="back-button" onClick={() => navigate('/about-us')}>
              ← Back to About
            </button>
          </div>

          <div className="filter-group">
            <span className="filter-label">Filter by Brand:</span>
            <select 
              className="filter-select"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Filter by Rating:</span>
            <select 
              className="filter-select"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort by:</span>
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <span className="reviews-count">
            {filteredAndSortedReviews.length} {filteredAndSortedReviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Add Review Button */}
        {currentUser && canReview && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.button
              onClick={handleAddReview}
              style={{
                background: 'linear-gradient(135deg, #ff4e50, #f9d423)',
                color: '#fff',
                border: 'none',
                padding: '14px 30px',
                borderRadius: '30px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(255, 78, 80, 0.3)',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 8px 20px rgba(255, 78, 80, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Add Your Review
            </motion.button>
            {eligiblePurchases.length > 0 && (
              <p style={{ 
                marginTop: '15px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem'
              }}>
                You have {eligiblePurchases.length} purchase(s) ready to review
              </p>
            )}
          </div>
        )}

        {loadingReviews ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
            <p style={{ fontSize: '1.2rem' }}>Loading reviews...</p>
          </div>
        ) : filteredAndSortedReviews.length > 0 ? (
          <>
            <motion.div
              className="reviews-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayedReviews.map((review) => (
                <motion.div key={review._id} variants={itemVariants}>
                  <ReviewCard
                    review={review}
                    isOwner={currentUser && review.user?._id === currentUser._id}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* View More Button */}
            {filteredAndSortedReviews.length > reviewsToShow && (
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <motion.button
                  onClick={handleViewMore}
                  style={{
                    background: 'linear-gradient(135deg, #ff4e50, #f9d423)',
                    border: 'none',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '30px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.4s ease',
                    boxShadow: '0 4px 20px rgba(255, 78, 80, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: '0 6px 30px rgba(255, 78, 80, 0.5)',
                    filter: 'brightness(1.1)'
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  View More Reviews
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>→</span>
                </motion.button>
                <p style={{ 
                  marginTop: '12px', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.9rem'
                }}>
                  Showing {displayedReviews.length} of {filteredAndSortedReviews.length} reviews
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="no-reviews">
            <div className="no-reviews-icon">🔍</div>
            <p className="no-reviews-text">
              {filterRating !== 'all' || filterBrand !== 'all'
                ? `No reviews found${filterBrand !== 'all' ? ` for ${filterBrand}` : ''}${filterRating !== 'all' ? ` with ${filterRating} stars` : ''}` 
                : 'No reviews yet'}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.95rem' }}>
              {filterRating !== 'all' || filterBrand !== 'all' ? 'Try changing the filters' : 'Be the first to share your experience!'}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        eligiblePurchases={eligiblePurchases}
        onReviewSubmitted={handleReviewSubmitted}
        editReview={editingReview}
      />
    </>
  );
}
