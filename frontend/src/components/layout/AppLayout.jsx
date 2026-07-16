import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'
import { Activity, LayoutDashboard, Users, LogOut, ChevronRight } from 'lucide-react'

const navItems = [
  { to: '/log-interaction', icon: <LayoutDashboard size={16} />, label: 'Log Interaction' },
  { to: '/hcps', icon: <Users size={16} />, label: 'HCPs' },
]

export default function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="shrink-0 w-56 flex flex-col glass-card border-r border-navy-600/50 bg-navy-900/80">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl neural-gradient flex items-center justify-center shadow-glow-indigo">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">PharmaConnect</p>
              <p className="text-xs text-slate-600 mt-0.5">CRM Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-navy-700'
                }`
              }>
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-navy-700">
          <div className="flex items-center gap-2.5 px-2 mb-3">
            <div className="w-7 h-7 rounded-full neural-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.full_name?.[0] || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user?.full_name || 'Field Rep'}</p>
              <p className="text-xs text-slate-600 truncate">{user?.role || 'rep'}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}