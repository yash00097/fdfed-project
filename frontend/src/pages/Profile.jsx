import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutStart,
  signOutSuccess,
  signOutFailure,
} from "../redux/user/userSlice";
import { Link, useNavigate } from "react-router-dom";
import GradientText from "../react-bits/GradientText/GradientText";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
  });
  const [file, setFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        currentPassword: "",
        newPassword: "",
      });
      dispatch(updateUserFailure(null));
    }
  }, [currentUser, dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    if (error || updateSuccess) {
      dispatch(updateUserFailure(null));
      setUpdateSuccess(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleProfileClick = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleSessionExpired = () => {
    dispatch(signOutSuccess());
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const hasCurrent = !!formData.currentPassword;
    const hasNew = !!formData.newPassword;
    if (hasCurrent && !hasNew) {
      dispatch(updateUserFailure("Enter a new password"));
      return;
    }
    if (hasNew && !hasCurrent) {
      dispatch(updateUserFailure("Enter your current password to set a new password"));
      return;
    }

    try {
      dispatch(updateUserStart());

      const dataForm = new FormData();
      dataForm.append("username", formData.username);
      dataForm.append("email", formData.email);
      if (formData.currentPassword) dataForm.append("currentPassword", formData.currentPassword);
      if (formData.newPassword) dataForm.append("newPassword", formData.newPassword);
      if (file) dataForm.append("avatar", file);

      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: "PUT",
        body: dataForm,
        credentials: "include",
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      const data = await res.json();
      if (!res.ok || data.success === false) {
        dispatch(updateUserFailure(data.error || "Update failed"));
        return;
      }

      const updatedUser = data.user || data;
      dispatch(updateUserSuccess(updatedUser));
      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
        currentPassword: "",
        newPassword: "",
      });
      setUpdateSuccess(true);
      setFile(null);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        dispatch(deleteUserFailure(data.error || "Delete failed"));
        return;
      }
      dispatch(deleteUserSuccess());
      dispatch(signOutSuccess());
      navigate("/login");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleLogOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch("/backend/auth/signout", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        dispatch(signOutFailure(data.error || "Logout failed"));
        return;
      }
      dispatch(signOutSuccess());
      navigate("/login");
    } catch (err) {
      dispatch(signOutFailure(err.message));
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8">
      {/* --- WIDENED MAIN CONTAINER --- */}
      <div className="max-w-4xl mx-auto mt-30 bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
        <div className="text-center mb-8">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={10}
            showBorder={false}
            className="custom-class text-3xl font-semibold"
          >
            Profile
          </GradientText>
          <p className="text-gray-400 text-sm">Manage your account settings</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* --- MAIN GRID CONTAINER FOR TWO COLUMNS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-y-8">

            {/* --- LEFT COLUMN: PROFILE & USER INFO --- */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={handleProfileClick}
                >
                  <img
                    src={file ? URL.createObjectURL(file) : currentUser.avatar || "/default-avatar.png"}
                    alt="profile"
                    className="rounded-full h-32 w-32 object-cover ring-4 ring-gray-600 group-hover:ring-blue-500 transition-all duration-300 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-sm font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Change
                    </span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" ref={fileRef} onChange={handleFileChange} />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input type="text" id="username" placeholder="Enter your username" value={formData.username ?? ""} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 transition-all duration-300" required />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email" value={formData.email ?? ""} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 transition-all duration-300" required />
              </div>
            </div>

            {/* --- RIGHT COLUMN: PASSWORD CHANGE --- */}
            <div className="flex flex-col justify-center">
              <div className="bg-gray-700/50 rounded-lg p-4 h-full border border-gray-600">
                <h3 className="text-lg font-semibold text-gray-300 mb-4 text-center">Change Password</h3>
                <p className="text-sm text-gray-400 mb-4">Password changes are only available for accounts not created with Google Sign-In.</p>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input type="password" id="currentPassword" placeholder="Enter your current password" value={formData.currentPassword ?? ""} onChange={handleChange} className="w-full bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 transition-all duration-300" />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input type="password" id="newPassword" placeholder="Enter new password" value={formData.newPassword ?? ""} onChange={handleChange} className="w-full bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-3 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* --- SUBMIT BUTTON (BELOW THE GRID) --- */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Updating...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Update Profile</>
              )}
            </button>
          </div>
        </form>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-700 gap-4">
          <button onClick={handleLogOut} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 cursor-pointer font-medium text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</button>
          <button onClick={handleDeleteUser} className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 cursor-pointer font-medium text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete Account</button>
        </div>

        {/* Status Messages */}
        {error && (<div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3 text-red-400"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm">{error}</span></div>)}
        {updateSuccess && (<div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3 text-green-400"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm">Profile updated successfully!</span></div>)}
      </div>
    </div>
  );
};

export default Profile;
