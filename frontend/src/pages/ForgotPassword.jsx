import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientText from "../react-bits/GradientText/GradientText.jsx";
import authBgImage from "../assets/images/authBgImage.jpg";

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpExpiryTime, setOtpExpiryTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    // Focus management for OTP inputs
    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [step]);

    // OTP Timer countdown
    useEffect(() => {
        if (step === 2 && otpExpiryTime) {
            const timer = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((otpExpiryTime - now) / 1000));
                setTimeRemaining(remaining);

                if (remaining === 0) {
                    setCanResend(true);
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [step, otpExpiryTime]);

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Clear error when user starts typing
        if (error) setError('');

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        setOtp(['', '', '', '', '', '']);

        try {
            const res = await fetch('/backend/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.message || data.success) {
                setMessage('New OTP sent to your email');
                const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
                setOtpExpiryTime(expiryTime);
                setTimeRemaining(600); // 10 minutes in seconds
                setCanResend(false);
                setLoading(false);
            } else {
                setError(data.error || 'Failed to resend OTP');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePasswordChange = (field, value) => {
        if (field === 'new') {
            setNewPassword(value);
        } else {
            setConfirmPassword(value);
        }

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/backend/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.message || data.success) {
                setMessage(data.message || 'OTP sent to your email');
                const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
                setOtpExpiryTime(expiryTime);
                setTimeRemaining(600); // 10 minutes in seconds
                setCanResend(false);
                setTimeout(() => {
                    setMessage('');
                    setStep(2);
                    setLoading(false);
                }, 1500);
            } else {
                setError(data.error || 'Something went wrong');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        setError('');
        setMessage('');
        setLoading(true);

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter complete 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/backend/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString }),
            });
            const data = await res.json();

            if (data.message || res.ok) {
                setMessage('OTP verified successfully!');
                setTimeout(() => {
                    setMessage('');
                    setStep(3);
                    setLoading(false);
                }, 1500);
            } else {
                setError(data.error || 'Invalid OTP');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        const otpString = otp.join('');

        try {
            const res = await fetch('/backend/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpString, newPassword }),
            });
            const data = await res.json();

            if (data.message || data.success) {
                setMessage(data.message || 'Password reset successfully');
                setTimeout(() => navigate('/sign-in'), 2000);
            } else {
                setError(data.error || 'Something went wrong');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0"
                style={{
                        backgroundImage: `url(${authBgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                }}
            >
            <div className="max-w-4xl w-lg mx-auto mt-30 bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-2xl shadow-blue-500/10 p-8 rounded-2xl ">
                <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                    animationSpeed={10}
                    showBorder={false}
                    className="custom-class text-3xl font-semibold"
                >
                    Reset Password
                </GradientText>

                {/* Step Indicator */}
                <div className="flex justify-between mb-8">
                    <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 1 ? 'bg-green-600' : 'bg-blue-700'
                        }`}>
                            <span className="text-white font-semibold">1</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-2">Email</span>
                    </div>
                    <div className={`flex-1 h-1 self-center ${
                        step >= 2 ? 'bg-green-600' : 'bg-blue-700'
                    } mx-2 mt-[-20px]`}></div>
                    <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 2 ? 'bg-green-600' : 'bg-blue-700'
                        }`}>
                            <span className="text-white font-semibold">2</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-2">Verify OTP</span>
                    </div>
                    <div className={`flex-1 h-1 self-center ${
                        step >= 3 ? 'bg-green-600' : 'bg-blue-700'
                    } mx-2 mt-[-20px]`}></div>
                    <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 3 ? 'bg-green-600' : 'bg-blue-700'
                        }`}>
                            <span className="text-white font-semibold">3</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-2">New Password</span>
                    </div>
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Request OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Enter OTP</label>
                            <div className="flex justify-center gap-2 mb-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-12 text-center text-xl font-semibold border border-gray-600 bg-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        ref={(ref) => (otpRefs.current[index] = ref)}
                                        disabled={timeRemaining === 0}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm text-center">
                                OTP has been sent to {email}
                            </p>

                            {/* Timer Display */}
                            <div className="mt-3 text-center">
                                {timeRemaining > 0 ? (
                                    <p className="text-blue-400 text-sm font-semibold">
                                        Time remaining: {formatTime(timeRemaining)}
                                    </p>
                                ) : (
                                    <p className="text-red-400 text-sm font-semibold">
                                        OTP has expired! Please request a new one.
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || timeRemaining === 0}
                            className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        {/* Resend OTP Button */}
                        {canResend && (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="bg-green-600 text-white p-3 rounded-lg uppercase hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setLoading(false);
                                setError('');
                                setOtp(['', '', '', '', '', '']);
                                setOtpExpiryTime(null);
                                setTimeRemaining(0);
                                setCanResend(false);
                            }}
                            className="text-gray-400 hover:text-gray-300 transition text-sm"
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="w-full border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                                value={newPassword}
                                onChange={(e) => handlePasswordChange('new', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600"
                                value={confirmPassword}
                                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                required
                            />
                        </div>

                        {/* Real-time password match validation */}
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-red-400 text-sm">Passwords do not match</p>
                        )}

                        <button
                            type="submit"
                            className="bg-green-600 text-white p-3 rounded-lg uppercase hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Messages */}
                {message && (
                    <div className="mt-5 p-3 bg-green-900 border border-green-700 rounded-lg">
                        <p className="text-green-300 text-center">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="mt-5 p-3 bg-red-900 border border-red-700 rounded-lg">
                        <p className="text-red-300 text-center">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
