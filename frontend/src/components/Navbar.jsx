import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Navbar({ user, setUser, loading }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [barStyle, setBarStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-purple-600">TalentLink</span>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </nav>
    );
  }
  const navItems = user
    ? [
        { to: '/talent', label: 'Talent' },
        { to: '/projects', label: 'Browse Projects' },
        {
          to: user.role === 'client'
            ? '/dashboard/client'
            : '/dashboard/freelancer',
          label: 'Dashboard',
        },
         { to: '/profile', label: 'Profile' },
        { to: '/messages', label: 'Messages' },
        { to: '/contracts', label: 'Contracts' },
      ]
    : [
        { to: '/talent', label: 'Talent' },
        { to: '/projects', label: 'Browse Projects' },
        { to: '/signin', label: 'Sign In' },
      ];

  const handleNavHover = (e) => {
    const el = e.currentTarget;
    const containerLeft = containerRef.current?.getBoundingClientRect().left || 0;
    const elementLeft = el.getBoundingClientRect().left;
    setBarStyle({
      left: elementLeft - containerLeft,
      width: el.offsetWidth,
      opacity: 1,
    });
  };

  const handleNavLeave = () => {
    setBarStyle((s) => ({ ...s, opacity: 0 }));
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition no-underline"
        >
          TalentLink
        </Link>

        <div className="hidden md:flex gap-6 items-center">
          <div
            ref={containerRef}
            className="flex gap-6 items-center relative"
            onMouseLeave={handleNavLeave}
          >
            {navItems.map((item, i) => (
              <div
                key={i}
                className="relative py-1 cursor-pointer"
                onMouseEnter={handleNavHover}
              >
                <Link
                  to={item.to}
                  className="text-gray-700 font-medium transition-colors duration-300 hover:text-purple-700 no-underline"
                >
                  {item.label}
                </Link>
              </div>
            ))}

            <span
              className="absolute bottom-0 h-[3px] bg-purple-600 rounded-full transition-all duration-300 ease-out pointer-events-none"
              style={barStyle}
              aria-hidden="true"
            />
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium no-underline"
            >
              Logout
            </button>
          ) : (
              <Link to="/signup" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Sign Up
              </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-50 border-t p-4 space-y-2">
          {user ? (
            <>
              <Link to="/talent" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Talent
              </Link>
              <Link to="/projects" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Browse Projects
              </Link>
              <Link
                to={user.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer'}
                className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline"
              >
                Dashboard
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-purple-600 transition font-medium">
                Profile
              </Link>
              <Link to="/messages" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Messages
              </Link>
              <Link to="/contracts" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Contracts
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium mt-2 no-underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/talent" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Talent
              </Link>
              <Link to="/projects" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Browse Projects
              </Link>
              <Link to="/signin" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Sign In
              </Link>
              <Link to="/signup" className="block py-2 text-gray-700 hover:text-purple-600 font-medium no-underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
