import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Store, Package, DollarSign, Calendar } from 'lucide-react';

interface PharmacyVisit {
  id: number;
  date: string;
  pharmacy: string;
  medicine?: string;
  quantity?: number;
  amount?: number;
  type: 'collection' | 'order';
  status: 'pending' | 'approved' | 'rejected';
}

export default function PharmacyReports() {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  const visits = useMemo(() => {
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    return savedCollections.filter((visit: PharmacyVisit) => {
      const visitDate = new Date(visit.date);
      const [year, month] = selectedMonth.split('-');
      return (
        visitDate.getFullYear() === parseInt(year) &&
        visitDate.getMonth() === parseInt(month) - 1
      );
    });
  }, [selectedMonth]);

  const stats = useMemo(() => {
    const pharmacyVisits = new Set(visits.map(v => v.pharmacy)).size;
    const totalCollections = visits
      .filter(v => v.type === 'collection')
      .reduce((sum, v) => sum + (v.amount || 0), 0);
    
    const medicineQuantities = visits
      .filter(v => v.type === 'order')
      .reduce((acc, v) => {
        if (v.medicine && v.quantity) {
          acc[v.medicine] = (acc[v.medicine] || 0) + v.quantity;
        }
        return acc;
      }, {} as Record<string, number>);

    const approvedCollections = visits
      .filter(v => v.type === 'collection' && v.status === 'approved')
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    const pendingCollections = visits
      .filter(v => v.type === 'collection' && v.status === 'pending')
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    return {
      pharmacyVisits,
      totalCollections,
      medicineQuantities,
      approvedCollections,
      pendingCollections
    };
  }, [visits]);

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">تقرير زيارات الصيدليات</h1>
          <div className="flex items-center gap-4">
            <label className="text-gray-700">اختر الشهر:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">الصيدليات</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.pharmacyVisits}</p>
            <p className="text-gray-600 mt-2">عدد الصيدليات التي تمت زيارتها</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">التحصيلات</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.totalCollections} ريال</p>
            <p className="text-gray-600 mt-2">إجمالي المبالغ المحصلة</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">الطلبيات</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(stats.medicineQuantities).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-gray-600 mt-2">إجمالي الأدوية المطلوبة</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">حالة التحصيل</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معتمد:</span>
                <span className="font-bold text-green-600">{stats.approvedCollections} ريال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">قيد الانتظار:</span>
                <span className="font-bold text-yellow-600">{stats.pendingCollections} ريال</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">تفاصيل التحصيل</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits
                    .filter(visit => visit.type === 'collection')
                    .map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.pharmacy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.amount} ريال</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            visit.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {visit.status === 'pending' ? 'قيد الانتظار' :
                             visit.status === 'approved' ? 'تم الموافقة' :
                             'تم الرفض'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">تفاصيل الطلبيات</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدواء</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visits
                    .filter(visit => visit.type === 'order')
                    .map((visit) => (
                      <tr key={visit.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.pharmacy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.medicine}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            visit.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {visit.status === 'pending' ? 'قيد الانتظار' :
                             visit.status === 'approved' ? 'تم الموافقة' :
                             'تم الرفض'}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}