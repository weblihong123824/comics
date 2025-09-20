import { Outlet } from 'react-router';
import Navigation from './Navigation';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Navigation isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-4 sticky top-0 z-20">
          <div className="flex-1 flex items-center">
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              title={isSidebarCollapsed ? "展开菜单" : "收起菜单"}
            >
              {isSidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}