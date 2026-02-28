import React, { useState } from 'react';
import { FiX, FiCalendar, FiMapPin } from 'react-icons/fi';

const TestDriveRequestModal = ({ carId, carName, isOpen, onClose, onSuccess }) => {
  const [requestedDateTime, setRequestedDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestedDateTime || !location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await fetch('/backend/testdrive/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId,
          requestedDateTime,
          location,
          notes
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Test drive requested successfully! The agent will review your request shortly.');
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(data.message || 'Failed to request test drive');
      }
    } catch (err) {
      setError('Failed to request test drive');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestedDateTime('');
    setLocation('');
    setNotes('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold">Request Test Drive</h3>
            <p className="text-gray-400 text-sm mt-1">{carName}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Requested Date/Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <FiCalendar className="w-4 h-4" />
                Preferred Date & Time *
              </div>
            </label>
            <input
              type="datetime-local"
              value={requestedDateTime}
              onChange={(e) => setRequestedDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Choose a date and time for your test drive</p>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <FiMapPin className="w-4 h-4" />
                Preferred Location *
              </div>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown Mall, Shopping District"
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Where would you like to test drive this car?</p>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
              placeholder="Any special requests or questions for the agent..."
              maxLength={1000}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 outline-none resize-vertical"
              rows="3"
            />
            <p className="text-xs text-gray-500 mt-1">{notes.length}/1000</p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-blue-200 text-sm">
              📝 Your test drive request will be sent to the agent. They will review and confirm your booking shortly. You'll receive a notification once approved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !requestedDateTime || !location}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Requesting...' : 'Request Test Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestDriveRequestModal;
