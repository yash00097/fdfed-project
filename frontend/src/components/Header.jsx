import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Bell, Home, Menu, X } from "lucide-react";
import logo from "../assets/images/logo1.png";
import ShinyText from '../react-bits/ShinyText/ShinyText.jsx';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const text = "Search by brand";
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Fetch unread notifications count
  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/backend/notification/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setPlaceholder("");
      return;
    }

    let i = 0;
    let typingForward = true;
    const interval = setInterval(() => {
      if (typingForward) {
        setPlaceholder(text.slice(0, i) + "|");
        i++;
        if (i > text.length) {
          typingForward = false;
          i = text.length;
        }
      } else {
        setPlaceholder(text.slice(0, i) + "|");
        i--;
        if (i < 0) {
          typingForward = true;
          i = 0;
        }
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isFocused]);

  const navLinkItems = (
    <>
      <li>
        <Link to="/inventory" className="block px-0 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
          <ShinyText text="Inventory" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
        </Link>
      </li>
      {currentUser?.role === "agent" && (
        <>
          <li>
            <Link to="/agent/stats" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="My Stats" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
          <li>
            <Link to="/AgentAcceptance" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Accept Car" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
          <li>
            <Link to="/verifyCar" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Verify Car" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
        </>
      )}
      {(!currentUser || currentUser?.role === "normalUser") && (
        <>
          <li>
            <Link to="/sell-car" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Sell" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
          <li>
            <Link to="/request" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Request" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
        </>
      )}
      {currentUser?.role === "admin" && (
        <>
          <li>
            <Link to="/user-requests" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Requests" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
          <li>
            <Link to="/admin-dashboard" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Hiring" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
          <li>
            <Link to="/admin/details" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
              <ShinyText text="Details" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
            </Link>
          </li>
        </>
      )}
      {currentUser?.role === "admin" && (
        <li>
          <Link to="/admin/analytics" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
            <ShinyText text="Analytics" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
          </Link>
        </li>
      )}
      <li>
        <Link to="/about-us" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
          <ShinyText text="AboutUs" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
        </Link>
      </li>
    </>
  );

  return (
    <header className="absolute top-0 left-0  w-full z-50 ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex-shrink-0">
            <Link to="/" className="block transform hover:scale-105 transition-transform duration-200">
              <img src={logo} width={120} height={120} alt="Logo" className="rounded-lg" />
            </Link>
          </div>

          <div className="flex-1 max-w-5xl ml-8">
            <nav className="relative bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative px-6 py-4">
                <div className="flex items-center justify-between">
                  <Link to="/" className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10">
                    <Home className="w-5 h-5 text-white" />
                  </Link>

                  <button onClick={toggleMenu} className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10">
                    {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                  </button>

                  {/* Desktop Navigation Menu */}
                  <div className="hidden lg:flex items-center space-x-1">
                    <ul className="flex space-x-1">
                      {navLinkItems}
                      <li className="hidden lg:block">
                        <form className="relative">
                          <input
                            type="search"
                            name="brand"
                            placeholder={placeholder}
                            className="w-64 px-4 py-2 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15 text-center"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        </form>
                      </li>
                    </ul>
                  </div>
                  <div className="hidden lg:flex items-center space-x-3">
                    {!currentUser ? (
                      <Link to="/sign-in" className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20">
                        <ShinyText text="SignUp/SignIn" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
                      </Link>
                    ) : (
                      <>
                        <Link to="/notifications" className="relative flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10">
                          <Bell className="w-5 h-5 text-white" />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link to="/profile">
                          <img className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-300" src={currentUser.avatar} alt="user" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden"}`}>
                  <div className="border-t border-white/20 pt-4">
                      <form className="relative mb-4">
                        <input
                          type="search"
                          name="brand"
                          placeholder={placeholder}
                          className="w-full px-4 py-3 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15 text-center"
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                    </form>
                    <ul className="space-y-2">
                      {navLinkItems}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {!currentUser ? (
                        <Link to="/sign-in" className="block w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-center rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20">
                          <ShinyText text="SignUp/SignIn" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/>
                        </Link>
                      ) : (
                        <div className="flex space-x-3">
                          <Link to="/notifications" className="relative flex-1 flex items-center justify-center py-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10">
                            <Bell className="w-5 h-5 text-white mr-2" />
                            <span className="text-white"><ShinyText text="Notifications" disabled={false} speed={5} className='custom-class' baseColor="rgba(255, 255, 255, 0.8)"/></span>
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link to="/profile">
                            <img className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-300" src={currentUser.avatar} alt="user" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
