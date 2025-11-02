import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import SellCar from './pages/SellCar';
import Approval from './pages/Approval';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import RequestCar from './pages/requestCar';
import CarDetails from './pages/Cardetails';
import AgentPieChart from './pages/AgentPieChart';
import AdminAnalytics from './pages/AdminAnalytics';


export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp  />} />
        <Route path="/about" element={<About />} />
        <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route path="/sell-car" element={<SellCar />} />
            <Route path="/approval" element={<Approval />} />
            <Route path="/request" element={<RequestCar />} />
            <Route path="/agent/stats" element={<AgentPieChart />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/car/:id" element={<CarDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
