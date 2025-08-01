import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { 
  Store, 
  Package, 
  DollarSign, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Filter,
  Download,
  Eye,
  X,
  CreditCard,
  ShoppingCart
} from 'lucide-react';
import { mockPharmacyVisits, getPharmacyStats, PharmacyVisit } from './mockPharmacyData';

export default function PharmacyDashboard() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [filters, setFilters] = useState({
    pharmacy: '',
    medicine: '',
    representative: '',
    area: '',
    city: ''
  });

  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyVisit | null>(null);
  const [showPharmacyCard, setShowPharmacyCard] = useState(false);

  const filteredVisits = useMemo(() => {
    return mockPharmacyVisits.filter(visit => {
      const visitDate = new Date(visit.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const isInDateRange = isWithinInterval(visitDate, { start: startDate, end: endDate });
      const matchesPharmacy = !filters.pharmacy || visit.pharmacy.includes(filters.pharmacy);
      const matchesMedicine = !filters.medicine || visit.medicine?.includes(filters.medicine);
      const matchesRepresentative = !filters.representative || visit.representative.includes(filters.representative);
      const matchesArea = !filters.area || visit.location.area === filters.area;
      const matchesCity = !filters.city || visit.location.city === filters.city;

      return isInDateRange && matchesPharmacy && matchesMedicine && matchesRepresentative && 
             matchesArea && matchesCity;
    });
  }, [dateRange, filters]);

  const stats = useMemo(() => getPharmacyStats(filteredVisits), [filteredVisits]);

  const uniqueValues = useMemo(() => {
    return {
      pharmacies: Array.from(new Set(mockPharmacyVisits.map(v => v.pharmacy))),
      medicines: Array.from(new Set(mockPharmacyVisits.filter(v => v.medicine).map(v => v.medicine!))),
      representatives: Array.from(new Set(mockPharmacyVisits.map(v => v.representative))),
      areas: Array.from(new Set(mockPharmacyVisits.map(v => v.location.area))),
      cities: Array.from(new Set(mockPharmacyVisits.map(v => v.location.city)))
    };
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      pharmacy: '',
      medicine: '',
      representative: '',
      area: '',
      city: ''
    });
  };

  const exportData = () => {
    const csvContent = [
      ['التاريخ', 'الصيدلية', 'المبلغ', 'المندوب', 'المنطقة'].join(','),
      ...filteredVisits.map(v => [
        v.date,
        v.pharmacy,
        v.amount || '',
        v.representative,
        v.location.area
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pharmacy_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handlePharmacyClick = (visit: PharmacyVisit) => {
    setSelectedPharmacy(visit);
    setShowPharmacyCard(true);
  };

  // Get pharmacy data for cards
  const pharmacyData = useMemo(() => {
    const pharmacyMap = new Map();
    
    filteredVisits.forEach(visit => {
      if (!pharmacyMap.has(visit.pharmacy)) {
        pharmacyMap.set(visit.pharmacy, {
          name: visit.pharmacy,
          location: visit.location,
          contact: visit.contact,
          orders: [],
          collections: [],
          totalOrders: 0,
          totalCollections: 0
        });
      }
      
      const pharmacy = pharmacyMap.get(visit.pharmacy);
      
      if (visit.type === 'order') {
        pharmacy.orders.push(visit);
        pharmacy.totalOrders += visit.quantity || 0;
      } else if (visit.type === 'collection') {
        pharmacy.collections.push(visit);
        pharmacy.totalCollections += visit.amount || 0;
      }
    });
    
    return Array.from(pharmacyMap.values());
  }, [filteredVisits]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة تحكم الصيدليات</h1>
              <p className="text-gray-600">إدارة شاملة لزيارات وتحصيلات الصيدليات</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportData}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                تصدير البيانات
              </button>
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الصيدلية</label>
                <select
                  value={filters.pharmacy}
                  onChange={(e) => handleFilterChange('pharmacy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  {uniqueValues.pharmacies.map(pharmacy => (
                    <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                <select
                  value={filters.area}
                  onChange={(e) => handleFilterChange('area', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  {uniqueValues.areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  {uniqueValues.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المندوب</label>
                <select
                  value={filters.representative}
                  onChange={(e) => handleFilterChange('representative', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  {uniqueValues.representatives.map(rep => (
                    <option key={rep} value={rep}>{rep.split(' ').slice(0, 2).join(' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">الصيدليات النشطة</p>
                  <p className="text-3xl font-bold">{stats.totalPharmacies}</p>
                  <p className="text-blue-100 text-sm mt-1">صيدلية مسجلة</p>
                </div>
                <Store className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">إجمالي التحصيلات</p>
                  <p className="text-3xl font-bold">{stats.totalCollections.toLocaleString()}</p>
                  <p className="text-green-100 text-sm mt-1">دينار ليبي</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">إجمالي الطلبيات</p>
                  <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                  <p className="text-purple-100 text-sm mt-1">وحدة مطلوبة</p>
                </div>
                <Package className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">متوسط قيمة الطلب</p>
                  <p className="text-3xl font-bold">{stats.avgOrderValue.toLocaleString()}</p>
                  <p className="text-orange-100 text-sm mt-1">دينار ليبي</p>
                </div>
                <Users className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Pharmacy Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">بطاقات الصيدليات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacyData.map((pharmacy, index) => (
              <div
                key={index}
                onClick={() => handlePharmacyClick(filteredVisits.find(v => v.pharmacy === pharmacy.name)!)}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{pharmacy.name}</h3>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {pharmacy.location.city} - {pharmacy.location.area}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">التحصيلات</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {pharmacy.totalCollections.toLocaleString()} ريال
                    </p>
                    <p className="text-xs text-green-600">{pharmacy.collections.length} عملية</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">الطلبيات</span>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {pharmacy.totalOrders} وحدة
                    </p>
                    <p className="text-xs text-purple-600">{pharmacy.orders.length} طلبية</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {pharmacy.contact.phone}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pharmacies Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">أفضل الصيدليات (حسب التحصيل)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPharmacies.slice(0, 5).map(([name, amount]) => ({ name, amount }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ريال`, 'التحصيل']} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Medicines Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">أكثر الأدوية طلباً</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topMedicines.slice(0, 5).map(([name, quantity]) => ({ name, quantity }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} وحدة`, 'الكمية']} />
                  <Bar dataKey="quantity" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pharmacy Details Modal */}
        {showPharmacyCard && selectedPharmacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">تفاصيل الصيدلية</h2>
                  <button
                    onClick={() => setShowPharmacyCard(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Store className="w-5 h-5 text-blue-600" />
                      معلومات الصيدلية
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">الاسم:</span> {selectedPharmacy.pharmacy}</p>
                      <p><span className="font-medium">الرقم التعريفي:</span> {selectedPharmacy.pharmacyId}</p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {selectedPharmacy.location.address}
                      </p>
                      <p><span className="font-medium">المدينة:</span> {selectedPharmacy.location.city}</p>
                      <p><span className="font-medium">المنطقة:</span> {selectedPharmacy.location.area}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      معلومات الاتصال
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">الصيدلي:</span> {selectedPharmacy.contact.pharmacist}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {selectedPharmacy.contact.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {selectedPharmacy.contact.email}
                      </p>
                      <p><span className="font-medium">المندوب:</span> {selectedPharmacy.representative}</p>
                    </div>
                  </div>
                </div>

                {/* Orders and Collections Tabs */}
                <div className="space-y-4">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
                        الطلبيات
                      </button>
                      <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        التحصيلات
                      </button>
                    </nav>
                  </div>

                  {/* Orders Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      الطلبيات
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {filteredVisits.filter(v => v.pharmacy === selectedPharmacy.pharmacy && v.type === 'order').length}
                          </p>
                          <p className="text-sm text-purple-600">عدد الطلبيات</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {filteredVisits
                              .filter(v => v.pharmacy === selectedPharmacy.pharmacy && v.type === 'order')
                              .reduce((sum, v) => sum + (v.quantity || 0), 0)}
                          </p>
                          <p className="text-sm text-purple-600">إجمالي الوحدات</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            {selectedPharmacy.representative.split(' ').slice(0, 2).join(' ')}
                          </p>
                          <p className="text-sm text-purple-600">المندوب المسؤول</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      التحصيلات
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {filteredVisits.filter(v => v.pharmacy === selectedPharmacy.pharmacy && v.type === 'collection').length}
                          </p>
                          <p className="text-sm text-green-600">عدد التحصيلات</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {filteredVisits
                              .filter(v => v.pharmacy === selectedPharmacy.pharmacy && v.type === 'collection')
                              .reduce((sum, v) => sum + (v.amount || 0), 0)
                              .toLocaleString()} ريال
                          </p>
                          <p className="text-sm text-green-600">إجمالي المبلغ</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {selectedPharmacy.representative.split(' ').slice(0, 2).join(' ')}
                          </p>
                          <p className="text-sm text-green-600">المندوب المسؤول</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPharmacy.notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">ملاحظات</h3>
                    <p className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedPharmacy.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}