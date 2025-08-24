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

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const fileRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: "",
  });
  const [file, setFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Update form once currentUser loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
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

    try {
      dispatch(updateUserStart());

      const dataForm = new FormData();
      dataForm.append("username", formData.username);
      dataForm.append("email", formData.email);
      if (formData.password) dataForm.append("password", formData.password);
      if (file) dataForm.append("avatar", file);

      const res = await fetch(`/backend/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body: dataForm,
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
      
      const updatedUser = data.user || data; // adapt depending on backend response
      dispatch(updateUserSuccess(updatedUser));
      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
        password: "", // keep password empty
      });
      setUpdateSuccess(true);
      setFile(null);

    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser.token}` },
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
      const res = await fetch("/backend/auth/signout");
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
    return <p className="text-center mt-10">Loading user data...</p>;
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center my-8 text-blue-800 dark:text-blue-300">
        Profile
      </h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="self-center cursor-pointer">
          <img
            src={file ? URL.createObjectURL(file) : currentUser.avatar || "/default-avatar.png"}
            alt="profile"
            className="rounded-full h-24 w-24 object-cover ring-2 ring-blue-500 dark:ring-blue-300"
            onClick={handleProfileClick}
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={fileRef}
            onChange={handleFileChange}
          />
        </label>

        <input
          type="text"
          id="username"
          placeholder="Username"
          value={formData.username ?? ""}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={formData.email ?? ""}
          onChange={handleChange}
          className="border p-3 rounded-lg"
          required
        />
        <input
          type="password"
          id="password"
          placeholder="Password (optional)"
          value={formData.password ?? ""}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Updating..." : "Update"}
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
        <span onClick={handleLogOut} className="text-red-700 dark:text-red-400 cursor-pointer">
          Logout
        </span>
      </div>

      {error && <p className="text-red-700 dark:text-red-400 mt-5">{error}</p>}
      {updateSuccess && <p className="text-green-700 dark:text-green-400 mt-5">User updated successfully!</p>}
    </div>
  );
};

export default Profile;