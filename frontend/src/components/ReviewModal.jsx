import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ReviewModal({ isOpen, onClose, eligiblePurchases, onReviewSubmitted, editReview }) {
  const [formData, setFormData] = useState({
    purchaseId: '',
    rating: 0,
    comment: '',
    photos: []
  });
  const [photoPreview, setPhotoPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editReview) {
      setFormData({
        purchaseId: editReview.purchase,
        rating: editReview.rating,
        comment: editReview.comment,
        photos: []
      });
      setPhotoPreview(editReview.photos || []);
    } else if (eligiblePurchases && eligiblePurchases.length > 0) {
      setFormData(prev => ({
        ...prev,
        purchaseId: eligiblePurchases[0]._id
      }));
    }
  }, [editReview, eligiblePurchases]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // If adding to existing photos
    if (photoPreview.length > 0) {
      const totalPhotos = formData.photos.length + files.length;
      
      if (totalPhotos > 5) {
        setError(`You can only upload up to 5 photos. Currently have ${formData.photos.length}.`);
        return;
      }

      const newPhotos = [...formData.photos, ...files];
      setFormData({ ...formData, photos: newPhotos });
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreview([...photoPreview, ...newPreviews]);
      setError('');
      return;
    }

    // First time upload
    if (files.length < 2) {
      setError('Please select at least 2 photos');
      return;
    }

    if (files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setFormData({ ...formData, photos: files });
    setError('');

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleRemovePhoto = (indexToRemove) => {
    const newPhotos = formData.photos.filter((_, index) => index !== indexToRemove);
    const newPreviews = photoPreview.filter((_, index) => index !== indexToRemove);
    
    setFormData({ ...formData, photos: newPhotos });
    setPhotoPreview(newPreviews);
    
    if (newPhotos.length < 2 && !editReview) {
      setError('Please select at least 2 photos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating) {
      setError('Please select a rating');
      return;
    }

    if (formData.comment.length < 10) {
      setError('Comment must be at least 10 characters');
      return;
    }

    if (!editReview && formData.photos.length < 2) {
      setError('Please upload at least 2 photos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      const formDataToSend = new FormData();
      formDataToSend.append('purchaseId', formData.purchaseId);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('comment', formData.comment);
      
      formData.photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      const url = editReview 
        ? `http://localhost:3000/backend/reviews/${editReview._id}`
        : 'http://localhost:3000/backend/reviews';

      const method = editReview ? 'put' : 'post';

      const response = await axios[method](url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Cookie: `access_token=${token}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        onReviewSubmitted(response.data.review);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      purchaseId: eligiblePurchases?.[0]?._id || '',
      rating: 0,
      comment: '',
      photos: []
    });
    setPhotoPreview([]);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(30, 30, 35, 0.98), rgba(20, 20, 25, 0.98));
          border-radius: 24px;
          padding: 0;
          max-width: 650px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          border: 2px solid rgba(255, 78, 80, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .modal-header {
          background: linear-gradient(135deg, rgba(255, 78, 80, 0.15), rgba(249, 212, 35, 0.15));
          padding: 25px 30px;
          border-bottom: 2px solid rgba(255, 78, 80, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-body {
          padding: 30px;
          overflow-y: auto;
          max-height: calc(90vh - 100px);
        }

        .close-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid rgba(239, 68, 68, 0.3);
          font-size: 1.5rem;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.4);
          border-color: #ef4444;
          transform: rotate(90deg);
        }

        .form-group {
          margin-bottom: 28px;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 1rem;
          letter-spacing: 0.3px;
        }

        .label-icon {
          font-size: 1.3rem;
          filter: drop-shadow(0 2px 4px rgba(255, 78, 80, 0.3));
        }

        .form-select, .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          background: rgba(15, 15, 20, 0.8);
          color: #f5f5f5;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #ff4e50;
          background: rgba(20, 20, 25, 0.9);
          box-shadow: 0 0 0 4px rgba(255, 78, 80, 0.15);
          transform: translateY(-1px);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        .star-rating-container {
          background: rgba(15, 15, 20, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .star-rating-input {
          display: flex;
          gap: 12px;
          flex-direction: row-reverse;
          justify-content: center;
        }

        .star-rating-input input {
          display: none;
        }

        .star-rating-input label {
          font-size: 2.8rem;
          color: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          user-select: none;
        }

        /* Highlight filled stars (clicked star and all previous stars) */
        .star-rating-input label.filled {
          color: #f9d423 !important;
          transform: scale(1.15) rotate(-5deg) !important;
          filter: drop-shadow(0 4px 8px rgba(249, 212, 35, 0.5)) !important;
        }

        /* Hover effect - only when no star is selected */
        .star-rating-input:not(:has(label.filled)) label:hover,
        .star-rating-input:not(:has(label.filled)) label:hover ~ label {
          color: #f9d423;
          transform: scale(1.15) rotate(-5deg);
          filter: drop-shadow(0 4px 8px rgba(249, 212, 35, 0.5));
        }

        .rating-text {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .photo-upload-section {
          background: linear-gradient(135deg, rgba(15, 15, 20, 0.8), rgba(20, 20, 25, 0.7));
          border: 2px solid rgba(255, 78, 80, 0.3);
          border-radius: 16px;
          padding: 24px;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .photo-upload-section::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(255, 78, 80, 0.5), rgba(249, 212, 35, 0.5), transparent);
          border-radius: 0 0 14px 14px;
        }

        .photo-upload-area {
          border: 3px dashed rgba(255, 78, 80, 0.5);
          border-radius: 14px;
          padding: 40px 24px 32px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(10, 10, 15, 0.6);
          position: relative;
          overflow: hidden;
          display: block;
        }

        .photo-upload-area::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 78, 80, 0.08), rgba(249, 212, 35, 0.08));
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .photo-upload-area:hover {
          border-color: #ff4e50;
          transform: scale(1.01);
          box-shadow: 0 8px 24px rgba(255, 78, 80, 0.25);
        }

        .photo-upload-area:hover::before {
          opacity: 1;
        }

        .photo-upload-area input {
          display: none;
        }

        .upload-icon {
          font-size: 4rem;
          margin-bottom: 12px;
          animation: float 3s ease-in-out infinite;
          display: inline-block;
          filter: drop-shadow(0 4px 12px rgba(255, 78, 80, 0.4));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .upload-text {
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: 0.3px;
        }

        .upload-subtext {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin: 0 0 18px 0;
        }

        .photo-requirements {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          max-width: 500px;
          margin: 0 auto;
        }

        .requirement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.8rem;
          background: rgba(10, 10, 15, 0.6);
          padding: 10px 8px;
          border-radius: 10px;
          border: 1px solid rgba(255, 78, 80, 0.3);
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .requirement-item:hover {
          background: rgba(255, 78, 80, 0.15);
          border-color: rgba(255, 78, 80, 0.5);
          transform: translateY(-2px);
        }

        .requirement-icon {
          font-size: 1.4rem;
        }

        .photo-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 14px;
          margin: 0;
        }

        .photo-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(255, 78, 80, 0.35);
          background: rgba(10, 10, 15, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .photo-preview-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 28px rgba(255, 78, 80, 0.35);
          border-color: #ff4e50;
        }

        .photo-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .photo-preview-item:hover img {
          transform: scale(1.05);
        }

        .remove-photo-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.3rem;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
          z-index: 10;
          opacity: 0;
        }

        .photo-preview-item:hover .remove-photo-btn {
          opacity: 1;
        }

        .remove-photo-btn:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.15) rotate(90deg);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.6);
        }

        .photo-count-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(255, 78, 80, 0.5);
          letter-spacing: 0.5px;
        }

        .upload-progress-indicator {
          margin: 0 0 16px 0;
          padding: 14px 18px;
          background: rgba(10, 10, 15, 0.7);
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.15);
        }

        .progress-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
        }

        .progress-text.complete {
          color: #10b981;
        }

        .progress-text.incomplete {
          color: #f59e0b;
        }

        .add-more-photos-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 16px;
          padding: 12px 24px;
          background: rgba(255, 78, 80, 0.15);
          border: 2px dashed rgba(255, 78, 80, 0.5);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-more-photos-btn:hover {
          background: rgba(255, 78, 80, 0.25);
          border-color: #ff4e50;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 78, 80, 0.3);
        }

        .add-more-photos-btn span:first-child {
          font-size: 1.2rem;
        }

        .char-count {
          text-align: right;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 8px;
          font-weight: 500;
        }

        .char-count.warning {
          color: #f59e0b;
        }

        .char-count.danger {
          color: #ef4444;
        }

        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15));
          color: #fca5a5;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 2px solid rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .submit-btn {
          background: linear-gradient(135deg, #ff4e50, #f9d423);
          color: #fff;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(255, 78, 80, 0.4);
          letter-spacing: 0.5px;
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(255, 78, 80, 0.5);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-width: 95%;
          }

          .modal-header {
            padding: 20px 24px;
          }

          .modal-body {
            padding: 24px;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .photo-requirements {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .requirement-item {
            flex-direction: row;
            justify-content: flex-start;
            padding: 10px 12px;
          }

          .requirement-icon {
            font-size: 1.3rem;
          }

          .photo-preview-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }

          .star-rating-input label {
            font-size: 2.3rem;
          }

          .upload-icon {
            font-size: 3.5rem;
          }

          .upload-text {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .modal-header {
            padding: 16px 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-title {
            font-size: 1.3rem;
          }

          .form-group {
            margin-bottom: 24px;
          }

          .photo-preview-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .star-rating-input {
            gap: 8px;
          }

          .star-rating-input label {
            font-size: 2rem;
          }
        }
      `}</style>

      <AnimatePresence>
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <span>{editReview ? '✏️' : '⭐'}</span>
                {editReview ? 'Edit Your Review' : 'Share Your Experience'}
              </h3>
              <button className="close-btn" onClick={handleClose}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="error-message">
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!editReview && eligiblePurchases && eligiblePurchases.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">🚗</span>
                      Select Purchase
                    </label>
                    <select
                      className="form-select"
                      value={formData.purchaseId}
                      onChange={(e) => setFormData({ ...formData, purchaseId: e.target.value })}
                      required
                    >
                      {eligiblePurchases.map((purchase) => (
                        <option key={purchase._id} value={purchase._id}>
                          {purchase.car?.brand} {purchase.car?.model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">⭐</span>
                    Rating
                  </label>
                  <div className="star-rating-container">
                    <div className="star-rating-input">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <label 
                          key={star}
                          className={formData.rating >= star ? 'filled' : ''}
                          onClick={() => setFormData({ ...formData, rating: star })}
                        >
                          <input
                            type="radio"
                            name="rating"
                            value={star}
                            checked={formData.rating === star}
                            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                            required
                          />
                          ★
                        </label>
                      ))}
                    </div>
                    {formData.rating > 0 && (
                      <div className="rating-text">
                        {formData.rating === 5 && '🌟 Excellent!'}
                        {formData.rating === 4 && '😊 Very Good'}
                        {formData.rating === 3 && '👍 Good'}
                        {formData.rating === 2 && '😐 Fair'}
                        {formData.rating === 1 && '😞 Poor'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">💭</span>
                    Your Review
                  </label>
                  <textarea
                    className="form-textarea"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share your experience with this car... What did you like most? How was the performance?"
                    required
                    minLength={10}
                    maxLength={500}
                  />
                  <div className={`char-count ${formData.comment.length > 450 ? 'warning' : ''} ${formData.comment.length > 480 ? 'danger' : ''}`}>
                    {formData.comment.length}/500 characters
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📷</span>
                    Upload Car Photos
                  </label>
                  <div className="photo-upload-section">
                    {photoPreview.length === 0 ? (
                      <label className="photo-upload-area">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          multiple
                          onChange={handlePhotoChange}
                          required={!editReview && photoPreview.length === 0}
                        />
                        <div className="upload-icon">📸</div>
                        <p className="upload-text">Click to upload photos of your purchased car</p>
                        <p className="upload-subtext">Drag & drop or click to browse</p>
                        <div className="photo-requirements">
                          <div className="requirement-item">
                            <div className="requirement-icon">2️⃣</div>
                            <div>Min 2 photos</div>
                          </div>
                          <div className="requirement-item">
                            <div className="requirement-icon">5️⃣</div>
                            <div>Max 5 photos</div>
                          </div>
                          <div className="requirement-item">
                            <div className="requirement-icon">🖼️</div>
                            <div>JPEG/PNG</div>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <>
                        <div className="upload-progress-indicator">
                          <div className={`progress-text ${photoPreview.length >= 2 ? 'complete' : 'incomplete'}`}>
                            {photoPreview.length >= 2 ? (
                              <>
                                <span>✅</span>
                                <span>{photoPreview.length} photos selected - Ready to submit!</span>
                              </>
                            ) : (
                              <>
                                <span>⚠️</span>
                                <span>{photoPreview.length} photo(s) - Need {2 - photoPreview.length} more</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="photo-preview-grid">
                          {photoPreview.map((preview, index) => (
                            <div key={index} className="photo-preview-item">
                              <img src={preview} alt={`Preview ${index + 1}`} />
                              <button
                                type="button"
                                className="remove-photo-btn"
                                onClick={() => handleRemovePhoto(index)}
                                title="Remove photo"
                              >
                                ×
                              </button>
                              <div className="photo-count-badge">
                                #{index + 1}
                              </div>
                            </div>
                          ))}
                        </div>

                        <label className="add-more-photos-btn">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            multiple
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                          />
                          <span>➕</span>
                          <span>Add More Photos</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '⏳ Submitting Review...' : editReview ? '✅ Update Review' : '✅ Submit Review'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
