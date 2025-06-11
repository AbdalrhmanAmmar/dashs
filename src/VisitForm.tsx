import React, { useState } from 'react';
import { CalendarIcon, Stethoscope, Building2, Package } from 'lucide-react';

interface VisitFormData {
  doctorName: string;
  clinicName: string;
  product1: string;
  product2: string;
  product3: string;
  visitDate: string;
  samples1: number;
  samples2: number;
  samples3: number;
}

function VisitForm() {
  const [formData, setFormData] = useState<VisitFormData>({
    doctorName: '',
    clinicName: '',
    product1: '',
    product2: '',
    product3: '',
    visitDate: '',
    samples1: 0,
    samples2: 0,
    samples3: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('تم تسجيل الزيارة بنجاح!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg">
        <div className="py-6 px-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            نموذج تسجيل زيارة مندوب
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="space-y-4">
              <div className="relative">
                <label className="flex items-center text-gray-700 mb-2">
                  <Stethoscope className="w-5 h-5 ml-2" />
                  اسم الطبيب
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-700 mb-2">
                  <Building2 className="w-5 h-5 ml-2" />
                  اسم العيادة
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-4">
                  <div className="relative">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Package className="w-5 h-5 ml-2" />
                      اسم المنتج {num}
                    </label>
                    <input
                      type="text"
                      name={`product${num}`}
                      value={formData[`product${num}` as keyof VisitFormData]}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="flex items-center text-gray-700 mb-2">
                      عينات المنتج {num}
                    </label>
                    <input
                      type="number"
                      name={`samples${num}`}
                      value={formData[`samples${num}` as keyof VisitFormData]}
                      onChange={handleChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="relative">
                <label className="flex items-center text-gray-700 mb-2">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  تاريخ الزيارة
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              تسجيل الزيارة
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VisitForm;