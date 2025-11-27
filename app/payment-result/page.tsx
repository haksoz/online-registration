'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentResult() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    setStatus(searchParams.get('status') || '');
    setMessage(searchParams.get('message') || '');
    setOrderId(searchParams.get('orderId') || '');
  }, [searchParams]);

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          } mb-4`}>
            {isSuccess ? (
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-2 ${
            isSuccess ? 'text-green-900' : 'text-red-900'
          }`}>
            {isSuccess ? 'Ödeme Başarılı!' : 'Ödeme Başarısız'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message || (isSuccess 
              ? 'Ödemeniz başarıyla tamamlandı.' 
              : 'Ödemeniz tamamlanamadı. Lütfen tekrar deneyin.'
            )}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Sipariş Numarası</p>
              <p className="text-lg font-mono font-semibold text-gray-900">{orderId}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {isSuccess ? (
              <>
                <Link
                  href="/"
                  className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
                <button
                  onClick={() => window.print()}
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Makbuz Yazdır
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.history.back()}
                  className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Tekrar Dene
                </button>
                <Link
                  href="/"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
              </>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Sorun yaşıyorsanız lütfen bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
