import React from "react";
import { Link, useLocation } from "react-router-dom";
import Profile from "../assets/2.png";
import {
  FiGrid, 
  FiUsers, 
  FiTruck, 
  FiFileText, 
  FiDollarSign, 
  FiSettings, 
  FiUser, 
  FiBriefcase
} from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({});
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = React.useState(false); 

  React.useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Ensure sidebar is not open on desktop
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to determine if a submenu item is active
  const isSubMenuActive = (path, subItem) => {
    if (!path) return false;
    
    // Handle finance management submenu items with special logic
    if (subItem && subItem.id) {
      switch (subItem.id) {
        case 'finance-dashboard':
          // Only highlight dashboard when exactly on /finance-management
          return location.pathname === '/finance-management';
          
        case 'add-transaction':
          // Only highlight Add Transaction when exactly on that path
          return location.pathname === '/finance-management/add-transaction';
          
        case 'transactions':
          // Highlight Transactions for transaction list, detail, and edit pages
          return location.pathname === '/finance-management/transactions' ||
                 location.pathname.startsWith('/finance-management/transaction/') ||
                 location.pathname.startsWith('/finance-management/edit-transaction/');
          
        case 'reports':
          // Only highlight Reports when on reports page
          return location.pathname === '/finance-management/reports';
      }
    }
    
    // For transaction detail and edit paths
    if (path === '/finance-management/transaction') {
      return location.pathname.startsWith('/finance-management/transaction/') && 
             !location.pathname.startsWith('/finance-management/edit-transaction/');
    }
    
    if (path === '/finance-management/edit-transaction') {
      return location.pathname.startsWith('/finance-management/edit-transaction/');
    }
    
    // Exact match
    if (location.pathname === path) return true;
    
    // For other paths, use the default startsWith behavior
    return location.pathname.startsWith(path);
  };

  // Auto-expand menu when submenu link is active
  React.useEffect(() => {
    const activeMenu = SidebarMenu.find(menu => {
      // For menu items with submenu, check if any submenu path matches or if pathname starts with submenu path
      if (menu.submenu) {
        return menu.submenu.some(subItem => 
          location.pathname === subItem.path || 
          // For nested routes like /finance-management/transaction/123
          isSubMenuActive(subItem.path, subItem)
        );
      }
      // For menu items without submenu, check if path matches exactly or if pathname starts with path
      return menu.path === location.pathname || 
             (menu.path && location.pathname.startsWith(menu.path));
    });

    if (activeMenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [activeMenu.title]: true
      }));
    }
  }, [location.pathname]);

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const SidebarMenu = [
    {
      title: "Dashboard",
      path: "/admin-dashboard",
      icon: <FiGrid size={18} />,
    },
    {
      title: "Company Profile",
      path: "/company-profile",
      icon: <FiBriefcase size={18} />,
    },
    {
      title: "HR Management",
      icon: <FiUsers size={18} />,
      submenu: [
        { title: "HR Dashboard", path: "/hr-management/dashboard" },
        // Employee Management
        { title: "Employee Management", path: "/hr-management/employee-management", isSubHeader: true },
        { title: "Add Employee", path: "/hr-management/employee-management/add-employee" },
        { title: "Employee List", path: "/hr-management/employee-management/employee-list" },
        { title: "Employee Documents", path: "/hr-management/employee-management/employee-documents" },
        { title: "Employee Assets", path: "/hr-management/employee-management/employee-assets" },
        // Attendance Management
        { title: "Attendance Management", path: "/hr-management/attendance-management", isSubHeader: true },
        { title: "Dashboard", path: "/hr-management/attendance-management/dashboard" },
        { title: "Mark Attendance", path: "/hr-management/attendance-management/attendance" },
        { title: "Attendance Reports", path: "/hr-management/attendance-management/attendance-report" },
        { title: "Attendance Analytics", path: "/hr-management/attendance-management/attendance-analytics" },
        { title: "Attendance Calendar", path: "/hr-management/attendance-management/attendance-calendar" },
        { title: "Attendance Settings", path: "/hr-management/attendance-management/attendance-settings" },
        // Leave Management
        { title: "Leave Management", path: "/hr-management/leave-management", isSubHeader: true },
        { title: "Leave Applications", path: "/hr-management/leave-management/leave-applications" },
        { title: "Leave Types", path: "/hr-management/leave-management/leave-types" },
        { title: "Leave Calendar", path: "/hr-management/leave-management/leave-calendar" },
        { title: "Leave Reports", path: "/hr-management/leave-management/leave-reports" },
        // Payroll Management
        { title: "Payroll Management", path: "/hr-management/payroll-management", isSubHeader: true },
        { title: "Process Payroll", path: "/hr-management/payroll-management/payroll" },
        { title: "Salary Structures", path: "/hr-management/payroll-management/salary-structure" },
        { title: "Payroll Reports", path: "/hr-management/payroll-management/payroll-reports" },
        { title: "Payroll Detail", path: "/hr-management/payroll-management/payroll-detail" },
        { title: "Payroll Settings", path: "/hr-management/payroll-management/payroll-settings" },
        // Department & Designation
        { title: "Organization", path: "/hr-management/department-management", isSubHeader: true },
        { title: "Departments", path: "/hr-management/department-management/departments" },
        { title: "Designations", path: "/hr-management/department-management/designations" },
        { title: "Organization Chart", path: "/hr-management/department-management/organization-chart" }
      ]
    },
    {
      title: "Employee Portal",
      icon: <FiUser size={18} />,
      submenu: [
        { title: "Employee Dashboard", path: "/employee-dashboard" },
        { title: "Request Leave", path: "/request-leave" },
        { title: "Submit Timesheet", path: "/submit-timesheet" },
        { title: "View Payslip", path: "/view-payslip" }
      ]
    },
    {
      title: "Vehicles & Machines",
      icon: <FiTruck size={18} />,
      submenu: [
        { title: "Vehicles Dashboard", path: "/vehicles-dashboard" },
        { title: "Add Vehicle", path: "/add-vehicle" },
        { title: "Vehicle List", path: "/all-vehicles" },
        { title: "Insurance", path: "/vehicle-insurance" },
        { title: "Fuel Records", path: "/fuel-consumption" },
        { title: "Documents", path: "/vehicle-documents" },
        { title: "Vehicle Reports", path: "/vehicle-reports" },
        { title: "Vehicle Settings", path: "/vehicle-settings" },
        { title: "Track Vehicle", path: "/track-vehicle" },
      ]
    },
    {
      title: "Finance",
      icon: <FiDollarSign size={18} />,
      submenu: [
        { title: "Finance Dashboard", path: "/finance-management", id: "finance-dashboard" },
        { title: "Add Transaction", path: "/finance-management/add-transaction", id: "add-transaction" },
        { title: "Transactions", path: "/finance-management/transactions", id: "transactions" },
        { title: "Reports", path: "/finance-management/reports", id: "reports" },
      ]
    },
    {
      title: "Document Management",
      icon: <FiFileText size={18} />,
      path: "/docfile-management"
    },
    {
      title: "Settings",
      icon: <FiSettings size={18} />,
      path: "/settings"
    },
  ];

  return (
    <>
      {/* Hamburger for mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 bg-gray-800 text-white rounded-md shadow-md md:hidden focus:outline-none"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}



      {/* Semi-transparent overlay for mobile click-outside-to-close */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <ul
        className={`bg-gray-900 w-72 pt-4 h-full fixed md:relative z-50 transition-all duration-300 ease-in-out md:translate-x-0 shadow-xl overflow-y-auto
          ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        `}
        style={{ top: 0, left: 0, maxHeight: '100vh' }}
        onClick={e => e.stopPropagation()} // Prevent overlay click from closing when clicking inside sidebar
      >
        {/* User Profile Summary */}
        <li className="flex items-center px-6 py-4 border-b border-gray-700">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={Profile} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@example.com</p>
          </div>
        </li>
        {/* Close button for mobile */}
        {isMobile && sidebarOpen && (
          <button
            className="absolute top-4 right-4 text-gray-300 hover:text-white z-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {SidebarMenu.map((item, index) => (
          <React.Fragment key={index}>
            <li
              className={`w-full transition-all duration-200 ease-in-out ${
                (location.pathname === item.path || 
                 (item.path && location.pathname.startsWith(item.path)) ||
                 (item.submenu?.some(subItem => location.pathname.startsWith(subItem.path))))
                ? 'bg-gradient-to-r from-blue-800 to-blue-700 border-l-4 border-blue-300 shadow-md'
                : 'hover:bg-gray-800 hover:border-l-4 hover:border-blue-200'
              }`}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)} // Close sidebar on mobile when clicking a link
                  className={`flex items-center px-6 py-2 text-sm font-medium ${location.pathname === item.path
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                    }`}
                >
                  <span className={`mr-3 transition-colors duration-300 ${location.pathname === item.path
                      ? 'text-blue-300'
                      : 'text-gray-400 hover:text-blue-300'
                    }`}>
                    {item.icon}
                  </span>
                  <span className="transition-all duration-300">
                    {item.title}
                  </span>
                </Link>
              ) : (
                <div
                  className={`flex items-center px-6 py-3 text-sm font-medium cursor-pointer ${expandedMenus[item.title]
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  onClick={() => toggleMenu(item.title)}
                >
                  <span className={`mr-3 transition-colors duration-300 ${expandedMenus[item.title]
                      ? 'text-blue-300'
                      : 'text-gray-400 hover:text-blue-300'
                    }`}>
                    {item.icon}
                  </span>
                  <span className="transition-all duration-300 flex-1">
                    {item.title}
                  </span>
                  <span className={`transform transition-transform duration-300 ${expandedMenus[item.title] ? 'rotate-90' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              )}
            </li>

            {item.submenu && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedMenus[item.title] ? 'max-h-[2000px]' : 'max-h-0'
                  }`}
              >
                <ul className="bg-gray-800 pl-4 pb-1">
                  {item.submenu.map((subItem, subIndex) => (
                    subItem.isSubHeader ? (
                      <li key={subIndex} className="w-full">
                        <div className="px-4 py-1 text-xs font-semibold text-blue-400 uppercase tracking-wider mt-3 mb-1">
                          {subItem.title}
                        </div>
                      </li>
                    ) : (
                      <li
                        key={subIndex}
                        className={`w-full transition-all duration-200 ease-in-out rounded-md mx-1 ${
                          isSubMenuActive(subItem.path, subItem)
                            ? 'bg-gradient-to-r from-blue-700 to-blue-600 border-l-4 border-blue-200 shadow-sm'
                            : 'hover:bg-gray-700 hover:border-l-4 hover:border-blue-100'
                        }`}
                      >
                        <Link
                          to={subItem.path}
                          onClick={() => isMobile && setSidebarOpen(false)} // Close sidebar on mobile when clicking a link
                          className={`flex items-center px-4 py-1.5 text-sm font-medium ${
                            isSubMenuActive(subItem.path, subItem)
                              ? 'text-white font-semibold'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {isSubMenuActive(subItem.path, subItem) ? (
                            <span className="w-2 h-2 rounded-full bg-blue-300 mr-3"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-500 mr-3"></span>
                          )}
                          <span className="transition-all duration-300">
                            {subItem.title}
                          </span>
                        </Link>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </React.Fragment>
        ))}
      </ul>
    </>
  );
};

export default Sidebar;
