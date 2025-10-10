import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { signOut } from "../redux/user/userSlice";

function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [isValid, setIsValid] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkTokenValidity = () => {
      try {
        if (!currentUser || !currentUser.token) return setIsValid(false);

        const decoded = jwtDecode(currentUser.token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          dispatch(signOut());
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (err) {
        console.error("Token validation failed:", err);
        setIsValid(false);
      }
    };

    checkTokenValidity();
  }, [currentUser, dispatch]);

  if (isValid === null) return null;

  return isValid ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export default PrivateRoute;
