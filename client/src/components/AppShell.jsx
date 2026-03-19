import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon, Avatar } from './UI';
import { useFetch } from '../hooks/useFetch';
import { alertAPI } from '../services/api';

const NAV = [
  { section: 'Intelligence' },
  { to: '/',             label: "Today's work",  Icon: Icon.Today,     badge: 'actions' },
  { to: '/chat',         label: 'AI Chat',        Icon: Icon.Chat },
  { to: '/alerts',       label: 'Alerts',         Icon: Icon.Bell,      badge: 'alerts' },
  { to: '/simulator',    label: 'Simulator',      Icon: Icon.Simulator },
  { section: 'Customers' },
  { to: '/customers',    label: 'All customers',  Icon: Icon.Customers },
  { to: '/add-customer', label: 'Add customer',   Icon: Icon.AddUser },
  { section: 'Operations' },
  { to: '/transactions', label: 'Transactions',   Icon: Icon.Txn },
  { to: '/audit',        label: 'Compliance & Audit', Icon: Icon.Shield },
  { section: 'Management' },
  { to: '/branch',       label: 'Branch view',    Icon: Icon.Branch },
  { to: '/training',     label: 'RM Training',    Icon: Icon.Training },
];

export default function AppShell() {
  const { rm, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: alerts } = useFetch(
    useCallback(() => alertAPI.list(), [])
  );
  const unreadCount = alerts?.filter(a => !a.read).length || 0;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/customers?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-w">WealthOS</div>
          <div className="sidebar-logo-s">Edelweiss</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item, i) => {
            if (item.section) {
              return <div key={i} className="nav-section">{item.section}</div>;
            }
            const badgeCount = item.badge === 'alerts' ? unreadCount : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.Icon />
                {item.label}
                {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-user">
          <Avatar name={rm?.name || ''} size={28} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-1)' }}>{rm?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{rm?.role?.toUpperCase()} · {rm?.branch}</div>
          </div>
          <button
            onClick={logout}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ink-5)', fontSize: 11, cursor: 'pointer' }}
            title="Sign out"
          >⏻</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title" id="page-title">WealthOS</div>

          <div className="search-box">
            <Icon.Search />
            <input
              placeholder="Search customers, funds…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          {/* Alerts bell */}
          <div className="alert-bell" onClick={() => navigate('/alerts')} title="Alerts">
            <Icon.Bell />
            {unreadCount > 0 && <div className="alert-dot" />}
          </div>

          <button className="btn btn-dark" onClick={() => navigate('/add-customer')}>
            + Add customer
          </button>
        </header>

        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
