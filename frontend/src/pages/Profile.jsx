import { useSelector, useDispatch } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const dispatch = useDispatch();

  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState({
    avatar: currentUser.avatar,
    username: currentUser.username,
    email: currentUser.email,
  });

  useEffect(() => {
    dispatch(updateUserFailure(null));
  }, [dispatch]);

  const handleSessionExpired = () => {
  dispatch(signOutSuccess());
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });

    if (error || updateSuccess) {
      dispatch(updateUserFailure(null));
      setUpdateSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.error));
        setFormData({
          avatar: currentUser.avatar,
          username: currentUser.username,
          email: currentUser.email,
        });
        return;
      }
      if(res.status === 401) {
        handleSessionExpired();
        return;
      }
      console.log(data);
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setFormData((prev) => ({ ...prev }));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      setFormData({
        avatar: currentUser.avatar,
        username: currentUser.username,
        email: currentUser.email,
        user_character: currentUser.user_character || '',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.error));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      deleteUserFailure(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch('/backend/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.error));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(error.message));
    }
  };



  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center my-8 text-blue-800 dark:text-blue-300">
        Profile
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="file" 
          ref={fileRef} 
          className="hidden" 
          accept="image/*" 
        />
        <div className="relative self-center">
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar}
            alt="profile"
            className="w-24 h-24 rounded-full self-center object-cover cursor-pointer ring-2 ring-blue-500 dark:ring-blue-300"
          />
        </div>


        <div className="flex items-center mb-4">
          <label htmlFor="username" className="w-24 font-medium text-gray-800 dark:text-gray-100">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 p-3 rounded-lg flex-1"
          />
        </div>

        <div className="flex items-center mb-4">
          <label htmlFor="email" className="w-24 font-medium text-gray-800 dark:text-gray-100">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 p-3 rounded-lg flex-1"
          />
        </div>

        <button
          disabled={loading}
          className="bg-slate-700 dark:bg-slate-800 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 transition"
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
      </form>


      <div className="flex justify-between mt-5 text-sm sm:text-base">
        <span onClick={handleDeleteUser} className="text-red-700 dark:text-red-400 cursor-pointer">
          Delete account
        </span>
        <Link to="/forgot-password">
          <span className="text-red-700 dark:text-red-400 cursor-pointer">
            Change password
          </span>
        </Link>
        <span onClick={handleSignOut} className="text-red-700 dark:text-red-400 cursor-pointer">
          Sign out
        </span>
      </div>

      <p className="text-red-700 dark:text-red-400 mt-5">{error || ''}</p>
      <p className="text-green-700 dark:text-green-400 mt-5">
        {updateSuccess ? 'User updated successfully!' : ''}
      </p>
      
      
    </div>
  );
};

export default Profile;
