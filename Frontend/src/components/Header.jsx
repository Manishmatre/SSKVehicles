import React, { useEffect, useState, Fragment, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Profile from "../assets/2.png"
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FiUser, FiLogOut, FiBell, FiBriefcase, FiSearch, FiMoon, FiSun, FiSettings, FiHelpCircle, FiCalendar, FiGrid, FiUsers, FiDollarSign, FiFileText, FiTruck, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New leave request from Rahul Sharma', time: '10 min ago', read: false },
    { id: 2, message: 'Payroll processing completed', time: '1 hour ago', read: false },
    { id: 3, message: 'New employee onboarding reminder', time: '3 hours ago', read: true },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSearch(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you would apply dark mode to the entire application
    toast.info(`${darkMode ? 'Light' : 'Dark'} mode activated`);
  };

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input changes with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim().length > 2) {
      setIsSearching(true);
      setShowSearchResults(true);
      
      // Debounce search to prevent too many API calls
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSearchResults(null);
      setIsSearching(false);
      setShowSearchResults(false);
    }
  };

  // Perform the actual search
  const performSearch = async (query) => {
    try {
      const token = localStorage.getItem('token');
      setIsSearching(true);
      
      // Try multiple API endpoints (local and deployed)
      let response = null;
      
      try {
        // First try local endpoint
        response = await axios.get(`http://localhost:7000/api/search?query=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 3000 // Short timeout to quickly fall back if local server is down
        });
        console.log('Local search successful');
      } catch (err) {
        console.log('Local API not available, trying deployed endpoint...');
        // Then try deployed endpoint
        response = await axios.get(`https://cbms-7muz.onrender.com/api/search?query=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Deployed search successful');
      }
      
      if (response && response.data && response.data.success) {
        console.log('Search results:', response.data.data);
        setSearchResults(response.data.data);
      } else {
        console.error('Search response format invalid:', response?.data);
        setSearchResults({
          employees: [],
          vehicles: [],
          users: [],
          leaveRequests: [],
          attendance: []
        });
      }
    } catch (error) {
      console.error('Error performing search:', error);
      // Return empty results instead of mock data
      setSearchResults({
        employees: [],
        vehicles: [],
        users: [],
        leaveRequests: [],
        attendance: []
      });
      
      // Show error message to user
      toast.error('Search failed. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };
  
  // Navigate to search result
  const navigateToResult = (url) => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
    setShowSearch(false);
    navigate(url);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({...notification, read: true})));
    toast.success('All notifications marked as read');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/hr-management')) {
      if (path.includes('/dashboard')) return 'HR Dashboard';
      if (path.includes('/employee-management')) return 'Employee Management';
      if (path.includes('/attendance-management')) return 'Attendance Management';
      if (path.includes('/payroll-management')) return 'Payroll Management';
      if (path.includes('/leave-management')) return 'Leave Management';
      return 'HR Management';
    }
    if (path.includes('/admin-dashboard')) return 'Admin Dashboard';
    if (path.includes('/profile')) return 'User Profile';
    return 'CBMS';
  };

  return (
    <div className={`w-full fixed top-0 left-0 h-16 z-50 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Main Header Container */}
      <div className={`h-full px-4 md:px-6 mx-auto flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        {/* Left Section: Logo and Page Title */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/admin-dashboard" className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <FiGrid className="text-white text-xl" />
            </div>
            <div className="ml-3">
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>CBMS</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Business Management</p>
            </div>
          </Link>
          
          {/* Current Page Title - Hidden on Mobile */}
          {!isMobile && (
            <div className={`hidden md:flex items-center px-4 py-1 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{getPageTitle()}</span>
            </div>
          )}
        </div>

        {/* Center Section: Search Bar (Expandable on Mobile) */}
        <div className={`${showSearch ? 'flex absolute left-0 right-0 top-0 bottom-0 px-4 items-center bg-white z-20' : 'hidden'} md:relative md:flex md:w-96 md:mx-4`} ref={searchResultsRef}>
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search across the system..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className={`w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none ${
                  darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200'
                } border`}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              {showSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setShowSearchResults(false);
                    setSearchResults(null);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults || isSearching) && (
                <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border`}>
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                      <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</p>
                    </div>
                  ) : searchResults ? (
                    <div>
                      {/* Employees Section */}
                      {searchResults.employees && searchResults.employees.length > 0 && (
                        <div>
                          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FiUsers className="inline mr-2" />Employees
                            </h3>
                          </div>
                          {searchResults.employees.map(result => (
                            <div 
                              key={`employee-${result.id}`}
                              onClick={() => navigateToResult(result.url)}
                              className={`px-4 py-2 cursor-pointer flex items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                {result.image ? (
                                  <img src={result.image} alt={result.title} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <FiUser className="text-blue-500" />
                                )}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle} • {result.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Vehicles Section */}
                      {searchResults.vehicles && searchResults.vehicles.length > 0 && (
                        <div>
                          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FiTruck className="inline mr-2" />Vehicles
                            </h3>
                          </div>
                          {searchResults.vehicles.map(result => (
                            <div 
                              key={`vehicle-${result.id}`}
                              onClick={() => navigateToResult(result.url)}
                              className={`px-4 py-2 cursor-pointer flex items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <FiTruck className="text-green-500" />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle} • {result.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Users Section */}
                      {searchResults.users && searchResults.users.length > 0 && (
                        <div>
                          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FiUser className="inline mr-2" />Users
                            </h3>
                          </div>
                          {searchResults.users.map(result => (
                            <div 
                              key={`user-${result.id}`}
                              onClick={() => navigateToResult(result.url)}
                              className={`px-4 py-2 cursor-pointer flex items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                <FiUser className="text-purple-500" />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle} • {result.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Leave Requests Section */}
                      {searchResults.leaveRequests && searchResults.leaveRequests.length > 0 && (
                        <div>
                          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FiCalendar className="inline mr-2" />Leave Requests
                            </h3>
                          </div>
                          {searchResults.leaveRequests.map(result => (
                            <div 
                              key={`leave-${result.id}`}
                              onClick={() => navigateToResult(result.url)}
                              className={`px-4 py-2 cursor-pointer flex items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                <FiCalendar className="text-yellow-500" />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle} • {result.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Attendance Section */}
                      {searchResults.attendance && searchResults.attendance.length > 0 && (
                        <div>
                          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <h3 className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              <FiClock className="inline mr-2" />Attendance
                            </h3>
                          </div>
                          {searchResults.attendance.map(result => (
                            <div 
                              key={`attendance-${result.id}`}
                              onClick={() => navigateToResult(result.url)}
                              className={`px-4 py-2 cursor-pointer flex items-center ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <FiClock className="text-red-500" />
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.subtitle} • {result.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* No Results */}
                      {Object.values(searchResults).every(category => category.length === 0) && (
                        <div className="p-4 text-center">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No results found for "{searchQuery}"</p>
                        </div>
                      )}
                      
                      {/* View All Results */}
                      {Object.values(searchResults).some(category => category.length > 0) && (
                        <div 
                          className={`px-4 py-3 text-center cursor-pointer ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-gray-50 hover:bg-gray-100 text-blue-600'}`}
                          onClick={() => {
                            toast.info('Advanced search view is coming soon!');
                            setShowSearchResults(false);
                          }}
                        >
                          <p className="text-sm font-medium">View all results</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Section: Action Buttons and User Menu */}
        <div className="flex items-center space-x-1 md:space-x-4">
          {/* Search Button (Mobile Only) */}
          {isMobile && !showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} focus:outline-none`}
              title="Search"
            >
              <FiSearch className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          )}

          {/* Calendar Button */}
          <Link
            to="/hr-management/attendance-management/attendance-calendar"
            className={`hidden md:flex p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} focus:outline-none`}
            title="Calendar"
          >
            <FiCalendar className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`hidden md:flex p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} focus:outline-none`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <FiSun className="text-lg text-yellow-300" />
            ) : (
              <FiMoon className="text-lg text-gray-600" />
            )}
          </button>

          {/* Notifications Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className={`relative p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} focus:outline-none`}>
              <FiBell className={`text-lg ${notifications.some(n => !n.read) ? 'text-yellow-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className={`absolute right-0 mt-2 w-80 origin-top-right rounded-md shadow-lg focus:outline-none ${
                darkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
              }`}>
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Notifications</h3>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className={`text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} ${
                          notification.read ? '' : darkMode ? 'bg-gray-700' : 'bg-blue-50'
                        }`}
                      >
                        <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  )}
                  
                  <Link
                    to="/notifications"
                    className={`block text-center px-4 py-2 text-sm ${
                      darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    View all notifications
                  </Link>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User Menu */}
          <Menu as="div" className="relative ml-2">
            <Menu.Button className="flex items-center space-x-2 focus:outline-none">
              <div className="flex items-center">
                <div className="profile w-9 h-9 cursor-pointer rounded-full overflow-hidden border border-gray-300">
                  <img src={imagePreview || Profile} alt="Profile" className='w-full h-full object-cover'/>
                </div>
                {!isMobile && (
                  <div className="ml-2 text-left">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {profileData?.fullName || user?.fullName || 'Ss Kalra'}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                )}
                <ChevronDownIcon className={`h-4 w-4 ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </Menu.Button>

            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg focus:outline-none ${
                darkMode ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'
              }`}>
                {/* User Info Section */}
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Signed in as</p>
                  <p className="text-sm font-medium truncate text-gray-500">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
                
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`flex items-center px-4 py-2 text-sm ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-300'
                              : 'text-gray-700'
                        }`}
                      >
                        <FiUser className="mr-3 text-gray-400" size={16} />
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/company-profile"
                        className={`flex items-center px-4 py-2 text-sm ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-300'
                              : 'text-gray-700'
                        }`}
                      >
                        <FiBriefcase className="mr-3 text-gray-400" size={16} />
                        Company Profile
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`flex items-center px-4 py-2 text-sm ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-300'
                              : 'text-gray-700'
                        }`}
                      >
                        <FiSettings className="mr-3 text-gray-400" size={16} />
                        Settings
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/help"
                        className={`flex items-center px-4 py-2 text-sm ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                            : darkMode
                              ? 'text-gray-300'
                              : 'text-gray-700'
                        }`}
                      >
                        <FiHelpCircle className="mr-3 text-gray-400" size={16} />
                        Help & Support
                      </Link>
                    )}
                  </Menu.Item>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full text-left px-4 py-2 text-sm ${
                          active
                            ? darkMode
                              ? 'bg-gray-700 text-red-400'
                              : 'bg-gray-100 text-red-600'
                            : darkMode
                              ? 'text-red-400'
                              : 'text-red-600'
                        }`}
                      >
                        <FiLogOut className="mr-3 text-gray-400" size={16} />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Header;