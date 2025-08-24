import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const {error, loading} = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // useEffect hook to clear error on input change
    useEffect(() => {
        // When formData changes (user starts typing), clear any existing error.
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
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="email"
          className="border p-3 rounded-lg"
          id="email" onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="password"
          className="border p-3 rounded-lg"
          id="password" onChange={handleChange}
          required
        />
        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-80"> {loading ? "Loading..." : "Sign In"} </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Dont have an account? </p>
        <Link to="/sign-up">
          <span className="text-blue-700">Sign Up</span>
        </Link>
      </div>
      <div>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>
    </div>
  );
}