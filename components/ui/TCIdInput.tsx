import { forwardRef } from 'react'
import { useTCIdInput } from '@/hooks/useTCIdInput'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TCIdInputProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  name?: string
  showValidationStatus?: boolean
}

/**
 * T.C. kimlik numarası girişi için özelleştirilmiş input bileşeni
 * Gerçek zamanlı doğrulama ve görsel durum göstergeleri içerir
 */
export const TCIdInput = forwardRef<HTMLInputElement, TCIdInputProps>(
  ({ 
    value = '', 
    onChange, 
    error, 
    placeholder = '12345678901', 
    className, 
    disabled = false,
    id,
    name,
    showValidationStatus = true,
    ...props 
  }, ref) => {
    const { 
      displayValue, 
      handleChange, 
      handleKeyDown, 
      validationStatus, 
      validationMessage, 
      isValid, 
      isComplete 
    } = useTCIdInput(value, onChange)

    // Validation icon'unu belirle
    const getValidationIcon = () => {
      if (!showValidationStatus || !isComplete) return null
      
      switch (validationStatus) {
        case 'valid':
          return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'invalid':
          return <XCircle className="w-5 h-5 text-red-500" />
        default:
          return null
      }
    }

    // Border rengini belirle
    const getBorderColor = () => {
      if (error) return 'border-red-300 focus:border-red-500 focus:ring-red-200'
      if (!isComplete) return 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
      if (isValid) return 'border-green-300 focus:border-green-500 focus:ring-green-200'
      return 'border-red-300 focus:border-red-500 focus:ring-red-200'
    }

    // Mesajın rengini belirle
    const getMessageColor = () => {
      if (error) return 'text-red-600'
      if (!isComplete) return 'text-gray-500'
      if (isValid) return 'text-green-600'
      return 'text-red-600'
    }

    // Gösterilecek mesajı belirle
    const getDisplayMessage = () => {
      if (error) return error
      if (!validationMessage) return ''
      return validationMessage
    }

    return (
      <div className="relative">
        {/* Input Container */}
        <div className="relative flex items-center">
          {/* Input Field */}
          <input
            ref={ref}
            id={id}
            name={name}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={11}
            className={cn(
              // Base styles
              'w-full px-4 py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2',
              // Dynamic border color
              getBorderColor(),
              // Disabled state
              disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              // Icon padding
              showValidationStatus && isComplete && 'pr-12',
              // Custom className
              className
            )}
            aria-describedby={`${id}-message`}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {/* Validation Icon */}
          {showValidationStatus && isComplete && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {getValidationIcon()}
            </div>
          )}
        </div>
        
        {/* Message */}
        <div 
          id={`${id}-message`}
          className={cn(
            'mt-1.5 text-sm transition-colors',
            getMessageColor()
          )}
          role={error || (isComplete && !isValid) ? 'alert' : 'status'}
          aria-live="polite"
        >
          {getDisplayMessage()}
        </div>
        
        {/* Progress Indicator */}
        {!isComplete && displayValue.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>İlerleme</span>
              <span>{displayValue.length}/11</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(displayValue.length / 11) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
)

TCIdInput.displayName = 'TCIdInput'