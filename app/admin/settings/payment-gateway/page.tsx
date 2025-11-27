'use client';

import { useState, useEffect } from 'react';
import { PaymentGateway } from '@/types/payment';

export default function PaymentGatewaySettings() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/admin/payment-gateways');
      const data = await response.json();
      if (data.success) {
        setGateways(data.data);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/payment-gateways/${id}/toggle`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        fetchGateways();
        alert('Aktif ödeme sistemi güncellendi');
      }
    } catch (error) {
      console.error('Error toggling gateway:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;

    try {
      const response = await fetch('/api/admin/payment-gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGateway)
      });

      const data = await response.json();
      if (data.success) {
        fetchGateways();
        setEditingGateway(null);
        alert('Kayıt başarılı');
      }
    } catch (error) {
      console.error('Error saving gateway:', error);
      alert('Bir hata oluştu');
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sanal POS Ayarları</h1>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Banka
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shop Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Test Modu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gateways.map((gateway) => (
              <tr key={gateway.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {gateway.gateway_name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {gateway.shop_code || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    gateway.test_mode 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {gateway.test_mode ? 'Test' : 'Production'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(gateway.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      gateway.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gateway.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingGateway(gateway)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingGateway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingGateway.gateway_name} Ayarları
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Code / Mağaza Kodu
                </label>
                <input
                  type="text"
                  value={editingGateway.shop_code || ''}
                  onChange={(e) => setEditingGateway({
                    ...editingGateway,
                    shop_code: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="SHOPCODE123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant ID (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={editingGateway.merchant_id || ''}
                  onChange={(e) => setEditingGateway({
                    ...editingGateway,
                    merchant_id: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Password / Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={(editingGateway as any).merchant_pass || ''}
                    onChange={(e) => setEditingGateway({
                      ...editingGateway,
                      merchant_pass: e.target.value
                    } as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    placeholder="Merchant şifrenizi girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terminal ID (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={editingGateway.terminal_id || ''}
                  onChange={(e) => setEditingGateway({
                    ...editingGateway,
                    terminal_id: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="test_mode"
                  checked={editingGateway.test_mode}
                  onChange={(e) => setEditingGateway({
                    ...editingGateway,
                    test_mode: e.target.checked
                  })}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="test_mode" className="ml-2 block text-sm text-gray-900">
                  Test Modu (Gerçek ödeme alınmaz)
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Önemli:</strong> Merchant şifreniz şifreli olarak saklanır. 
                  Production moduna geçmeden önce test modunda işlemleri test edin.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingGateway(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
