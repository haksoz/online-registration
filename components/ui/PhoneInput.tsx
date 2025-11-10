import { forwardRef } from 'react'
import { usePhoneInput } from '@/hooks/usePhoneInput'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  name?: string
}

/**
 * Türkiye telefon numarası girişi için özelleştirilmiş input bileşeni
 * Otomatik +90 prefix'i ve maskeleme özelliği içerir
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ 
    value = '', 
    onChange, 
    error, 
    placeholder = '555 123 4567', 
    className, 
    disabled = false,
    id,
    name,
    ...props 
  }, ref) => {
    const { displayValue, handleChange, handleKeyDown, isValid } = usePhoneInput(value, onChange)

    return (
      <div className="relative">
        {/* Input Container */}
        <div className="relative flex items-center">
          {/* +90 Prefix */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium pointer-events-none z-10">
            +90
          </div>
          
          {/* Input Field */}
          <input
            ref={ref}
            id={id}
            name={name}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full pl-12 pr-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2',
              // Normal state
              'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
              // Error state
              error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
              // Disabled state
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              // Custom className
              className
            )}
            {...props}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {!error && (
          <p className="mt-1.5 text-xs text-gray-500">
            Cep telefonu numaranızı girin (5XX XXX XXXX)
          </p>
        )}
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'