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
} from 'recharts';
import { format, parse, isWithinInterval } from 'date-fns';
import {
  mockVisits,
  Visit,
  getUniqueValues,
  getDoctorProducts,
  getLocations,
  getBrands,
  getClassifications,
  getSpecialties,
  getCities
} from './mockData';
import VisitDetailsModal from './components/VisitDetailsModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [filters, setFilters] = useState({
    doctorName: '',
    clinicName: '',
    product1: '',
    product2: '',
    product3: '',
    country: '',
    area: '',
    city: '',
    brand: '',
    classification: '',
    specialty: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const uniqueDoctors = useMemo(() => getUniqueValues(mockVisits, 'doctorName'), []);
  const uniqueClinics = useMemo(() => getUniqueValues(mockVisits, 'clinicName'), []);
  const locations = useMemo(() => getLocations(), []);
  const countries = useMemo(() => Object.keys(locations), [locations]);
  const areas = useMemo(() => filters.country ? Object.keys(locations[filters.country]) : [], [filters.country, locations]);
  const cities = useMemo(() => filters.country && filters.area ? getCities(filters.country, filters.area) : [], [filters.country, filters.area]);
  const brands = useMemo(() => getBrands(), []);
  const classifications = useMemo(() => getClassifications(), []);
  const specialties = useMemo(() => getSpecialties(), []);

  const uniqueProducts = useMemo(() => {
    const products = {
      products1: new Set<string>(),
      products2: new Set<string>(),
      products3: new Set<string>(),
    };
    
    mockVisits.forEach(visit => {
      products.products1.add(visit.product1);
      products.products2.add(visit.product2);
      products.products3.add(visit.product3);
    });
    
    return {
      products1: Array.from(products.products1),
      products2: Array.from(products.products2),
      products3: Array.from(products.products3),
    };
  }, []);

  const availableProducts = useMemo(() => {
    if (filters.doctorName) {
      return getDoctorProducts(filters.doctorName);
    }
    return uniqueProducts;
  }, [filters.doctorName, uniqueProducts]);

  const filteredVisits = useMemo(() => {
    return mockVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      const isWithinDateRange = filters.dateRange.start && filters.dateRange.end
        ? isWithinInterval(visitDate, {
            start: new Date(filters.dateRange.start),
            end: new Date(filters.dateRange.end),
          })
        : true;

      return (
        (!filters.doctorName || visit.doctorName === filters.doctorName) &&
        (!filters.clinicName || visit.clinicName === filters.clinicName) &&
        (!filters.product1 || visit.product1 === filters.product1) &&
        (!filters.product2 || visit.product2 === filters.product2) &&
        (!filters.product3 || visit.product3 === filters.product3) &&
        (!filters.country || visit.country === filters.country) &&
        (!filters.area || visit.area === filters.area) &&
        (!filters.city || visit.city === filters.city) &&
        (!filters.brand || visit.brand === filters.brand) &&
        (!filters.classification || visit.classification === filters.classification) &&
        (!filters.specialty || visit.specialty === filters.specialty) &&
        isWithinDateRange
      );
    });
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => {
      if (name === 'doctorName') {
        return {
          ...prev,
          [name]: value,
          product1: '',
          product2: '',
          product3: '',
        };
      }
      if (name === 'country') {
        return {
          ...prev,
          [name]: value,
          area: '',
          city: '',
        };
      }
      if (name === 'area') {
        return {
          ...prev,
          [name]: value,
          city: '',
        };
      }
      if (name.startsWith('date_')) {
        const dateType = name.split('_')[1] as 'start' | 'end';
        return {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            [dateType]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleModalFilterChange = (name: string, value: string) => {
    if (name === 'resetAll') {
      const newFilters = JSON.parse(value);
      setFilters(newFilters);
      return;
    }

    setFilters(prev => {
      if (name === 'doctorName') {
        return {
          ...prev,
          [name]: value,
          product1: '',
          product2: '',
          product3: '',
        };
      }
      return { ...prev, [name]: value };
    });
  };

  // Data for charts
  const visitsPerDoctor = useMemo(() => {
    const counts = filteredVisits.reduce((acc, visit) => {
      acc[visit.doctorName] = (acc[visit.doctorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, visits]) => ({
        name,
        visits,
      }))
      .sort((a, b) => b.visits - a.visits);
  }, [filteredVisits]);

  const visitsPerCountry = useMemo(() => {
    const counts = filteredVisits.reduce((acc, visit) => {
      acc[visit.country] = (acc[visit.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisits]);

  const visitsPerClassification = useMemo(() => {
    const counts = filteredVisits.reduce((acc, visit) => {
      acc[visit.classification] = (acc[visit.classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisits]);

  const productUsage = useMemo(() => {
    const products = new Map<string, number>();
    
    filteredVisits.forEach(visit => {
      [
        { name: visit.product1, samples: visit.samples1 },
        { name: visit.product2, samples: visit.samples2 },
        { name: visit.product3, samples: visit.samples3 },
      ].forEach(({ name, samples }) => {
        products.set(name, (products.get(name) || 0) + samples);
      });
    });

    return Array.from(products.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisits]);

  const visitsOverTime = useMemo(() => {
    const visitsByDate = filteredVisits.reduce((acc, visit) => {
      const date = visit.visitDate;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(visitsByDate)
      .map(([date, count]) => ({
        date,
        visits: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredVisits]);

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>
        
        {/* Advanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-full md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
              <input
                type="date"
                name="date_start"
                value={filters.dateRange.start}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
              <input
                type="date"
                name="date_end"
                value={filters.dateRange.end}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر الطبيب</label>
            <select
              name="doctorName"
              value={filters.doctorName}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {uniqueDoctors.map(doctor => (
                <option key={doctor} value={doctor}>{doctor}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التخصص</label>
            <select
              name="specialty"
              value={filters.specialty}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
            <select
              name="classification"
              value={filters.classification}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {classifications.map(classification => (
                <option key={classification} value={classification}>{classification}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الدولة</label>
            <select
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
            <select
              name="area"
              value={filters.area}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.country}
            >
              <option value="">الكل</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
            <select
              name="city"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={!filters.area}
            >
              <option value="">الكل</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العلامة التجارية</label>
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر العيادة</label>
            <select
              name="clinicName"
              value={filters.clinicName}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {uniqueClinics.map(clinic => (
                <option key={clinic} value={clinic}>{clinic}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنتج الأول</label>
            <select
              name="product1"
              value={filters.product1}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {availableProducts.products1.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنتج الثاني</label>
            <select
              name="product2"
              value={filters.product2}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {availableProducts.products2.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنتج الثالث</label>
            <select
              name="product3"
              value={filters.product3}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">الكل</option>
              {availableProducts.products3.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart - Most Visited Doctors */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">الأطباء الأكثر زيارة</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visitsPerDoctor}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#8884d8" name="عدد الزيارات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Visits by Country */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">توزيع الزيارات حسب الدولة</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitsPerCountry}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {visitsPerCountry.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Visits by Classification */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">توزيع الزيارات حسب التصنيف</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visitsPerClassification}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {visitsPerClassification.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart - Visits Over Time */}
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">توزيع الزيارات حسب التاريخ</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={visitsOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    angle={0}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), 'yyyy/MM/dd')}
                    contentStyle={{ textAlign: 'right', direction: 'rtl' }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#8884d8"
                    name="عدد الزيارات"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">إجمالي الزيارات</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredVisits.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">إجمالي العينات</h3>
            <p className="text-3xl font-bold text-green-600">
              {productUsage.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">عدد الأطباء</h3>
            <p className="text-3xl font-bold text-purple-600">{visitsPerDoctor.length}</p>
          </div>
        </div>

        {/* Visits Table */}
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">قائمة الزيارات</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوقت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الطبيب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العيادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدينة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التصنيف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التخصص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تفاصيل
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(visit.visitDate), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.visitTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleModalFilterChange('doctorName', visit.doctorName)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {visit.doctorName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleModalFilterChange('clinicName', visit.clinicName)}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {visit.clinicName}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.classification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visit.specialty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedVisit(visit)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      عرض التفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visit Details Modal */}
      {selectedVisit && (
        <VisitDetailsModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onFilterChange={handleModalFilterChange}
        />
      )}
    </div>
  );
}