import { Link, NavLink } from 'react-router-dom';
import RobotFace from './RobotFace.jsx';
import { getToken } from '../api.js';

export default function Layout({ children }) {
  const link = ({ isActive }) => (isActive ? 'text-gold' : 'text-zinc-400 hover:text-gold');
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <RobotFace size={28} /> DoAide <em className="not-italic text-gold">Comply</em>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <NavLink to="/pricing" className={link}>Pricing</NavLink>
            <NavLink to="/blog" className={link}>Blog</NavLink>
            <NavLink to="/widget" className={link}>Widget</NavLink>
            <Link to={getToken() ? '/dashboard' : '/login'} className="btn !py-1.5">{getToken() ? 'Dashboard' : 'Log in'}</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        Dates are statutory defaults for FY 2026-27 and exclude government extensions. Verify with your CA before filing.
        <br />&copy; DoAide Comply
      </footer>
    </div>
  );
}
