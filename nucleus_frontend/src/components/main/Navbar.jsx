import { useState } from "react";
import { Atom, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-indigo-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
             {/* Right: Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-extrabold tracking-wide flex flex-row gap-2 py-2"><Atom className="size-7 space-x-4"/> NUCELUS</span>
          </div>
          

          {/* Middle: Links */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="hover:text-indigo-300 transition-colors font-semibold">About</a>
            <a href="#" className="hover:text-indigo-300 transition-colors font-semibold">My Dashboard</a>
            <a href="#" className="hover:text-indigo-300 transition-colors font-semibold">Profile</a>
          </div>

         {/* Left: Sign Out */}
          <div className="flex-shrink-0">
            <button className="text-white hover:text-indigo-300 transition-colors font-medium">
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 px-4 pb-4 space-y-2">
          <a href="#" className="block hover:text-indigo-300">Sign Out</a>
          <a href="#" className="block hover:text-indigo-300">About</a>
          <a href="#" className="block hover:text-indigo-300">My Dashboard</a>
          <a href="#" className="block hover:text-indigo-300">Profile</a>
        </div>
      )}
    </nav>
  );
}
