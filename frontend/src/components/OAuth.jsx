import {GoogleAuthProvider, signInWithPopup, getAuth} from 'firebase/auth';
import { app } from '../firebase'; 
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/logo/google.svg';

export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async () => {
        try{
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);

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
                throw new Error(data.error || data.message || 'Google authentication failed');
            }
            
            dispatch(signInSuccess(data));
            navigate('/');
        }catch (error) {
            console.error("Google OAuth error:", error);
            // You can add a toast notification here if you have a notification system
            alert("Google authentication failed. Please try again.");
        }
    }
    return (
        <button 
            onClick={handleGoogleClick} 
            type="button" 
            className="w-full flex items-center justify-center gap-x-3 p-3 border border-gray-300 rounded-lg text-gray-500 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
            <img className="w-6 h-6" src={googleLogo} loading="lazy"/>
            <span>Continue with Google</span>
        </button>
    )
}