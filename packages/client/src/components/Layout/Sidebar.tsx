import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import GardenLogo from '../../assets/garden-black-text-logo.png';
import { 
  Home, 
  FileText, 
  Folder, 
  Search,
  Shield,
  FileCode,
  Database,
  BarChart
} from 'lucide-react';

const navItems = [
  { icon: <Home size={24} />, label: 'Dashboard', path: '/' },
  { icon: <FileText size={24} />, label: 'Documents', path: '/documents' },
  { icon: <Folder size={24} />, label: 'Groups', path: '/groups' },
  { icon: <Search size={24} />, label: 'Search', path: '/search' },
];

export function Sidebar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  
  return (
    <div className="w-16 md:w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 p-4">
        <img 
          src={GardenLogo} 
          alt="Garden Logo" 
          className="h-8 md:h-10" 
        />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-primary-50 group ${
                    isActive ? 'bg-primary-50 text-primary-100' : ''
                  }`}
                >
                  <div className={`${isActive ? 'text-primary-100' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <span className="ml-3 hidden md:block font-nunitoSans font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-col items-center md:items-start">
          <div className="text-sm text-gray-500 hidden md:block">Logged in as</div>
          <div className="font-nunitoSans font-semibold">Garden</div>
        </div>
      </div>
    </div>
  );
}
