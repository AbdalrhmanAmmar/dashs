import React, { useState, useRef } from 'react';
import { Check, X, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PharmacyReceipt from './components/PharmacyReceipt';

interface Collection {
  id: number;
  date: string;
  pharmacy: string;
  amount?: number;
  receiptNumber?: string;
  medicine?: string;
  quantity?: number;
  products?: Array<{ medicine: string; quantity: number; price: number }>;
  type: 'collection' | 'order';
  status: 'pending' | 'approved' | 'rejected';
  groupId?: string;
}

const FinancialCollector: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>(() => {
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    return savedCollections.map((collection: Collection) => {
      if (collection.type === 'order' && !collection.groupId) {
        return {
          ...collection,
          groupId: `${collection.pharmacy}-${collection.date}`
        };
      }
      return collection;
    });
  });
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const handleStatusChange = (id: number, newStatus: 'approved' | 'rejected') => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === id) {
        return { ...collection, status: newStatus };
      }
      return collection;
    });
    setCollections(updatedCollections);
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
  };

  const handleGroupStatusChange = (groupId: string, newStatus: 'approved' | 'rejected') => {
    const updatedCollections = collections.map(collection => {
      if (collection.type === 'order' && collection.groupId === groupId) {
        if (newStatus === 'approved') {
          const orders = JSON.parse(localStorage.getItem('orders') || '[]');
          orders.push({
            id: Date.now(),
            date: collection.date,
            pharmacy: collection.pharmacy,
            medicine: collection.medicine,
            quantity: collection.quantity,
            status: 'pending'
          });
          localStorage.setItem('orders', JSON.stringify(orders));
        }
        return { ...collection, status: newStatus };
      }
      return collection;
    });
    setCollections(updatedCollections);
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
  };

  // Separate financial collections and orders
  const financialCollections = collections.filter(c => c.type === 'collection');
  
  // Group orders by pharmacy and date
  const groupedOrders = collections
    .filter(c => c.type === 'order')
    .reduce((acc, order) => {
      const key = `${order.pharmacy}-${order.date}`;
      if (!acc[key]) {
        acc[key] = {
          pharmacy: order.pharmacy,
          date: order.date,
          orders: [],
          status: order.status
        };
      }
      acc[key].orders.push(order);
      return acc;
    }, {} as Record<string, { pharmacy: string; date: string; orders: Collection[]; status: string }>);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">المحصل المالي</h2>

        {/* Financial Collections Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">التحصيلات المالية</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الإيصال</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialCollections.map((collection) => (
                  <tr key={collection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.amount} ريال</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.receiptNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        collection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        collection.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {collection.status === 'pending' ? 'قيد الانتظار' :
                         collection.status === 'approved' ? 'تم الموافقة' :
                         'تم الرفض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {collection.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(collection.id, 'approved')}
                              className="text-green-600 hover:text-green-900 ml-2"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(collection.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCollection(collection);
                            setTimeout(handlePrint, 100);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">تحصيل الطلبيات</h3>
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([groupId, group]) => (
              <div key={groupId} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{group.pharmacy}</h4>
                    <p className="text-sm text-gray-500">تاريخ الطلب: {group.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      group.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      group.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {group.status === 'pending' ? 'قيد الانتظار' :
                       group.status === 'approved' ? 'تم الموافقة' :
                       'تم الرفض'}
                    </span>
                    {group.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGroupStatusChange(groupId, 'approved')}
                          className="text-green-600 hover:text-green-900 ml-2"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleGroupStatusChange(groupId, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنتج</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.medicine}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div ref={receiptRef}>
          {selectedCollection && (
            <PharmacyReceipt
              pharmacyName={selectedCollection.pharmacy}
              date={selectedCollection.date}
              amount={selectedCollection.amount || 0}
              representativeName="محمد أحمد"
              receiverName="أحمد محمد"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCollector;