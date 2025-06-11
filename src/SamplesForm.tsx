import React, { useState } from 'react';
import { CalendarIcon, User, Package, Hash, FileText } from 'lucide-react';

const medicines = [
  'Panadol',
  'Brufen',
  'Nexium',
  'Lipitor',
  'Concor',
  'Glucophage',
  'Augmentin',
  'Amoxil',
  'Zithromax',
  'Crestor',
  'Ventolin',
  'Lantus',
  'Voltaren',
  'Plavix',
  'Januvia'
];

const doctors = [
  'د. أحمد محمد',
  'د. سارة خالد',
  'د. محمد عبدالله',
  'د. فاطمة علي',
  'د. عمر حسن',
  'د. ليلى أحمد',
  'د. خالد العمري',
  'د. نورة السعيد',
  'د. طارق حسين',
  'د. رنا محمود'
];

interface SamplesFormData {
  requestDate: string;
  deliveryDate: string;
  medicine: string;
  doctorName: string;
  quantity: number;
  notes: string;
}

export default function SamplesForm() {
  const [formData, setFormData] = useState<SamplesFormData>({
    requestDate: '',
    deliveryDate: '',
    medicine: '',
    doctorName: '',
    quantity: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('تم تسجيل طلب العينات بنجاح!');
    setFormData({
      requestDate: '',
      deliveryDate: '',
      medicine: '',
      doctorName: '',
      quantity: 0,
      notes: ''
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="py-8 px-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            نموذج طلب عينات
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="flex items-center text-gray-700 mb-2">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  تاريخ الطلب
                </label>
                <input
                  type="date"
                  name="requestDate"
                  value={formData.requestDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="relative">
                <label className="flex items-center text-gray-700 mb-2">
                  <CalendarIcon className="w-5 h-5 ml-2" />
                  تاريخ التسليم
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="flex items-center text-gray-700 mb-2">
                <Package className="w-5 h-5 ml-2" />
                الدواء
              </label>
              <select
                name="medicine"
                value={formData.medicine}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                required
              >
                <option value="">اختر الدواء</option>
                {medicines.map((medicine) => (
                  <option key={medicine} value={medicine}>
                    {medicine}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="flex items-center text-gray-700 mb-2">
                <User className="w-5 h-5 ml-2" />
                اسم الطبيب
              </label>
              <select
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                required
              >
                <option value="">اختر الطبيب</option>
                {doctors.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="flex items-center text-gray-700 mb-2">
                <Hash className="w-5 h-5 ml-2" />
                الكمية
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <label className="flex items-center text-gray-700 mb-2">
                <FileText className="w-5 h-5 ml-2" />
                ملاحظات
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="أضف أي ملاحظات إضافية هنا..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition duration-200 font-semibold text-lg"
            >
              تسجيل الطلب
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}