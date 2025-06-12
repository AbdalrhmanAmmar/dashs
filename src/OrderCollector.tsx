import React, { useState, useEffect } from 'react';
import { Check, X, Package, Store, Calendar, DollarSign } from 'lucide-react';

interface Order {
  id: number;
  date: string;
  pharmacy: string;
  medicine: string;
  quantity: number;
  price?: number;
  totalPrice?: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function OrderCollector() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleStatusChange = (id: number, newStatus: 'approved' | 'rejected') => {
    const updatedOrders = orders.map(order => {
      if (order.id === id) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // تجميع الطلبيات حسب الصيدلية والتاريخ
  const groupedOrders = orders.reduce((acc, order) => {
    const key = `${order.pharmacy}-${order.date}`;
    if (!acc[key]) {
      acc[key] = {
        pharmacy: order.pharmacy,
        date: order.date,
        orders: [],
        totalAmount: 0,
        status: order.status
      };
    }
    acc[key].orders.push(order);
    acc[key].totalAmount += order.totalPrice || 0;
    return acc;
  }, {} as Record<string, {
    pharmacy: string;
    date: string;
    orders: Order[];
    totalAmount: number;
    status: string;
  }>);

  const handleGroupStatusChange = (groupKey: string, newStatus: 'approved' | 'rejected') => {
    const group = groupedOrders[groupKey];
    const updatedOrders = orders.map(order => {
      if (order.pharmacy === group.pharmacy && order.date === group.date) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">محصل الطلبيات</h2>
        
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبيات</h3>
            <p className="text-gray-500">لم يتم الموافقة على أي طلبيات من المحصل المالي بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([groupKey, group]) => (
              <div key={groupKey} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Store className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{group.pharmacy}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {group.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {group.orders.length} صنف
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {group.totalAmount.toFixed(2)} ريال
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        group.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.status === 'pending' ? 'قيد الانتظار' :
                         group.status === 'approved' ? 'تم التوريد' :
                         'تم الرفض'}
                      </span>
                      {group.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGroupStatusChange(groupKey, 'approved')}
                            className="text-green-600 hover:text-green-900 ml-2"
                            title="تأكيد التوريد"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleGroupStatusChange(groupKey, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                            title="رفض الطلبية"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الدواء
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الكمية
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المجموع
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              {order.medicine}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.price ? `${order.price.toFixed(2)} ريال` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {order.totalPrice ? `${order.totalPrice.toFixed(2)} ريال` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status === 'pending' ? 'قيد الانتظار' :
                               order.status === 'approved' ? 'تم التوريد' :
                               'تم الرفض'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {order.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusChange(order.id, 'approved')}
                                  className="text-green-600 hover:text-green-900 ml-2"
                                  title="تأكيد التوريد"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                  title="رفض الصنف"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}