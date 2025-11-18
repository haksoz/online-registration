'use client'

import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { E164Number } from 'libphonenumber-js/core'

interface InternationalPhoneInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

export function InternationalPhoneInput({
  id,
  value,
  onChange,
  error,
  placeholder = 'Telefon numarası',
  disabled = false
}: InternationalPhoneInputProps) {
  return (
    <div className="w-full">
      <PhoneInput
        id={id}
        international
        countryCallingCodeEditable={false}
        defaultCountry="TR"
        value={value as E164Number}
        onChange={(value) => onChange(value || '')}
        disabled={disabled}
        placeholder={placeholder}
        className={`phone-input-container ${error ? 'phone-input-error' : ''}`}
        numberInputProps={{
          className: `w-full px-4 py-3 border rounded-r-lg transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
          }`
        }}
        countrySelectProps={{
          className: 'country-select'
        }}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      
      <style jsx global>{`
        .phone-input-container {
          display: flex;
          align-items: stretch;
          gap: 0;
        }
        
        .phone-input-container .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0.75rem 0.5rem;
          border: 1px solid #d1d5db;
          border-right: none;
          border-radius: 0.5rem 0 0 0.5rem;
          background: #f9fafb;
          transition: all 0.2s;
          min-width: 80px;
        }
        
        .phone-input-container .PhoneInputCountry:hover {
          border-color: #0284c7;
        }
        
        .phone-input-container .PhoneInputCountry:focus-within {
          border-color: #0284c7;
          ring: 2px;
          ring-color: rgba(2, 132, 199, 0.2);
        }
        
        .phone-input-container .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: 0.5rem;
        }
        
        .phone-input-container .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          outline: none;
        }
        
        .phone-input-container .PhoneInputCountrySelectArrow {
          width: 0.5rem;
          height: 0.5rem;
          margin-left: 0.25rem;
          opacity: 0.5;
        }
        
        .phone-input-container .PhoneInputInput {
          flex: 1;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
        }
        
        /* Alan kodu input içinde görünmesin */
        .phone-input-container input[type="tel"] {
          padding-left: 1rem !important;
        }
        
        .phone-input-error .PhoneInputCountry {
          border-color: #fca5a5;
        }
        
        .phone-input-error .PhoneInputCountry:focus-within {
          border-color: #ef4444;
          ring-color: rgba(239, 68, 68, 0.2);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .phone-input-container .PhoneInputCountry {
            background: #1f2937;
            border-color: #374151;
          }
          
          .phone-input-container .PhoneInputCountrySelect {
            color: #f3f4f6;
          }
        }
      `}</style>
    </div>
  )
}
