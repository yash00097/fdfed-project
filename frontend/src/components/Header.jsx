import { useState } from "react"
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Bell, Home, Menu, X, User } from "lucide-react"
import logo from "../assets/images/logo1.png"

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">

          <div className="flex-shrink-0">
            <Link to="/" className="block transform hover:scale-105 transition-transform duration-200">
              <img
                src={logo}
                width={120}
                height={120}
                alt="Logo"
                className="rounded-lg"
              />
            </Link>
          </div>

          <div className="flex-1 max-w-4xl ml-8">
            <nav className="relative bg-black/50 backdrop-blur-md rounded-2xl  border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative px-6 py-4">
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10"
                  >
                    <Home className="w-5 h-5 text-white" />
                  </Link>

                  <button
                    onClick={toggleMenu}
                    className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10"
                  >
                    {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                  </button>

                  <div className="hidden lg:flex items-center space-x-1">
                    <ul className="flex space-x-1">
                      <li>
                        <Link to="/inventory" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          Inventory
                        </Link>
                      </li>
                      {currentUser && currentUser.role === "agent" && (
                        <li>
                          <Link to="/approval" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Approval
                          </Link>
                        </li>
                      )}
                      {currentUser && currentUser.role === "normalUser" && (
                        <>
                          <li>
                            <Link to="/sell" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </Link>
                          </li>
                          <li>
                            <Link to="/request" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </Link>
                          </li>
                        </>
                      )}
                      {currentUser && currentUser.role === "admin" && (
                        <>
                          <li>
                            <Link to="/user-requests" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Requests
                            </Link>
                          </li>
                          <li>
                            <Link to="/admin-dashboard" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Hiring
                            </Link>
                          </li>
                          <li>
                            <Link to="/host/details" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Details
                            </Link>
                          </li>
                        </>
                      )}
                      {!currentUser && (
                        <>
                          <li>
                            <Link to="/sell" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </Link>
                          </li>
                          <li>
                            <Link to="/request" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <Link to="/about-us" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          About Us
                        </Link>
                      </li>
                      <li className="hidden lg:block">
                        <form className="relative">
                          <input
                            type="search"
                            name="brand"
                            placeholder="Search by brand"
                            className="w-64 px-4 py-2 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15 text-center"
                          />
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        </form>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="hidden lg:flex items-center space-x-3">
                    {!currentUser ? (
                      <Link
                        to="/sign-in"
                        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20"
                      >
                        SignUp/SignIn
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/notifications"
                          className="relative flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10"
                        >
                          <Bell className="w-5 h-5 text-white" />
                        </Link>
                        <Link
                          to="/profile"
                        >
                          <img
                          className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-300"
                          src={currentUser.avatar}
                          alt="user"
                          />
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div
                  className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden"}`}
                >
                  <div className="border-t border-white/20 pt-4">
                    <ul className="space-y-2">
                      <li>
                        <Link to="/inventory" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          Inventory
                        </Link>
                      </li>
                      {currentUser && currentUser.role === "agent" && (
                        <li>
                          <Link to="approval" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Approval
                          </Link>
                        </li>
                      )}
                      {currentUser && currentUser.role === "normalUser" && (
                        <>
                          <li>
                            <Link to="/sell" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </Link>
                          </li>
                          <li>
                            <Link to="/request" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </Link>
                          </li>
                        </>
                      )}
                      {currentUser && currentUser.role === "admin" && (
                        <>
                          <li>
                            <Link to="/user-requests" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Requests
                            </Link>
                          </li>
                          <li>
                            <Link to="/admin-dashboard" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Hiring
                            </Link>
                          </li>
                          <li>
                            <Link to="/host/details" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Details
                            </Link>
                          </li>
                        </>
                      )}
                      {!currentUser && (
                        <>
                          <li>
                            <Link to="/sell" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </Link>
                          </li>
                          <li>
                            <Link to="/request" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </Link>
                          </li>
                        </>
                      )}
                      <li>
                        <Link to="/aboutUs" className="block px-4 py-2 text-gray-100 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          About Us
                        </Link>
                      </li>
                    </ul>
                    
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {!currentUser ? (
                        <Link
                          to="/sign-in"
                          className="block w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-center rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20"
                        >
                          SignUp/SignIn
                        </Link>
                      ) : (
                        <div className="flex space-x-3">
                          <Link
                            to="/notifications"
                            className="relative flex-1 flex items-center justify-center py-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10"
                          >
                            <Bell className="w-5 h-5 text-white mr-2" />
                            <span className="text-white">Notifications</span>
                          </Link>
                          <Link
                            to="/profile"
                          >
                            <img
                              className="w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-300"
                              src={currentUser.avatar}
                              alt="user"
                            />
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
  )
}
