import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReviewCard from '../components/ReviewCard';
import ReviewModal from '../components/ReviewModal';

export default function About() {
  const [isVisible, setIsVisible] = useState({});
  const [reviews, setReviews] = useState([]);
  const [eligiblePurchases, setEligiblePurchases] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.observe-section');
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const handleAddReview = () => {
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await axios.delete(`http://localhost:3000/backend/reviews/${reviewId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setReviews(reviews.filter(r => r._id !== reviewId));
        alert('Review deleted successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleReviewSubmitted = (newReview) => {
    if (editingReview) {
      setReviews(reviews.map(r => r._id === newReview._id ? newReview : r));
    } else {
      setReviews([newReview, ...reviews]);
      setCanReview(false);
    }
  };

  const handleViewMore = () => {
    navigate('/reviews'); // Navigate directly to Reviews page
  };

  // Get reviews to display (show only 4 on About page)
  const displayedReviews = reviews.slice(0, 4);

  return (
    <>
      <style>{`
        /* About Page Styles */
        .about-container {
          background-color: #0a0a0a !important;
          color: #f5f5f5 !important;
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
          min-height: 100vh;
          width: 100%;
          margin: 0;
          padding: 0;
          position: relative;
        }

        .values-section, .how-it-works-section, .journey-section, .contact-section {
          background: rgba(15, 15, 15, 0.8);
          padding: 80px 20px;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 20px;
        }

        .section-title {
          font-size: 2.8rem;
          text-align: center;
          margin-bottom: 20px;
          color: #f5f5f5 !important;
          font-weight: 700;
        }

        .divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px auto 50px;
          width: 100%;
          max-width: 300px;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, rgba(255, 78, 80, 0), rgba(255, 78, 80, 0.6), rgba(255, 78, 80, 0));
        }

        .divider-icon {
          margin: 0 20px;
          font-size: 1.8rem;
          filter: drop-shadow(0 0 10px rgba(255, 78, 80, 0.5));
        }

        .highlight {
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 35px;
          margin-top: 50px;
        }

        .value-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 78, 80, 0.1);
        }

        .value-card:hover {
          transform: translateY(-15px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 78, 80, 0.3);
          border-color: rgba(255, 78, 80, 0.3);
        }

        .value-icon {
          font-size: 3.5rem;
          margin-bottom: 25px;
          filter: drop-shadow(0 0 10px rgba(255, 78, 80, 0.3));
        }

        .value-card h3 {
          font-size: 1.6rem;
          margin-bottom: 20px;
          color: #f5f5f5;
          font-weight: 600;
        }

        .value-card p {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 30px 0;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20px;
          font-size: 1.15rem;
        }

        .check-icon {
          color: #ff4e50;
          font-size: 1.5rem;
          margin-right: 18px;
          flex-shrink: 0;
          font-weight: bold;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 50px;
        }

        .process-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 20px;
          padding: 35px;
          text-align: center;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 78, 80, 0.1);
          position: relative;
          overflow: hidden;
        }

        .process-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #ff4e50, #f9d423);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .process-card:hover::before {
          transform: scaleX(1);
        }

        .process-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 15px 40px rgba(255, 78, 80, 0.3);
        }

        .process-number {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: 0 4px 15px rgba(255, 78, 80, 0.4);
        }

        .process-icon {
          font-size: 3rem;
          margin: 20px 0;
          filter: drop-shadow(0 0 10px rgba(255, 78, 80, 0.3));
        }

        .process-card h3 {
          font-size: 1.4rem;
          margin: 15px 0;
          color: #f5f5f5;
          font-weight: 600;
        }

        .process-card p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .timeline {
          position: relative;
          max-width: 900px;
          margin: 50px auto;
          padding: 30px 0;
        }

        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          background: linear-gradient(to bottom, rgba(255, 78, 80, 0.2), rgba(255, 78, 80, 0.6), rgba(255, 78, 80, 0.2));
          transform: translateX(-50%);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 60px;
          width: 100%;
        }

        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 25px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          border-radius: 50%;
          transform: translateX(-50%);
          z-index: 2;
          box-shadow: 0 0 20px rgba(255, 78, 80, 0.6);
          border: 3px solid #0a0a0a;
        }

        .timeline-content {
          position: relative;
          width: calc(50% - 50px);
          padding: 30px;
          background: rgba(30, 30, 30, 0.7);
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          transition: all 0.4s ease;
          border: 1px solid rgba(255, 78, 80, 0.1);
        }

        .timeline-content:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 35px rgba(255, 78, 80, 0.3);
        }

        .timeline-item:nth-child(odd) .timeline-content {
          margin-left: auto;
        }

        .timeline-item:nth-child(even) .timeline-content {
          margin-right: auto;
        }

        .timeline-content h3 {
          font-size: 1.6rem;
          margin-bottom: 15px;
          color: #ff4e50;
          font-weight: 600;
        }

        .timeline-content p {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.85);
        }

        .contact-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 35px;
          margin-top: 50px;
        }

        .contact-card {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 78, 80, 0.1);
        }

        .contact-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 78, 80, 0.3);
        }

        .contact-icon {
          font-size: 3rem;
          margin-bottom: 25px;
          filter: drop-shadow(0 0 10px rgba(255, 78, 80, 0.3));
        }

        .contact-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #f5f5f5;
          font-weight: 600;
        }

        .contact-link {
          color: #ff4e50;
          font-weight: 600;
          text-decoration: none;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .contact-link:hover {
          color: #f9d423;
          text-decoration: underline;
          transform: scale(1.05);
        }

        .contact-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
        }

        .footer {
          background: rgba(15, 15, 15, 0.95);
          padding: 60px 20px;
          text-align: center;
          border-top: 2px solid rgba(255, 78, 80, 0.2);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-logo {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }

        .footer-text {
          margin-bottom: 25px;
          opacity: 0.7;
          font-size: 1rem;
        }

        .footer-social {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-top: 20px;
        }

        .social-icon {
          font-size: 1.8rem;
          color: #f5f5f5;
          transition: all 0.3s ease;
          display: inline-block;
          text-decoration: none;
        }

        .social-icon:hover {
          transform: translateY(-8px) scale(1.2);
          color: #ff4e50;
          filter: drop-shadow(0 5px 15px rgba(255, 78, 80, 0.5));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .timeline::before { left: 30px; }
          .timeline-dot { left: 30px; }
          .timeline-content {
            width: calc(100% - 80px);
            margin-left: 60px !important;
          }
        }

        @media (max-width: 768px) {
          .section-title { font-size: 2rem; }
          .section-container { padding: 60px 20px; }
          .values-grid, .process-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 576px) {
          .section-title { font-size: 1.7rem; }
          .value-card, .contact-card, .process-card { padding: 25px; }
          .timeline-content {
            width: calc(100% - 50px);
            margin-left: 40px !important;
            padding: 20px;
          }
          .timeline::before { left: 20px; }
          .timeline-dot { left: 20px; width: 18px; height: 18px; }
        }
      `}</style>
      
      <div 
      className="about-container" 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#f5f5f5',
        padding: '0', 
        margin: '0',
        width: '100%',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(10, 10, 10, 0.98)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}
      >
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255, 78, 80, 0.15) 0%, rgba(10, 10, 10, 0) 70%)' }}></div>
        <motion.div
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ position: 'relative', zIndex: 2, padding: '0 20px', maxWidth: '900px' }}
        >
          <h1 className="main-title" style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '20px', color: '#f5f5f5', textTransform: 'uppercase' }}>
            About <span className="highlight" style={{ background: 'linear-gradient(135deg, #ff4e50, #f9d423)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Prime Wheels</span>
          </h1>
          <div className="divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto' }}>
            <span className="divider-icon" style={{ margin: '0 15px', fontSize: '1.8rem' }}>🚗</span>
          </div>
          <p className="hero-text" style={{ fontSize: '1.5rem', opacity: 0.9, color: '#f5f5f5' }}>Your trusted marketplace for premium pre-owned vehicles</p>
        </motion.div>
      </motion.div>

      {/* About Section */}
      <section className="about-section observe-section" id="about" style={{ padding: '80px 20px', backgroundColor: 'rgba(10, 10, 10, 1)' }}>
        <div className="section-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            className="content-card"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.about ? 'visible' : 'hidden'}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              background: 'rgba(30, 30, 30, 0.6)',
              borderRadius: '20px',
              overflow: 'hidden',
              padding: '40px',
              margin: '40px 0'
            }}
          >
            <motion.div className="card-content" variants={itemVariants} style={{ flex: 1, padding: '20px', color: '#f5f5f5' }}>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>
                Welcome to <strong style={{ color: '#ff4e50' }}>Prime Wheels</strong>, your trusted marketplace for high-quality pre-owned cars. 
                We are dedicated to providing a seamless and secure car buying & selling experience.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                Our platform connects buyers and sellers while ensuring every vehicle meets strict quality 
                standards through our professional agent verification system.
              </p>
            </motion.div>
            <motion.div className="card-image" variants={itemVariants} style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255, 78, 80, 0.15), rgba(249, 212, 35, 0.15))' }}>
              <div className="image-placeholder" style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)' }}>
                <i className="car-icon" style={{ fontSize: '5rem' }}>🏎️</i>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="reviews-section observe-section" id="reviews" style={{ padding: '80px 20px', background: 'radial-gradient(ellipse at center, rgba(60, 40, 35, 0.8) 0%, rgba(30, 20, 18, 0.95) 50%, rgba(10, 8, 7, 1) 100%), linear-gradient(180deg, #0a0807 0%, #1e1412 50%, #0a0807 100%)' }}>
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.reviews ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What Our Customers Say
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">💬</span>
          </div>

          {loadingReviews ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <motion.div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '30px',
                  marginTop: '40px'
                }}
                variants={containerVariants}
                initial="hidden"
                animate={isVisible.reviews ? 'visible' : 'hidden'}
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
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'rgba(30, 30, 30, 0.5)',
              borderRadius: '20px',
              marginTop: '40px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}

          {/* View All Reviews Button - Always visible if more than 4 reviews */}
          {reviews.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <motion.button
                onClick={handleViewMore}
                style={{
                  background: 'linear-gradient(135deg, #ff4e50, #f9d423)',
                  border: 'none',
                  color: '#fff',
                  padding: '16px 40px',
                  borderRadius: '30px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.4s ease',
                  boxShadow: '0 4px 20px rgba(255, 78, 80, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                whileHover={{ 
                  scale: 1.08,
                  boxShadow: '0 6px 30px rgba(255, 78, 80, 0.6)',
                  filter: 'brightness(1.15)'
                }}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                View All Reviews
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>→</span>
              </motion.button>
              <p style={{ 
                marginTop: '15px', 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '1rem',
                fontWeight: 500
              }}>
                Showing 4 of {reviews.length} reviews
              </p>
            </div>
          )}

          {/* Add/Edit Review Button */}
          {currentUser ? (
            canReview ? (
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
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
            ) : (
              <div style={{
                textAlign: 'center',
                marginTop: '40px',
                padding: '20px',
                background: 'rgba(30, 30, 30, 0.5)',
                borderRadius: '15px'
              }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  📦 Purchase a car to share your review!
                </p>
              </div>
            )
          ) : (
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              padding: '20px',
              background: 'rgba(30, 30, 30, 0.5)',
              borderRadius: '15px'
            }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Please <a href="/sign-in" style={{ color: '#ff4e50', textDecoration: 'none', fontWeight: 600 }}>sign in</a> to share your review
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section observe-section" id="values">
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.values ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Our Core Values
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">⭐</span>
          </div>

          <motion.div
            className="values-grid"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.values ? 'visible' : 'hidden'}
          >
            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-icon">🔍</div>
              <h3>Trust & Transparency</h3>
              <p>
                Every car is thoroughly inspected by certified agents to ensure quality and reliability. 
                Our verification process guarantees authenticity.
              </p>
            </motion.div>

            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-icon">💡</div>
              <h3>Customer-Centric Approach</h3>
              <p>
                We prioritize a hassle-free experience with personalized service at every step. 
                Your satisfaction is our top priority.
              </p>
            </motion.div>

            <motion.div className="value-card" variants={itemVariants}>
              <div className="value-icon">💰</div>
              <h3>Affordability & Quality</h3>
              <p>
                Competitive pricing without compromising on the quality and condition of our vehicles. 
                Fair deals for everyone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section observe-section" id="whychoose">
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.whychoose ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Why Choose <span className="highlight">Prime Wheels?</span>
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">✅</span>
          </div>

          <motion.div
            className="content-card reverse"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.whychoose ? 'visible' : 'hidden'}
          >
            <motion.div className="card-content" variants={itemVariants}>
              <p>We make buying and selling used cars effortless, safe, and reliable. Here's why we stand out:</p>
              <ul className="benefits-list">
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>A vast collection of certified, pre-owned vehicles</span>
                </li>
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Agent-verified car inspection (1-10 day verification process)</span>
                </li>
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Transparent pricing with zero hidden charges</span>
                </li>
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Secure transactions with verified sellers</span>
                </li>
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Easy car request system to find your dream vehicle</span>
                </li>
                <li className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Dedicated customer support for a seamless experience</span>
                </li>
              </ul>
            </motion.div>
            <motion.div className="card-image" variants={itemVariants}>
              <div className="image-placeholder">
                <i className="car-icon">🚙</i>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section observe-section" id="howitworks">
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.howitworks ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">⚙️</span>
          </div>

          <motion.div
            className="process-grid"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.howitworks ? 'visible' : 'hidden'}
          >
            <motion.div className="process-card" variants={itemVariants}>
              <div className="process-number">1</div>
              <div className="process-icon">📝</div>
              <h3>List Your Car</h3>
              <p>Sellers submit car details with photos. Our system handles everything securely.</p>
            </motion.div>

            <motion.div className="process-card" variants={itemVariants}>
              <div className="process-number">2</div>
              <div className="process-icon">🔍</div>
              <h3>Agent Verification</h3>
              <p>Certified agents inspect and verify your car within 1-10 days.</p>
            </motion.div>

            <motion.div className="process-card" variants={itemVariants}>
              <div className="process-number">3</div>
              <div className="process-icon">✅</div>
              <h3>Approval & Listing</h3>
              <p>Once approved, your car appears in our inventory for buyers to see.</p>
            </motion.div>

            <motion.div className="process-card" variants={itemVariants}>
              <div className="process-number">4</div>
              <div className="process-icon">🤝</div>
              <h3>Purchase & Delivery</h3>
              <p>Buyers complete secure purchases and receive their dream car.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="journey-section observe-section" id="journey">
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.journey ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Our Journey
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">🛣️</span>
          </div>

          <motion.div
            className="timeline"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.journey ? 'visible' : 'hidden'}
          >
            <motion.div className="timeline-item" variants={itemVariants}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>The Beginning</h3>
                <p>
                  Founded with the vision of transforming the second-hand car industry, <strong>Prime Wheels</strong> started 
                  with a mission to create a trustworthy platform for car transactions.
                </p>
              </div>
            </motion.div>

            <motion.div className="timeline-item" variants={itemVariants}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Innovation & Growth</h3>
                <p>
                  We introduced our unique agent verification system, ensuring every vehicle meets high-quality standards 
                  before listing.
                </p>
              </div>
            </motion.div>

            <motion.div className="timeline-item" variants={itemVariants}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h3>Today</h3>
                <p>
                  With a growing community of buyers, sellers, and verified agents, we're revolutionizing the used car 
                  marketplace with technology and trust.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section observe-section" id="contact">
        <div className="section-container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible.contact ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Get in Touch
          </motion.h2>
          <div className="divider">
            <span className="divider-icon">📞</span>
          </div>

          <motion.div
            className="contact-cards"
            variants={containerVariants}
            initial="hidden"
            animate={isVisible.contact ? 'visible' : 'hidden'}
          >
            <motion.div className="contact-card" variants={itemVariants}>
              <div className="contact-icon">✉️</div>
              <h3>Email Us</h3>
              <a href="mailto:support@primewheels.com" className="contact-link">
                support@primewheels.com
              </a>
            </motion.div>

            <motion.div className="contact-card" variants={itemVariants}>
              <div className="contact-icon">📱</div>
              <h3>Call Us</h3>
              <a href="tel:+919876543210" className="contact-link">
                +91 9876543210
              </a>
            </motion.div>

            <motion.div className="contact-card" variants={itemVariants}>
              <div className="contact-icon">💬</div>
              <h3>Live Chat</h3>
              <p>Available 24/7 for your queries</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="highlight">Prime Wheels</span>
          </div>
          <p className="footer-text">&copy; {new Date().getFullYear()} Prime Wheels. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Facebook">📱</a>
            <a href="#" className="social-icon" aria-label="Instagram">📸</a>
            <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
            <a href="#" className="social-icon" aria-label="LinkedIn">💼</a>
          </div>
        </div>
      </footer>
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
