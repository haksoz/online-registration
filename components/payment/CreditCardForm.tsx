'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PaymentFormData } from '@/schemas/validationSchemas';
import { useTranslation } from '@/hooks/useTranslation';

interface CreditCardFormProps {
  register: UseFormRegister<PaymentFormData>;
  errors: FieldErrors<PaymentFormData>;
}

export default function CreditCardForm({ register, errors }: CreditCardFormProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        {t('step3.cardInfo')}
      </h3>
      
      <div className="space-y-4">
        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step3.cardHolderName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('cardHolderName')}
            placeholder={t('payment.cardHolderPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
            maxLength={50}
          />
          {errors.cardHolderName && (
            <p className="mt-1.5 text-sm text-red-600">{errors.cardHolderName.message}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('step3.cardNumber')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('cardNumber')}
            placeholder={t('payment.cardNumberPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            maxLength={19}
            onChange={(e) => {
              // Format card number with spaces
              let value = e.target.value.replace(/\s/g, '');
              value = value.replace(/(\d{4})/g, '$1 ').trim();
              e.target.value = value;
            }}
          />
          {errors.cardNumber && (
            <p className="mt-1.5 text-sm text-red-600">{errors.cardNumber.message}</p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-500">Visa, Mastercard kabul edilir</span>
          </div>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('step3.cardExpiry')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('cardExpiry')}
              placeholder={t('payment.expiryPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              maxLength={5}
              onChange={(e) => {
                // Format expiry date
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
              }}
            />
            {errors.cardExpiry && (
              <p className="mt-1.5 text-sm text-red-600">{errors.cardExpiry.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('step3.cvv')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('cardCvv')}
              placeholder={t('payment.cvvPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              maxLength={4}
              onChange={(e) => {
                // Only numbers
                e.target.value = e.target.value.replace(/\D/g, '');
              }}
            />
            {errors.cardCvv && (
              <p className="mt-1.5 text-sm text-red-600">{errors.cardCvv.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{t('step3.cvvHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
