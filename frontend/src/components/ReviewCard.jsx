import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewCard({ review, onEdit, onDelete, isOwner }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Auto-slide photos every 2 seconds
  useEffect(() => {
    if (review.photos && review.photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prevIndex) => 
          (prevIndex + 1) % review.photos.length
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [review.photos]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        style={{
          fontSize: '1.2rem',
          color: index < rating ? '#f9d423' : 'rgba(255, 255, 255, 0.3)',
        }}
      >
        ★
      </span>
    ));
  };

  // Get username from populated user object or fallback to userName field
  const displayName = review.user?.username || review.userName;
  
  // Check if name is longer than 15 characters
  const isLongName = displayName && displayName.length > 15;

  return (
    <>
      <style>{`
        .review-card-container {
          background: linear-gradient(135deg, rgba(26, 20, 16, 0.95), rgba(40, 30, 25, 0.85));
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(255, 78, 80, 0.15);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .review-card-container:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(255, 78, 80, 0.3);
          background: linear-gradient(135deg, rgba(26, 20, 16, 1), rgba(45, 33, 28, 0.95));
        }

        .review-header {
          margin-bottom: 15px;
        }

        .reviewer-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: 100%;
        }

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
          color: #fff;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reviewer-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .name-rating-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .reviewer-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #f5f5f5;
          word-break: break-word;
          line-height: 1.3;
        }

        .name-rating-row .reviewer-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .review-date {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .rating {
          display: flex;
          gap: 2px;
          align-items: center;
          flex-shrink: 0;
        }

        .photo-carousel {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 15px;
          overflow: hidden;
          margin: 15px 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .photo-carousel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-indicators {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 2;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: #ff4e50;
          width: 24px;
          border-radius: 4px;
        }

        .review-content {
          margin: 15px 0;
          flex-grow: 1;
          overflow: hidden;
        }

        .review-content p {
          margin: 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          gap: 10px;
          flex-wrap: wrap;
        }

        .car-info {
          font-size: 0.9rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .car-label {
          color: rgba(255, 255, 255, 0.6);
          margin-right: 5px;
        }

        .car-model {
          font-weight: 500;
          color: #ff4e50;
        }

        .review-actions {
          display: flex;
          gap: 10px;
        }

        .edit-btn, .delete-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 5px;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f9d423;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .review-card-container {
            padding: 20px;
          }

          .photo-carousel {
            height: 180px;
          }

          .review-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .car-info {
            width: 100%;
          }
        }
      `}</style>

      <div className="review-card-container">
        <div className="review-header">
          <div className="reviewer-info">
            <div className="avatar">
              {review.user?.avatar ? (
                <img src={review.user.avatar} alt={displayName} />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="reviewer-details">
              {isLongName ? (
                // Long name: Stack vertically
                <>
                  <h4 className="reviewer-name">{displayName}</h4>
                  <div className="rating">{renderStars(review.rating)}</div>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </>
              ) : (
                // Short name: Show name and stars on same line
                <>
                  <div className="name-rating-row">
                    <h4 className="reviewer-name">{displayName}</h4>
                    <div className="rating">{renderStars(review.rating)}</div>
                  </div>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Photo Carousel */}
        {review.photos && review.photos.length > 0 && (
          <div className="photo-carousel">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhotoIndex}
                src={review.photos[currentPhotoIndex]}
                alt={`Review photo ${currentPhotoIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            
            {review.photos.length > 1 && (
              <div className="photo-indicators">
                {review.photos.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="review-content">
          <p>{review.comment}</p>
        </div>

        <div className="review-footer">
          <div className="car-info">
            <span className="car-label">Purchased:</span>
            <span className="car-model">
              {review.car?.brand} {review.car?.model}
            </span>
          </div>

          {isOwner && (
            <div className="review-actions">
              <button className="edit-btn" onClick={() => onEdit(review)}>
                ✏️ Edit
              </button>
              <button className="delete-btn" onClick={() => onDelete(review._id)}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
