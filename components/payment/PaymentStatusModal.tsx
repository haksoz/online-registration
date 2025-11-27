'use client';

import { useEffect, useState } from 'react';

interface PaymentStatusModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: { code: string; message: string }) => void;
}

export default function PaymentStatusModal({
  isOpen,
  orderId,
  onClose,
  onSuccess,
  onError
}: PaymentStatusModalProps) {
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    // Ödeme durumunu kontrol et (polling)
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status/${orderId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setStatus('success');
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else if (data.status === 'failed') {
          setStatus('failed');
          onError({
            code: data.errorCode || 'UNKNOWN',
            message: data.errorMessage || 'Ödeme başarısız'
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // İlk kontrol
    checkPaymentStatus();

    // Her 3 saniyede bir kontrol et
    const interval = setInterval(checkPaymentStatus, 3000);

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(countdownInterval);
          onError({
            code: 'TIMEOUT',
            message: 'Ödeme zaman aşımına uğradı'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [isOpen, orderId, onSuccess, onError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {status === 'checking' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ödeme İşleniyor
            </h3>
            <p className="text-gray-600 mb-4">
              Lütfen bekleyin, ödemeniz kontrol ediliyor...
            </p>
            <p className="text-sm text-gray-500">
              Kalan süre: {countdown} saniye
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Ödeme Başarılı!
            </h3>
            <p className="text-gray-600">
              Ödemeniz başarıyla tamamlandı.
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Ödeme Başarısız
            </h3>
            <p className="text-gray-600 mb-4">
              Ödemeniz tamamlanamadı.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
