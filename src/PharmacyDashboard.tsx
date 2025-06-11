import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass,
  Filter,
  Download,
  Eye,
  Star,
  Award,
  Target,
  Activity,
  Zap,
  Globe,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { mockPharmacyVisits, getPharmacyStats, PharmacyVisit } from './mockPharmacyData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusIcons = {
  pending: Hourglass,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function PharmacyDashboard() {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [filters, setFilters] = useState({
    pharmacy: '',
    medicine: '',
    representative: '',
    status: '',
    type: '',
    priority: '',
    city: ''
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyVisit | null>(null);

  const filteredVisits = useMemo(() => {
    return mockPharmacyVisits.filter(visit => {
      const visitDate = new Date(visit.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const isInDateRange = isWithinInterval(visitDate, { start: startDate, end: endDate });
      const matchesPharmacy = !filters.pharmacy || visit.pharmacy.includes(filters.pharmacy);
      const matchesMedicine = !filters.medicine || visit.medicine?.includes(filters.medicine);
      const matchesRepresentative = !filters.representative || visit.representative.includes(filters.representative);
      const matchesStatus = !filters.status || visit.status === filters.status;
      const matchesType = !filters.type || visit.type === filters.type;
      const matchesPriority = !filters.priority || visit.priority === filters.priority;
      const matchesCity = !filters.city || visit.location.city === filters.city;

      return isInDateRange && matchesPharmacy && matchesMedicine && matchesRepresentative && 
             matchesStatus && matchesType && matchesPriority && matchesCity;
    });
  }, [dateRange, filters]);

  const stats = useMemo(() => getPharmacyStats(filteredVisits), [filteredVisits]);

  const uniqueValues = useMemo(() => {
    return {
      pharmacies: Array.from(new Set(mockPharmacyVisits.map(v => v.pharmacy))),
      medicines: Array.from(new Set(mockPharmacyVisits.filter(v => v.medicine).map(v => v.medicine!))),
      representatives: Array.from(new Set(mockPharmacyVisits.map(v => v.representative))),
      cities: Array.from(new Set(mockPharmacyVisits.map(v => v.location.city)))
    };
  }, []);

  const chartData = useMemo(() => {
    // Daily collections trend
    const dailyCollections = filteredVisits
      .filter(v => v.type === 'collection' && v.amount)
      .reduce((acc, v) => {
        acc[v.date] = (acc[v.date] || 0) + (v.amount || 0);
        return acc;
      }, {} as Record<string, number>);

    const collectionTrend = Object.entries(dailyCollections)
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Representative performance
    const repPerformance = Object.entries(
      filteredVisits.reduce((acc, v) => {
        if (!acc[v.representative]) {
          acc[v.representative] = { visits: 0, collections: 0, orders: 0 };
        }
        acc[v.representative].visits++;
        if (v.type === 'collection' && v.amount) {
          acc[v.representative].collections += v.amount;
        }
        if (v.type === 'order' && v.quantity) {
          acc[v.representative].orders += v.quantity;
        }
        return acc;
      }, {} as Record<string, { visits: number; collections: number; orders: number }>)
    ).map(([name, data]) => ({
      name: name.split(' ').slice(0, 2).join(' '),
      visits: data.visits,
      collections: Math.round(data.collections * 100) / 100,
      orders: data.orders
    }));

    // City distribution
    const cityData = Object.entries(stats.cityDistribution).map(([name, value]) => ({
      name,
      value
    }));

    // Status distribution
    const statusData = Object.entries(stats.statusDistribution).map(([name, value]) => ({
      name: name === 'pending' ? 'قيد الانتظار' : 
            name === 'approved' ? 'معتمد' :
            name === 'rejected' ? 'مرفوض' : 'مكتمل',
      value,
      color: name
    }));

    // Type distribution
    const typeData = Object.entries(stats.typeDistribution).map(([name, value]) => ({
      name: name === 'collection' ? 'تحصيل' :
            name === 'order' ? 'طلبية' :
            name === 'visit' ? 'زيارة' : 'ترويج',
      value
    }));

    return {
      collectionTrend,
      repPerformance,
      cityData,
      statusData,
      typeData
    };
  }, [filteredVisits, stats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      pharmacy: '',
      medicine: '',
      representative: '',
      status: '',
      type: '',
      priority: '',
      city: ''
    });
  };

  const exportData = () => {
    const csvContent = [
      ['التاريخ', 'الصيدلية', 'النوع', 'الحالة', 'المبلغ', 'المندوب'].join(','),
      ...filteredVisits.map(v => [
        v.date,
        v.pharmacy,
        v.type,
        v.status,
        v.amount || '',
        v.representative
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pharmacy_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

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
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Clock className="w-6 h-6 text-blue-600" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  <option value="collection">تحصيل</option>
                  <option value="order">طلبية</option>
                  <option value="visit">زيارة</option>
                  <option value="promotion">ترويج</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">الكل</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="approved">معتمد</option>
                  <option value="rejected">مرفوض</option>
                  <option value="completed">مكتمل</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'analytics', label: 'التحليلات', icon: PieChartIcon },
              { id: 'performance', label: 'الأداء', icon: TrendingUp },
              { id: 'details', label: 'التفاصيل', icon: Eye }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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
                    <p className="text-green-100 text-sm mt-1">ريال سعودي</p>
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
                    <p className="text-orange-100 text-sm mt-1">ريال سعودي</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Collection Trends */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  اتجاهات التحصيل اليومية
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.collectionTrend}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), 'yyyy/MM/dd')}
                        formatter={(value) => [`${value} ريال`, 'المبلغ']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  توزيع حالات الطلبات
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Pharmacies */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  أفضل الصيدليات (حسب التحصيل)
                </h3>
                <div className="space-y-4">
                  {stats.topPharmacies.slice(0, 5).map(([pharmacy, amount], index) => (
                    <div key={pharmacy} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{pharmacy}</span>
                      </div>
                      <span className="font-bold text-green-600">{amount.toLocaleString()} ريال</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Medicines */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  أكثر الأدوية طلباً
                </h3>
                <div className="space-y-4">
                  {stats.topMedicines.slice(0, 5).map(([medicine, quantity], index) => (
                    <div key={medicine} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800">{medicine}</span>
                      </div>
                      <span className="font-bold text-purple-600">{quantity} وحدة</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Representative Performance */}
            <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                أداء المندوبين
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.repPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" name="الزيارات" fill="#3B82F6" />
                    <Bar dataKey="collections" name="التحصيلات" fill="#10B981" />
                    <Bar dataKey="orders" name="الطلبيات" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* City Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                توزيع المدن
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.cityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.cityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Type Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                توزيع أنواع الأنشطة
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.typeData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">معدل النمو</h3>
                    <p className="text-2xl font-bold text-green-600">+15.3%</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">مقارنة بالشهر الماضي</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">معدل الإنجاز</h3>
                    <p className="text-2xl font-bold text-blue-600">87.5%</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">من الأهداف المحددة</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">متوسط الزيارات</h3>
                    <p className="text-2xl font-bold text-purple-600">12.4</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">زيارة يومياً</p>
              </div>
            </div>

            {/* Detailed Performance Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">تحليل الأداء التفصيلي</h3>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.collectionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => format(new Date(date), 'yyyy/MM/dd')}
                      formatter={(value) => [`${value} ريال`, 'التحصيل']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="التحصيل اليومي"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                تفاصيل الزيارات ({filteredVisits.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوقت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصيدلية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المدينة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الأولوية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisits.slice(0, 50).map((visit) => {
                    const StatusIcon = statusIcons[visit.status];
                    return (
                      <tr key={visit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(visit.date), 'yyyy/MM/dd')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {visit.pharmacy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.location.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {visit.type === 'collection' ? 'تحصيل' :
                             visit.type === 'order' ? 'طلبية' :
                             visit.type === 'visit' ? 'زيارة' : 'ترويج'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColors[visit.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {visit.status === 'pending' ? 'قيد الانتظار' :
                             visit.status === 'approved' ? 'معتمد' :
                             visit.status === 'rejected' ? 'مرفوض' : 'مكتمل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[visit.priority]}`}>
                            {visit.priority === 'low' ? 'منخفض' :
                             visit.priority === 'medium' ? 'متوسط' :
                             visit.priority === 'high' ? 'عالي' : 'عاجل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.amount ? `${visit.amount.toLocaleString()} ريال` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.representative.split(' ').slice(0, 2).join(' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedPharmacy(visit)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pharmacy Details Modal */}
        {selectedPharmacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">تفاصيل الزيارة</h2>
                  <button
                    onClick={() => setSelectedPharmacy(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    تفاصيل الزيارة
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">التاريخ</p>
                      <p className="font-medium">{format(new Date(selectedPharmacy.date), 'yyyy/MM/dd')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الوقت</p>
                      <p className="font-medium">{selectedPharmacy.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">النوع</p>
                      <p className="font-medium">
                        {selectedPharmacy.type === 'collection' ? 'تحصيل' :
                         selectedPharmacy.type === 'order' ? 'طلبية' :
                         selectedPharmacy.type === 'visit' ? 'زيارة' : 'ترويج'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الأولوية</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[selectedPharmacy.priority]}`}>
                        {selectedPharmacy.priority === 'low' ? 'منخفض' :
                         selectedPharmacy.priority === 'medium' ? 'متوسط' :
                         selectedPharmacy.priority === 'high' ? 'عالي' : 'عاجل'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPharmacy.products && selectedPharmacy.products.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      المنتجات
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">المنتج</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الفئة</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الكمية</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">سعر الوحدة</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">المجموع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedPharmacy.products.map((product, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{product.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{product.category}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.unitPrice} ريال</td>
                              <td className="px-4 py-2 text-sm font-medium text-green-600">{product.totalPrice} ريال</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

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