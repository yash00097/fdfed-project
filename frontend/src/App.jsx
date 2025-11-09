import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AboutUs from './pages/AboutUs';
import Reviews from './pages/Reviews';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import SellCar from './pages/SellCar';
import AgentAcceptance from './pages/AgentAcceptance';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import RequestCar from './pages/requestCar';
import Notification from './pages/Notification';
import CarDetails from './pages/CarDetails';
import AgentPieChart from './pages/AgentPieChart';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminDetailsPage from './pages/AdminDetailsPage';
import UserDetailsPage from './pages/UserDetailsPage';
import BuyCar from './pages/BuyCar';
import PurchaseSuccess from './pages/PurchaseSuccess';

import ForgotPassword from './pages/ForgotPassword';
import VerifyCar from './pages/VerifyCar';


export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp  />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route path="/sell-car" element={<SellCar />} />
            <Route path="/AgentAcceptance" element={<AgentAcceptance />} />
            <Route path="/verifyCar" element={<VerifyCar />} />
            <Route path="/request" element={<RequestCar />} />
            <Route path="/agent/stats" element={<AgentPieChart />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/details" element={<AdminDetailsPage />} />
            <Route path="/user/:id" element={<UserDetailsPage />} />
            <Route path="/notifications" element={<Notification />} />
        </Route>
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/buy/:id" element={<BuyCar />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
