import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Package, 
  Store, 
  Calendar, 
  Search, 
  Filter,
  Download,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface MissingItem {
  id: string;
  date: string;
  pharmacy: string;
  medicine: string;
  quantityMissing: number;
  originalQuantity: number;
  groupId: string;
}

export default function MissingItems() {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pharmacyFilter, setPharmacyFilter] = useState('');
  const [medicineFilter, setMedicineFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<MissingItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const savedMissingItems = JSON.parse(localStorage.getItem("missingItems") || "[]");
    setMissingItems(savedMissingItems);
  }, []);

  const filteredItems = useMemo(() => {
    return missingItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pharmacy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesPharmacy = !pharmacyFilter || item.pharmacy === pharmacyFilter;
      const matchesMedicine = !medicineFilter || item.medicine === medicineFilter;

      return matchesSearch && matchesDate && matchesPharmacy && matchesMedicine;
    });
  }, [missingItems, searchTerm, dateFilter, pharmacyFilter, medicineFilter]);

  const uniquePharmacies = useMemo(() => {
    return Array.from(new Set(missingItems.map(item => item.pharmacy)));
  }, [missingItems]);

  const uniqueMedicines = useMemo(() => {
    return Array.from(new Set(missingItems.map(item => item.medicine)));
  }, [missingItems]);

  const stats = useMemo(() => {
    const totalMissingItems = missingItems.length;
    const totalMissingQuantity = missingItems.reduce((sum, item) => sum + item.quantityMissing, 0);
    const affectedPharmacies = new Set(missingItems.map(item => item.pharmacy)).size;
    const mostAffectedMedicine = missingItems.reduce((acc, item) => {
      acc[item.medicine] = (acc[item.medicine] || 0) + item.quantityMissing;
      return acc;
    }, {} as Record<string, number>);

    const topMissingMedicine = Object.entries(mostAffectedMedicine)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalMissingItems,
      totalMissingQuantity,
      affectedPharmacies,
      topMissingMedicine: topMissingMedicine ? topMissingMedicine[0] : 'لا يوجد',
      topMissingQuantity: topMissingMedicine ? topMissingMedicine[1] : 0
    };
  }, [missingItems]);

  const handleDeleteItem = (id: string) => {
    const updatedItems = missingItems.filter(item => item.id !== id);
    setMissingItems(updatedItems);
    localStorage.setItem("missingItems", JSON.stringify(updatedItems));
  };

  const handleViewDetails = (item: MissingItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const exportData = () => {
    const csvContent = [
      ['التاريخ', 'الصيدلية', 'الدواء', 'الكمية المفقودة', 'الكمية الأصلية', 'معرف المجموعة'].join(','),
      ...filteredItems.map(item => [
        item.date,
        item.pharmacy,
        item.medicine,
        item.quantityMissing,
        item.originalQuantity,
        item.groupId
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `missing_items_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setPharmacyFilter('');
    setMedicineFilter('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <AlertTriangle className="w-10 h-10 text-red-600" />
                الطلبيات المفقودة
              </h1>
              <p className="text-gray-600">إدارة ومتابعة العناصر المفقودة من الطلبيات</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                تصدير البيانات
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">إجمالي العناصر المفقودة</h3>
                  <p className="text-2xl font-bold text-red-600">{stats.totalMissingItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">إجمالي الكمية المفقودة</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalMissingQuantity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">الصيدليات المتأثرة</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.affectedPharmacies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">الدواء الأكثر فقداناً</h3>
                  <p className="text-lg font-bold text-purple-600">{stats.topMissingMedicine}</p>
                  <p className="text-sm text-purple-500">({stats.topMissingQuantity} وحدة)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">المرشحات</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 mr-auto"
              >
                مسح الكل
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن دواء أو صيدلية..."
                    className="w-full pr-10 p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصيدلية</label>
                <select
                  value={pharmacyFilter}
                  onChange={(e) => setPharmacyFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">جميع الصيدليات</option>
                  {uniquePharmacies.map(pharmacy => (
                    <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدواء</label>
                <select
                  value={medicineFilter}
                  onChange={(e) => setMedicineFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">جميع الأدوية</option>
                  {uniqueMedicines.map(medicine => (
                    <option key={medicine} value={medicine}>{medicine}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Items Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              قائمة العناصر المفقودة ({filteredItems.length})
            </h3>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد عناصر مفقودة
              </h3>
              <p className="text-gray-500">
                {missingItems.length === 0 
                  ? "لم يتم تسجيل أي عناصر مفقودة بعد"
                  : "لا توجد عناصر تطابق المرشحات المحددة"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الدواء</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية الأصلية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية المفقودة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النسبة المفقودة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const missingPercentage = ((item.quantityMissing / item.originalQuantity) * 100).toFixed(1);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(item.date), 'yyyy/MM/dd')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-blue-500" />
                            {item.pharmacy}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-green-500" />
                            {item.medicine}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.originalQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.quantityMissing}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(parseFloat(missingPercentage), 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{missingPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="عرض التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    تفاصيل العنصر المفقود
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Store className="w-4 h-4 text-blue-600" />
                        معلومات الصيدلية
                      </h3>
                      <p className="text-gray-700">{selectedItem.pharmacy}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        تاريخ الطلبية
                      </h3>
                      <p className="text-gray-700">{format(new Date(selectedItem.date), 'yyyy/MM/dd')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        اسم الدواء
                      </h3>
                      <p className="text-gray-700">{selectedItem.medicine}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">معرف المجموعة</h3>
                      <p className="text-gray-700 text-sm font-mono">{selectedItem.groupId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    تفاصيل الفقدان
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-red-600">الكمية الأصلية</p>
                      <p className="text-2xl font-bold text-red-800">{selectedItem.originalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600">الكمية المفقودة</p>
                      <p className="text-2xl font-bold text-red-800">{selectedItem.quantityMissing}</p>
                    </div>
                    <div>
                      <p className="text-sm text-red-600">النسبة المفقودة</p>
                      <p className="text-2xl font-bold text-red-800">
                        {((selectedItem.quantityMissing / selectedItem.originalQuantity) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}