import { useState, useEffect } from "react";
import { Atom, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load role_id from localStorage (set after login)
    const storedRole = localStorage.getItem("role_id");
    setRoleId(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    localStorage.removeItem("user_id");
    navigate("/auth/login");
  };

  //Role-based navigation logic
  const handleHomeClick = () => {
    if (roleId === "1" || roleId === '4') navigate("/student/dashboard");
    else if (roleId === "2") navigate("/incharge/dashboard");
    else if(roleId ==='3') navigate("/higher-authority/dashboard");
    else navigate("/");
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer flex flex-row gap-2 py-2"
            onClick={handleHomeClick}
          >
            <Atom className="size-7" />
            <span className="text-2xl font-extrabold tracking-wide">NUCLEUS</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={handleHomeClick}
              className="hover:text-indigo-300 transition-colors font-semibold"
            >
              Home
            </button>
            <a href="#" className="hover:text-indigo-300 transition-colors font-semibold">
              About
            </a>
            <a href="#" className="hover:text-indigo-300 transition-colors font-semibold">
              Profile
            </a>
          </div>

          {/* Logout */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogout}
              className="text-white hover:text-indigo-300 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 px-4 pb-4 space-y-2">
          <button onClick={handleHomeClick} className="block hover:text-indigo-300">
            Home
          </button>
          <a href="#" className="block hover:text-indigo-300">
            About
          </a>
          <a href="#" className="block hover:text-indigo-300">
            Profile
          </a>
          <button onClick={handleLogout} className="block hover:text-indigo-300">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
