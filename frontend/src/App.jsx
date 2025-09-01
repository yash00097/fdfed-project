import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import SellCar from './pages/SellCar';
import Layout from './components/Layout';


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
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}