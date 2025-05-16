import React from 'react';
import { useRouter, Link } from '@tanstack/react-router';
import { Plus, Bell, User } from 'lucide-react';
import { useCreateJobModal } from '../../store/modalStore';

export function Header() {
  const router = useRouter();
  const { open: openCreateJobModal } = useCreateJobModal();
  
  const getPageTitle = () => {
    const path = router.state.location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/documents')) return 'Documents';
    if (path.startsWith('/groups')) return 'Groups';
    if (path.startsWith('/search')) return 'Search';
    if (path.startsWith('/jobs')) return 'Jobs';
    return 'Garden';
  };
  
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <h1 className="text-2xl font-nunitoSans font-bold text-gray-900">
        {getPageTitle()}
      </h1>
      
      <div className="flex items-center gap-4">
        <button
          onClick={openCreateJobModal}
          className="flex items-center gap-2 bg-primary-100 hover:bg-primary-120 text-white py-2 px-4 rounded-md transition-colors duration-150"
        >
          <Plus size={16} />
          <span className="hidden md:inline">New Document</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
