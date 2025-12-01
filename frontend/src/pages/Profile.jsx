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
  const [activity, setActivity] = useState(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [activityLoading, setActivityLoading] = useState(true);
  const [requestsList, setRequestsList] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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

  // Fetch user activity counts for pie chart; robust fallback and loading state
  useEffect(() => {
    const fetchActivity = async () => {
      if (!currentUser) return;
      setActivityLoading(true);
      try {
        const res = await fetch('/backend/user/analytics', { credentials: 'include' });
        if (res.status === 401) {
          handleSessionExpired();
          return;
        }
        const json = await res.json().catch(() => null);
        
        // Data validation and processing
        if (res.ok && json?.success) {
          // Ensure all date strings are valid
          const processedSellsByStatus = {};
          
          Object.entries(json.sellsByStatus || {}).forEach(([carId, car]) => {
            try {
              processedSellsByStatus[carId] = {
                ...car,
                createdAt: car.createdAt ? new Date(car.createdAt).toISOString() : null,
                updatedAt: car.updatedAt ? new Date(car.updatedAt).toISOString() : null,
                verificationStartTime: car.verificationStartTime ? new Date(car.verificationStartTime).toISOString() : null,
              };
            } catch (dateError) {
              console.error('Error processing dates for car:', carId, dateError);
            }
          });

          setActivity({
            ...json,
            sellsByStatus: processedSellsByStatus
          });
          
          console.log('Processed activity data:', {
            sellsCount: json.sellsCount,
            cars: Object.keys(processedSellsByStatus).length,
            sampleDates: Object.values(processedSellsByStatus)[0]
          });
        } else {
          console.error('/backend/user/analytics returned:', res.status, json);
          setActivity({
            sellsCount: 0,
            purchasesCount: 0,
            requestsCount: 0,
            sellsByStatus: {}
          });
        }
      } catch (err) {
        console.error('Error fetching /backend/user/analytics:', err);
        setActivity({
          sellsCount: 0,
          purchasesCount: 0,
          requestsCount: 0,
          sellsByStatus: {}
        });
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
    // fetch user requests as well
    const fetchRequests = async () => {
      if (!currentUser) return;
      setRequestsLoading(true);
      try {
        const res = await fetch('/backend/request-car/my', { credentials: 'include' });
        if (res.status === 401) {
          handleSessionExpired();
          return;
        }
        const json = await res.json();
        if (res.ok && json && json.success) {
          setRequestsList(json.requests || []);
        } else if (json && Array.isArray(json.requests)) {
          setRequestsList(json.requests);
        } else {
          setRequestsList([]);
        }
      } catch (err) {
        console.error('Error fetching user requests', err);
        setRequestsList([]);
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, [currentUser]);

  // SVG PieChart (copied from AgentPieChart for identical behaviour)
  function PieChart({ data, colors, size = 220, strokeWidth = 36, onHoverSlice }) {
    const total = Object.values(data).reduce((s, v) => s + (v || 0), 0) || 1;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseLeave={() => onHoverSlice && onHoverSlice(null, null, null)}
      >
        <g>
          <circle
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            stroke="#0f1724"
            strokeWidth={strokeWidth}
            onMouseEnter={() => onHoverSlice && onHoverSlice(null, null, null)}
          />
          {/* inner transparent circle to detect pointer inside hole and hide tooltip */}
          <circle
            r={Math.max(0, radius - strokeWidth / 2)}
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            style={{ pointerEvents: 'auto' }}
            onMouseEnter={() => onHoverSlice && onHoverSlice(null, null, null)}
          />
          {Object.keys(data).map((key, i) => {
            const value = data[key] || 0;
            if (value === 0) return null;
            const portion = value / total;
            const dash = portion * circumference;
            const dashOffset = offset;
            offset += dash;
            return (
              <circle
                key={key}
                r={radius}
                cx={size / 2}
                cy={size / 2}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                onMouseEnter={(e) => onHoverSlice && onHoverSlice(key, value, e)}
                onMouseMove={(e) => onHoverSlice && onHoverSlice(key, value, e)}
                onMouseLeave={() => onHoverSlice && onHoverSlice(null, null, null)}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </g>
      </svg>
    );
  }

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
      // Preserve the token from the current user when updating
      const userWithToken = { ...updatedUser, token: currentUser.token };
      dispatch(updateUserSuccess(userWithToken));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 lg:p-8 pt-24 md:pt-28">
      <div className={currentUser?.role === 'normalUser' ? 'w-full grid grid-cols-1 lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr] gap-8' : 'max-w-3xl mx-auto mt-30'}>
        <div className={currentUser?.role === 'normalUser' ? 'lg:sticky lg:top-40 h-fit' : ''}>
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
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
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12 gap-y-8">
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

            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-700 gap-4">
              <button
                onClick={handleLogOut}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 cursor-pointer font-medium text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
              <Link to="/forgot-password">
                <button
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors duration-300 cursor-pointer font-medium text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0-1.104.896-2 2-2h1a2 2 0 012 2v1h-2m0 4h.01M17 8V7a5 5 0 00-10 0v1M5 11h14v10H5V11z"
                    />
                  </svg>
                  Forgot Password
                </button>
              </Link>
              <button
                onClick={handleDeleteUser}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 cursor-pointer font-medium text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Account
              </button>
            </div>

            {error && (<div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3 text-red-400"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm">{error}</span></div>)}
            {updateSuccess && (<div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3 text-green-400"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span className="text-sm">Profile updated successfully!</span></div>)}
          </div>
        </div>

        {currentUser?.role === 'normalUser' && (
        <div className="space-y-6 pr-1 mt-32 ">
          {currentUser?.role === 'normalUser' && (
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700">
              <div ref={containerRef} className="relative">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">My Car Activities</h3>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {activityLoading ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        <PieChart
                          data={{
                            listed: activity?.sellsCount || 0,
                            bought: activity?.purchasesCount || 0,
                            requests: activity?.requestsCount || 0,
                          }}
                          colors={["#1dd40dff", "#1386d3ff", "#f5b30bff"]}
                          size={280}
                          strokeWidth={44}
                          onHoverSlice={(key, value, e) => {
                            if (!key) return setTooltip({ show: false, x: 0, y: 0, content: '' });
                            const total = (activity?.sellsCount || 0) + (activity?.purchasesCount || 0) + (activity?.requestsCount || 0) || 1;
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                            const labels = { listed: 'Sell', bought: 'Bought', requests: 'Requests' };
                            const rect = containerRef.current?.getBoundingClientRect();
                            const x = e?.clientX - (rect?.left || 0) + 8;
                            const y = e?.clientY - (rect?.top || 0) + 8;
                            setTooltip({ show: true, x, y, content: `${labels[key] || key}: ${value} (${pct}%)` });
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-semibold text-gray-200">Summary</h4>
                            <div className="text-sm text-gray-400 mt-1">Total activity: <span className="font-bold text-white">{(activity?.sellsCount || 0) + (activity?.purchasesCount || 0) + (activity?.requestsCount || 0)}</span></div>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="group">
                            <div className="rounded-xl border border-gray-700 p-4 bg-[#0b1220] hover:bg-[#0f1724] transition-colors duration-200">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-green-400 mt-1" />
                                <div>
                                  <div className="text-sm text-gray-300">Sell</div>
                                  <div className="text-2xl font-semibold text-white mt-2">{activity?.sellsCount ?? 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <div className="rounded-xl border border-gray-700 p-4 bg-[#0b1220] hover:bg-[#0f1724] transition-colors duration-200">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-blue-400 mt-1" />
                                <div>
                                  <div className="text-sm text-gray-300">Bought</div>
                                  <div className="text-2xl font-semibold text-white mt-2">{activity?.purchasesCount ?? 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="group">
                            <div className="rounded-xl border border-gray-700 p-4 bg-[#0b1220] hover:bg-[#0f1724] transition-colors duration-200">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1" />
                                <div>
                                  <div className="text-sm text-gray-300">Requests</div>
                                  <div className="text-2xl font-semibold text-white mt-2">{activity?.requestsCount ?? 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {tooltip.show && (
                  <div style={{ left: tooltip.x, top: tooltip.y }} className="absolute z-50 pointer-events-none bg-black/80 text-white px-3 py-2 rounded text-sm">
                    {tooltip.content}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentUser?.role === 'normalUser' && (
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">Your Sell Requests</h3>
                  <p className="text-sm text-gray-400 mt-1">Track the status of your car listings</p>
                </div>
                <Link to="/sell-car">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                    + New Listing
                  </button>
                </Link>
              </div>

              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-600"></div>
                </div>
              ) : activity?.sellsByStatus && Object.keys(activity.sellsByStatus).length > 0 ? (
                <div className="grid gap-4 grid-cols-1">
                  {Object.entries(activity.sellsByStatus).map(([carId, car]) => (
                    <div key={carId} className="bg-[#0b1220] rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-white">{car.brand} {car.model}</h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              car.status === 'pending' ? 'bg-yellow-600/20 text-yellow-200 border border-yellow-500/20' :
                              car.status === 'verification' ? 'bg-blue-600/20 text-blue-200 border border-blue-500/20' :
                              car.status === 'available' ? 'bg-green-600/20 text-green-200 border border-green-500/20' :
                              car.status === 'sold' ? 'bg-purple-600/20 text-purple-200 border border-purple-500/20' :
                              'bg-red-600/20 text-red-200 border border-red-500/20'
                            }`}>
                              {car.status === 'pending' ? 'Awaiting Verification' :
                               car.status === 'verification' ? 'Under Verification' :
                               car.status === 'available' ? 'Listed for Sale' :
                               car.status === 'sold' ? 'Sold' :
                               'Verification Failed'}
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm mb-3">#{car.carNumber}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-sm text-gray-300">
                              {car.status === 'pending' ? (
                                <span className="text-yellow-400">Awaiting agent assignment</span>
                              ) : car.agentName ? (
                                <span>Managed by <span className="text-blue-400 font-medium">{car.agentName}</span></span>
                              ) : car.status === 'rejected' ? (
                                <span className="text-red-400">Request declined</span>
                              ) : car.status === 'available' ? (
                                <span className="text-green-400">Active Listing</span>
                              ) : car.status === 'sold' ? (
                                <span className="text-purple-400">Sale Successfully Completed</span>
                              ) : car.status === 'verification' ? (
                                <span className="text-blue-400">Under Verification Process</span>
                              ) : (
                                <span className="text-yellow-400">Processing Request</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                            <div>Submitted: {car.createdAt ? new Date(car.createdAt).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'N/A'}</div>
                            {car.verificationStartTime && (
                              <div>Verification Started: {new Date(car.verificationStartTime).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</div>
                            )}
                            {car.status === 'sold' && car.updatedAt && (
                              <div>Sold: {new Date(car.updatedAt).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</div>
                            )}
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 bg-[#0f1724] px-4 py-2 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              car.status === 'rejected' ? 'bg-red-500' :
                              car.status !== 'pending' ? 'bg-green-500' : 
                              'bg-yellow-500'
                            }`} />
                            <div className="ml-2 text-sm font-medium text-gray-300">
                              {car.status === 'pending' ? 'Verification Pending' :
                               car.status === 'verification' ? 'Under Review' :
                               car.status === 'available' ? 'Listed' :
                               car.status === 'sold' ? 'Sold' :
                               car.status === 'rejected' ? 'Rejected' :
                               'Processing'}
                            </div>
                          </div>
                        </div>
                        {car.price > 0 && car.status !== 'pending' && (
                          <div className="hidden md:block text-right">
                            <div className="text-lg font-medium text-white">₹{Number(car.price || 0).toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-400">Listed Price</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>You haven't listed any cars for sale yet.</p>
                  <Link to="/sell-car" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                    List your first car
                  </Link>
                </div>
              )}
            </div>
          )}

          {currentUser?.role === 'normalUser' && (
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Your Requests</h3>
                <div className="text-sm text-gray-400">{requestsLoading ? 'Loading...' : `${requestsList.length} requests`}</div>
              </div>

              {requestsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-600"></div>
                </div>
              ) : requestsList.length === 0 ? (
                <div className="p-6 text-gray-400">You have not created any requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {requestsList.map((r) => (
                    <div key={r._id} className="flex items-center justify-between p-4 bg-[#0b1220] border border-gray-700 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-300 font-medium">{r.brand || 'Any Brand'} {r.model ? `- ${r.model}` : ''}</div>
                        <div className="text-xs text-gray-400 mt-1">{r.vehicleType || ''} • {r.transmission || ''}</div>
                        <div className="text-xs text-gray-400 mt-1">Requested: {r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-300 mr-2">{r.status || 'active'}</div>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this request?')) return;
                            try {
                              const res = await fetch(`/backend/request-car/${r._id}`, { method: 'DELETE', credentials: 'include' });
                              if (res.status === 401) { handleSessionExpired(); return; }
                              const json = await res.json();
                              if (res.ok && json && json.success) {
                                setRequestsList((prev) => prev.filter(x => x._id !== r._id));
                              } else {
                                alert(json?.message || 'Failed to delete request');
                              }
                            } catch (err) {
                              console.error('Delete request failed', err);
                              alert('Failed to delete request');
                            }
                          }}
                          className="text-sm text-red-400 hover:text-red-300 px-3 py-1 border border-red-700 rounded"
                        >Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
};

export default Profile;
