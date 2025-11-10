'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface CurrentUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'reporter'
  created_at: string
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show sidebar on login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch current user info
  useEffect(() => {
    if (!isLoginPage) {
      fetchCurrentUser()
    }
  }, [isLoginPage])

  const fetchCurrentUser = async () => {
    try {
      setUserLoading(true)
      const response = await fetch('/api/admin/me')
      const data = await response.json()
      
      if (data.success) {
        setCurrentUser(data.data)
      } else {
        // Redirect to login if no valid session
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      router.push('/admin/login')
    } finally {
      setUserLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Error during logout:', error)
      router.push('/admin/login')
    }
  }

  const getRoleLabel = (role: string): string => {
    return role === 'admin' ? 'Süper Admin' : 
           role === 'manager' ? 'Yönetici' : 
           role === 'reporter' ? 'Reporter' : role
  }

  const getPanelTitle = (role: string): string => {
    return role === 'admin' ? 'Admin Paneli' : 
           role === 'manager' ? 'Yönetici Paneli' : 
           role === 'reporter' ? 'Raporlama Paneli' : 'Admin Paneli'
  }

  const getRoleBadge = (role: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    if (role === 'admin') {
      return `${baseClasses} bg-red-100 text-red-800`
    } else if (role === 'manager') {
      return `${baseClasses} bg-purple-100 text-purple-800`
    } else if (role === 'reporter') {
      return `${baseClasses} bg-blue-100 text-blue-800`
    }
    return `${baseClasses} bg-gray-100 text-gray-800`
  }

  const getMenuItems = (userRole: string) => {
    const allItems = [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'reporter'] },
      { href: '/admin/registrations', label: 'Kayıtlar', icon: '📝', roles: ['admin', 'manager', 'reporter'] },
      { href: '/admin/registration-types', label: 'Kayıt Türleri', icon: '🏷️', roles: ['admin', 'manager'] },
      { href: '/admin/settings/exchange-rates', label: 'Döviz Kurları', icon: '💱', roles: ['admin', 'manager'] },
      { href: '/admin/settings/page', label: 'Sayfa Ayarları', icon: '🎨', roles: ['admin', 'manager'] },
      { href: '/admin/settings/registration', label: 'Kayıt Ayarları', icon: '📅', roles: ['admin', 'manager'] },
      { href: '/admin/settings/form-fields', label: 'Form Ayarları', icon: '📋', roles: ['admin', 'manager'] },
      { href: '/admin/settings/bank', label: 'Banka Ayarları', icon: '🏦', roles: ['admin', 'manager'] },
      { href: '/admin/registration-logs', label: 'Kayıt Logları', icon: '📜', roles: ['admin', 'manager'] },
      { href: '/admin/pos-logs', label: 'POS Logları', icon: '💳', roles: ['admin', 'manager'] },
      { href: '/admin/audit-logs', label: 'Sistem Logları', icon: '🔍', roles: ['admin'] },
      { href: '/admin/settings', label: 'Genel Ayarlar', icon: '⚙️', roles: ['admin'] },
    ]
    
    return allItems.filter(item => item.roles.includes(userRole))
  }

  const menuItems = getMenuItems(currentUser?.role || 'reporter')

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // If login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-16'
        } ${
          isMobile 
            ? (sidebarOpen ? 'fixed left-0 top-0 h-full shadow-xl' : 'hidden')
            : 'md:fixed md:h-screen'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Online Kayıt Sistemi</h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  {currentUser ? getPanelTitle(currentUser.role) : 'Panel'}
                </p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!sidebarOpen && 'justify-center'}`}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {sidebarOpen ? (
              <>
                {/* Current User Info */}
                {userLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : currentUser ? (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentUser.name || currentUser.email}
                      </p>
                      <span className={getRoleBadge(currentUser.role)}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                ) : null}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-xl mr-3">🚪</span>
                  <span>Çıkış Yap</span>
                </button>
              </>
            ) : (
              /* Collapsed Sidebar Footer */
              <div className="flex flex-col items-center space-y-2">
                {currentUser && (
                  <div 
                    className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                    title={`${currentUser.name || currentUser.email} (${getRoleLabel(currentUser.role)})`}
                  >
                    <span className="text-primary-600 font-semibold text-sm">
                      {(currentUser.name || currentUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Çıkış Yap"
                >
                  <span className="text-xl">🚪</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 min-h-screen ${
        !isMobile && sidebarOpen ? 'md:ml-64' : !isMobile && !sidebarOpen ? 'md:ml-16' : ''
      }`}>
        {/* Mobile Header */}
        {isMobile && (
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 fixed top-0 left-0 right-0">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">Online Kayıt Sistemi</h1>
                <p className="text-xs text-gray-600">
                  {currentUser ? getPanelTitle(currentUser.role) : 'Panel'}
                </p>
              </div>
            </div>
            
            {/* Mobile User Info */}
            {currentUser && (
              <div className="flex items-center space-x-2">
                <span className={getRoleBadge(currentUser.role)}>
                  {getRoleLabel(currentUser.role)}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Çıkış Yap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </header>
        )}

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 ${isMobile ? 'mt-16' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

