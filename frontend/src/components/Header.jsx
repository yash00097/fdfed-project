"use client"

import { useState } from "react"
import { Search, Bell, User, Home, Menu, X } from "lucide-react"

export default function Navbar({ currentUser = null, unreadNotifications = 0, query = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(query.brand || "")

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)


  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-x">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-black/60"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 backdrop-blur-sm">
        <div className="flex items-center justify-between py-4">
          <div className="flex-shrink-0">
            <a href="/" className="block transform hover:scale-105 transition-transform duration-200">
              <img
                src="../src/assets/images/logo1.png"
                width={120}
                height={120}
                alt="Logo"
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </a>
          </div>

          
          <div className="flex-1 max-w-4xl ml-8">
            <nav className="relative bg-black/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative px-6 py-4">
                <div className="flex items-center justify-between">
                  <a
                    href="/"
                    className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10"
                  >
                    <Home className="w-5 h-5 text-white" />
                  </a>

                  <button
                    onClick={toggleMenu}
                    className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10"
                  >
                    {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                  </button>

                  
                  <div className="hidden lg:flex items-center space-x-1">
                    <ul className="flex space-x-1">
                      <li>
                        <a href="/inventory" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          Inventory
                        </a>
                      </li>
                      {currentUser && currentUser.role === "agent" && (
                        <li>
                          <a href="/agent/approval" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Approval
                          </a>
                        </li>
                      )}
                      {currentUser && currentUser.role === "normalUser" && (
                        <>
                          <li>
                            <a href="/sell" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </a>
                          </li>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </a>
                          </li>
                        </>
                      )}
                      {currentUser && currentUser.role === "admin" && (
                        <>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Requests
                            </a>
                          </li>
                          <li>
                            <a href="/admin-dashboard" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Hiring
                            </a>
                          </li>
                          <li>
                            <a href="/host/details" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Details
                            </a>
                          </li>
                        </>
                      )}
                      {!currentUser && (
                        <>
                          <li>
                            <a href="/sell" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </a>
                          </li>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </a>
                          </li>
                        </>
                      )}
                      <li>
                        <a href="/aboutUs" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          About Us
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="hidden lg:block">
                    <form action="/inventory" method="GET" className="relative">
                      <input
                        type="search"
                        name="brand"
                        placeholder="Search by brand"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-64 px-4 py-2 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </form>
                  </div>

                  <div className="hidden lg:flex items-center space-x-3">
                    {!currentUser ? (
                      <a
                        href="/sign-in"
                        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20"
                      >
                        SignUp/SignIn
                      </a>
                    ) : (
                      <>
                        <a
                          href="/notifications"
                          className="relative flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10"
                        >
                          <Bell className="w-5 h-5 text-white" />
                          {unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full animate-pulse shadow-lg">
                              {unreadNotifications}
                            </span>
                          )}
                        </a>
                        <a
                          href="/profile"
                          className="flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 transform hover:scale-110 border border-white/10"
                        >
                          <User className="w-5 h-5 text-white" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile Navigation Menu (Refactored) */}
                <div
                  className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 overflow-hidden"}`}
                >
                  <div className="border-t border-white/20 pt-4">
                    <ul className="space-y-2">
                      <li>
                        <a href="/inventory" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          Inventory
                        </a>
                      </li>
                      {currentUser && currentUser.role === "agent" && (
                        <li>
                          <a href="/agent/approval" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Approval
                          </a>
                        </li>
                      )}
                      {currentUser && currentUser.role === "normalUser" && (
                        <>
                          <li>
                            <a href="/sell" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </a>
                          </li>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </a>
                          </li>
                        </>
                      )}
                      {currentUser && currentUser.role === "admin" && (
                        <>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Requests
                            </a>
                          </li>
                          <li>
                            <a href="/admin-dashboard" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Hiring
                            </a>
                          </li>
                          <li>
                            <a href="/host/details" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Details
                            </a>
                          </li>
                        </>
                      )}
                      {!currentUser && (
                        <>
                          <li>
                            <a href="/sell" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Sell
                            </a>
                          </li>
                          <li>
                            <a href="/request" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                              Request
                            </a>
                          </li>
                        </>
                      )}
                      <li>
                        <a href="/aboutUs" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 transform hover:scale-105">
                          About Us
                        </a>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <form action="/inventory" method="GET" className="relative">
                        <input
                          type="search"
                          name="brand"
                          placeholder="Search by brand"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="w-full px-4 py-2 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 hover:bg-white/15"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
                      </form>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      {!currentUser ? (
                        <a
                          href="/sign-in"
                          className="block w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-center rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium backdrop-blur-sm border border-red-400/20"
                        >
                          SignUp/SignIn
                        </a>
                      ) : (
                        <div className="flex space-x-3">
                          <a
                            href="/notifications"
                            className="relative flex-1 flex items-center justify-center py-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10"
                          >
                            <Bell className="w-5 h-5 text-white mr-2" />
                            <span className="text-white">Notifications</span>
                            {unreadNotifications > 0 && (
                              <span className="ml-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full animate-pulse shadow-lg">
                                {unreadNotifications}
                              </span>
                            )}
                          </a>
                          <a
                            href="/profile"
                            className="flex-1 flex items-center justify-center py-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/10"
                          >
                            <User className="w-5 h-5 text-white mr-2" />
                            <span className="text-white">Profile</span>
                          </a>
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

      {/* Embedded CSS (unchanged) */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}