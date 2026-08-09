import { UserButton } from '@clerk/clerk-react';
import { NavLink, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
          <span className="brand-mark">JT</span>
          <span>JT-Code</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/app/chat">Chat</NavLink>
          <NavLink to="/app/files">Files</NavLink>
          <NavLink to="/app/settings">Settings</NavLink>
        </nav>
        <div className="sidebar-footer">
          <UserButton showName />
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
