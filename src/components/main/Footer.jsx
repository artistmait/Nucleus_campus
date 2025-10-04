export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Left */}
        <p className="text-sm">&copy; {new Date().getFullYear()} TeamNucleus. All rights reserved.</p>

        {/* Center */}
        <div className="flex space-x-6 my-3 md:my-0">
          <a href="#" className="hover:text-indigo-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-300 transition-colors">Support</a>
        </div>

        {/* Right */}
        <div className="text-sm font-bold">
          Nucleus
        </div>
      </div>
    </footer>
  );
}
