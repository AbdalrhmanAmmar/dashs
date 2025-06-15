import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Package, Store, Calendar, DollarSign, Edit, Printer, Save } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface Order {
  id: number;
  date: string;
  pharmacy: string;
  medicine: string;
  quantity: number;
  price?: number;
  totalPrice?: number;
  status: 'pending' | 'approved' | 'rejected';
  groupId?: string;
}

interface EditableOrder extends Order {
  isEditing?: boolean;
  originalQuantity?: number;
}

export default function OrderCollector() {
  const [orders, setOrders] = useState<EditableOrder[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders.map((order: Order) => ({
      ...order,
      isEditing: false,
      originalQuantity: order.quantity
    })));
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

  const handleEdit = (id: number) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, isEditing: true } : order
    ));
  };

  const handleSaveEdit = (id: number) => {
    const updatedOrders = orders.map(order => {
      if (order.id === id) {
        return { 
          ...order, 
          isEditing: false,
          totalPrice: (order.price || 0) * order.quantity,
          originalQuantity: order.quantity
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleCancelEdit = (id: number) => {
    setOrders(orders.map(order => 
      order.id === id ? { 
        ...order, 
        isEditing: false,
        quantity: order.originalQuantity || order.quantity
      } : order
    ));
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, quantity: newQuantity } : order
    ));
  };

  // تجميع الطلبيات حسب الصيدلية والتاريخ
  const groupedOrders = orders.reduce((acc, order) => {
    const key = order.groupId || `${order.pharmacy}-${order.date}`;
    if (!acc[key]) {
      acc[key] = {
        groupId: key,
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
    groupId: string;
    pharmacy: string;
    date: string;
    orders: EditableOrder[];
    totalAmount: number;
    status: string;
  }>);

  const handleGroupStatusChange = (groupKey: string, newStatus: 'approved' | 'rejected') => {
    const group = groupedOrders[groupKey];
    const updatedOrders = orders.map(order => {
      if (order.groupId === group.groupId || 
          (order.pharmacy === group.pharmacy && order.date === group.date)) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handlePrintGroup = (groupKey: string) => {
    const group = groupedOrders[groupKey];
    // Set the group to print and trigger print
    setTimeout(() => handlePrint(), 100);
  };

  const safeToLocaleString = (value: number | undefined) => {
    return (value || 0).toLocaleString();
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">محصل الطلبيات</h2>
        
        {Object.keys(groupedOrders).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبيات</h3>
            <p className="text-gray-500">لم يتم إرسال أي طلبيات من نموذج زيارة الصيدلية بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([groupKey, group]) => (
              <div key={groupKey} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{group.pharmacy}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                            {safeToLocaleString(group.totalAmount)} ريال
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        group.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.status === 'pending' ? 'قيد الانتظار' : 
                         group.status === 'approved' ? 'تم التوريد' : 'تم الرفض'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrintGroup(groupKey)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="طباعة الطلبية"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {group.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleGroupStatusChange(groupKey, 'approved')} 
                              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="تأكيد التوريد"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleGroupStatusChange(groupKey, 'rejected')} 
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="رفض الطلبية"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
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
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              {order.medicine}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.price ? `${safeToLocaleString(order.price)} ريال` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={order.quantity}
                                onChange={(e) => handleQuantityChange(order.id, parseInt(e.target.value) || 1)}
                                className="w-20 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              order.quantity
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {order.totalPrice ? `${safeToLocaleString(order.totalPrice)} ريال` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status === 'pending' ? 'قيد الانتظار' :
                               order.status === 'approved' ? 'تم التوريد' : 'تم الرفض'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {order.isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(order.id)}
                                    className="text-green-600 hover:text-green-900 ml-2 p-1 hover:bg-green-50 rounded transition-colors"
                                    title="حفظ التعديل"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancelEdit(order.id)}
                                    className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                                    title="إلغاء التعديل"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {order.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleEdit(order.id)}
                                        className="text-blue-600 hover:text-blue-900 ml-2 p-1 hover:bg-blue-50 rounded transition-colors"
                                        title="تعديل الكمية"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(order.id, 'approved')}
                                        className="text-green-600 hover:text-green-900 ml-2 p-1 hover:bg-green-50 rounded transition-colors"
                                        title="تأكيد التوريد"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(order.id, 'rejected')}
                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                        title="رفض الصنف"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={3} className="px-6 py-4 text-right text-gray-900">
                          الإجمالي:
                        </td>
                        <td className="px-6 py-4 text-right text-green-600 font-bold">
                          {safeToLocaleString(group.totalAmount)} ريال
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Print Component */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="p-8 max-w-4xl mx-auto bg-white" dir="rtl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">طلبية صيدلية</h1>
              <div className="text-gray-600">تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</div>
            </div>
            
            {Object.entries(groupedOrders).map(([groupKey, group]) => (
              <div key={groupKey} className="mb-8">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>اسم الصيدلية:</strong> {group.pharmacy}
                    </div>
                    <div>
                      <strong>تاريخ الطلبية:</strong> {group.date}
                    </div>
                    <div>
                      <strong>عدد الأصناف:</strong> {group.orders.length}
                    </div>
                    <div>
                      <strong>المبلغ الإجمالي:</strong> {safeToLocaleString(group.totalAmount)} ريال
                    </div>
                  </div>
                </div>
                
                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-right">الدواء</th>
                      <th className="border border-gray-300 p-3 text-right">السعر</th>
                      <th className="border border-gray-300 p-3 text-right">الكمية</th>
                      <th className="border border-gray-300 p-3 text-right">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.orders.map((order, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">{order.medicine}</td>
                        <td className="border border-gray-300 p-3">{safeToLocaleString(order.price || 0)} ريال</td>
                        <td className="border border-gray-300 p-3">{order.quantity}</td>
                        <td className="border border-gray-300 p-3">{safeToLocaleString(order.totalPrice || 0)} ريال</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="border border-gray-300 p-3 text-right">الإجمالي:</td>
                      <td className="border border-gray-300 p-3">{safeToLocaleString(group.totalAmount)} ريال</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            
            <div className="mt-12 flex justify-between">
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <div>توقيع المندوب</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <div>توقيع المستلم</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}