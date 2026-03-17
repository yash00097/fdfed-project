import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/logo/google.svg';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const auth = getAuth(app);

            // Step 1: Firebase popup sign-in
            const result = await signInWithPopup(auth, provider);

            // Step 2: Send user info to our backend
            const res = await fetch('/backend/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Google sign-in failed on server.');
            }

            dispatch(signInSuccess(data));
            navigate('/');
        } catch (error) {
            console.error('Google OAuth error:', error);

            // Provide specific error messages
            const code = error?.code || '';
            let msg = 'Google sign-in failed. Please try again.';

            if (code === 'auth/popup-closed-by-user') {
                msg = 'Sign-in popup was closed. Please try again.';
            } else if (code === 'auth/popup-blocked') {
                msg = 'Popup was blocked by your browser. Please allow popups for this site.';
            } else if (code === 'auth/network-request-failed') {
                msg = 'Network error. Please check your internet connection.';
            } else if (code === 'auth/unauthorized-domain') {
                msg = 'This domain is not authorised for Google sign-in. Contact support.';
            } else if (error.message) {
                msg = error.message;
            }

            alert(msg);
        }
    };

    return (
        <button
            onClick={handleGoogleClick}
            type="button"
            className="w-full flex items-center justify-center gap-x-3 p-3 border border-gray-300 rounded-lg text-gray-500 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
            <img className="w-6 h-6" src={googleLogo} loading="lazy" alt="Google" />
            <span>Continue with Google</span>
        </button>
    );
}