import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import authBgImage from "../assets/images/authBgImage.jpg";
import logo from "../assets/images/logo.png";

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const {error, loading} = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            dispatch(signInFailure(null));
        }
    }, [formData, dispatch]);


    const handleChange= (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            dispatch(signInStart());

            const res= await fetch('/backend/auth/signin',{ 
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data=await res.json();

            if(!res.ok) {
                dispatch(signInFailure(data.error || data.message || 'Sign in failed'));
                return;
            }
            dispatch(signInSuccess(data));
            navigate('/');
        }catch(error){
            dispatch(signInFailure(error.message));
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
        <div className="w-full max-w-md p-6 space-y-4 md:space-y-6 sm:p-8">

            <img className="w-48 h-48 mx-auto mb-4" src={logo} alt="logo" />
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                        placeholder="Enter your email" 
                        required 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="Enter your password" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                        required 
                        onChange={handleChange} 
                    />
                </div>
                
                <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center uppercase"
                >
                    {loading ? "Loading..." : "Sign In"}
                </button>
            </form>

            <div className="text-sm font-light text-gray-400 text-center">
                Don't have an account? <Link to="/sign-up" className="font-medium text-blue-500 hover:underline">Sign up</Link>
            </div>
            
            <div className="flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <OAuth/>

            <p className="text-xs text-gray-500 text-center">
                Only login via email or Google is supported in your region.
            </p>

            {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
        </div>
    </div>
  );
}