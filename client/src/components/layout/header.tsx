import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header = ({ title, subtitle }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ['/api/users/current'],
  });
  
  return (
    <header className="glass sticky top-0 z-10 p-4 flex items-center justify-between border-b border-white/10">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-muted">{subtitle || `Welcome back, ${currentUser?.username || 'User'}`}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search skills..." 
            className="glass-input py-2 px-4 pr-10 rounded-lg text-sm w-60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="ri-search-line absolute right-3 top-2.5 text-muted"></i>
        </div>
        
        <div className="relative">
          <button className="relative p-2 text-muted hover:text-white transition-colors">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-1 right-1 bg-accent w-2 h-2 rounded-full"></span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-secondary/30 border border-secondary/50 flex items-center justify-center overflow-hidden">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="User avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-white">
                {currentUser?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
