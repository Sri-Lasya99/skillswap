import { Link, useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const navItems = [
    { icon: "ri-home-4-line", label: "Dashboard", path: "/" },
    { icon: "ri-user-line", label: "Profile", path: "/profile" },
    { icon: "ri-group-line", label: "Matches", path: "/matches" },
    { icon: "ri-message-3-line", label: "Messages", path: "/messages" },
    { icon: "ri-trophy-line", label: "Leaderboard", path: "/leaderboard" },
    { icon: "ri-upload-cloud-line", label: "Upload Content", path: "/upload" },
  ];
  
  return (
    <div className="glass-nav w-20 md:w-64 h-full fixed left-0 top-0 z-10 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center md:justify-start p-4 md:p-6 border-b border-white/10">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h1 className="hidden md:block text-xl font-bold text-white ml-3">SkillSwap</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "text-white bg-gradient-to-r from-primary/20 to-transparent"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <i className={`${item.icon} text-lg md:mr-3 ${isActive(item.path) ? "text-primary" : ""}`}></i>
                <span className="hidden md:block">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <a href="#" className="flex items-center p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors">
          <i className="ri-settings-3-line text-lg md:mr-3"></i>
          <span className="hidden md:block">Settings</span>
        </a>
        <a href="#" className="flex items-center p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors">
          <i className="ri-logout-box-line text-lg md:mr-3"></i>
          <span className="hidden md:block">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
