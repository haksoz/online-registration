'use client'

import { useState, useEffect } from 'react'
import FormWizard from '@/components/wizard/FormWizard'
import { fetchPageSettings, type PageSettings } from '@/constants/pageSettings'
import { useFormStore } from '@/store/formStore'

export default function Home() {
  const [pageSettings, setPageSettings] = useState<PageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { formData } = useFormStore()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchPageSettings()
        setPageSettings(settings)
      } catch (error) {
        console.error('Error loading page settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  if (loading) {
    return (
      <main>
        <div className="text-center py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
        <FormWizard />
      </main>
    )
  }

  // Check if header should be displayed
  const hasHeaderContent = pageSettings?.form_title || pageSettings?.form_subtitle || pageSettings?.banner_image_url

  // Get background style
  const getBackgroundStyle = () => {
    if (pageSettings?.banner_image_url) {
      return {
        backgroundImage: `url(${pageSettings.banner_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    
    // Use custom color or default gradient
    const bgColor = pageSettings?.header_background_color || '#667eea'
    return {
      background: `linear-gradient(135deg, ${bgColor} 0%, ${adjustColor(bgColor, -20)} 100%)`
    }
  }

  // Helper to darken color for gradient
  const adjustColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section with Background Image - Contained */}
      {hasHeaderContent && (
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className="relative w-full rounded-lg overflow-hidden shadow-lg min-h-[240px] flex items-center justify-center"
              style={getBackgroundStyle()}
            >
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center py-8 md:py-10 px-4 md:px-8">
                {pageSettings?.form_title && (
                  <h1 
                    className="font-bold text-white mb-2 md:mb-3 drop-shadow-2xl animate-fade-in leading-tight"
                    style={{ fontSize: `${pageSettings.header_title_font_size || 48}px` }}
                  >
                    {formData.formLanguage === 'en' ? pageSettings.form_title_en || pageSettings.form_title : pageSettings.form_title}
                  </h1>
                )}
                {pageSettings?.form_subtitle && (
                  <p 
                    className="text-white/95 max-w-3xl mx-auto drop-shadow-lg font-medium leading-snug"
                    style={{ fontSize: `${pageSettings.header_subtitle_font_size || 24}px` }}
                  >
                    {formData.formLanguage === 'en' ? pageSettings.form_subtitle_en || pageSettings.form_subtitle : pageSettings.form_subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Wizard with Warning */}
      <div className={`pb-8 px-4 sm:px-6 lg:px-8 ${hasHeaderContent ? '-mt-12' : 'pt-8'} relative z-20`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            {/* Progress Indicator & Form Content */}
            <FormWizard />

            {/* General Warning Message at Bottom */}
            {pageSettings?.form_general_warning && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-amber-800 font-medium">
                      {formData.formLanguage === 'en' ? pageSettings.form_general_warning_en || pageSettings.form_general_warning : pageSettings.form_general_warning}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

