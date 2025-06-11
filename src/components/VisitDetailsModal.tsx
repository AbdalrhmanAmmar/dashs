import React from 'react';
import { Visit } from '../mockData';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface VisitDetailsModalProps {
  visit: Visit;
  onClose: () => void;
  onFilterChange: (name: string, value: string) => void;
}

export default function VisitDetailsModal({ visit, onClose, onFilterChange }: VisitDetailsModalProps) {
  const formattedDate = format(new Date(visit.visitDate), 'dd/MM/yyyy');

  const handleFilterClick = (name: string, value: string) => {
    // Reset all filters except the clicked one
    const filtersToReset = {
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
      dateRange: {
        start: '',
        end: '',
      }
    };

    // Set the clicked filter value
    filtersToReset[name] = value;

    // If country is clicked, also set area and city
    if (name === 'country') {
      filtersToReset.area = visit.area;
      filtersToReset.city = visit.city;
    }
    // If area is clicked, also set country and city
    else if (name === 'area') {
      filtersToReset.country = visit.country;
      filtersToReset.city = visit.city;
    }
    // If city is clicked, also set country and area
    else if (name === 'city') {
      filtersToReset.country = visit.country;
      filtersToReset.area = visit.area;
    }

    onFilterChange('resetAll', JSON.stringify(filtersToReset));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" dir="rtl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">تفاصيل الزيارة</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">معلومات الزيارة</h3>
              <div className="space-y-2">
                <p><span className="font-medium">التاريخ:</span> {formattedDate}</p>
                <p><span className="font-medium">الوقت:</span> {visit.visitTime}</p>
                <p>
                  <span className="font-medium">الطبيب:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('doctorName', visit.doctorName)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.doctorName}
                  </button>
                </p>
                <p>
                  <span className="font-medium">العيادة:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('clinicName', visit.clinicName)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.clinicName}
                  </button>
                </p>
                <p>
                  <span className="font-medium">الدولة:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('country', visit.country)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.country}
                  </button>
                </p>
                <p>
                  <span className="font-medium">المنطقة:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('area', visit.area)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.area}
                  </button>
                </p>
                <p>
                  <span className="font-medium">المدينة:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('city', visit.city)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.city}
                  </button>
                </p>
                <p><span className="font-medium">العنوان:</span> {visit.address}</p>
                <p>
                  <span className="font-medium">العلامة التجارية:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('brand', visit.brand)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.brand}
                  </button>
                </p>
                <p>
                  <span className="font-medium">التصنيف:</span>{' '}
                  <button
                    onClick={() => handleFilterClick('classification', visit.classification)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {visit.classification}
                  </button>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">المنتجات والعينات</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <button
                    onClick={() => handleFilterClick('product1', visit.product1)}
                    className="font-medium text-blue-800 hover:underline block w-full text-right"
                  >
                    {visit.product1}
                  </button>
                  <p className="text-blue-600">عدد العينات: {visit.samples1}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <button
                    onClick={() => handleFilterClick('product2', visit.product2)}
                    className="font-medium text-green-800 hover:underline block w-full text-right"
                  >
                    {visit.product2}
                  </button>
                  <p className="text-green-600">عدد العينات: {visit.samples2}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <button
                    onClick={() => handleFilterClick('product3', visit.product3)}
                    className="font-medium text-purple-800 hover:underline block w-full text-right"
                  >
                    {visit.product3}
                  </button>
                  <p className="text-purple-600">عدد العينات: {visit.samples3}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}