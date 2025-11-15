'use client'

import Link from 'next/link'

export default function SettingsPage() {
  const settingsItems = [
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Admin kullanıcılarını yönet, rol ata ve yetkileri düzenle',
      href: '/admin/settings/users',
      icon: '👥',
      color: 'bg-blue-500'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-1">Sistem ayarlarını ve kullanıcı yönetimini buradan yapabilirsiniz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start space-x-4">
              <div className={`${item.color} p-3 rounded-lg text-white text-xl group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
              Yönet
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}