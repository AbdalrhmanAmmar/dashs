import React, { useState, useRef } from 'react';
import { CalendarIcon, Store, Package, Receipt, Upload, DollarSign } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const pharmacies = [
  'صيدلية الشفاء',
  'صيدلية الدواء',
  'صيدلية النهدي',
  'صيدلية الحياة',
  'صيدلية الرعاية',
  'صيدلية السلام',
  'صيدلية الصحة',
  'صيدلية المدينة',
  'صيدلية الأمل',
  'صيدلية الوفاء'
];

const medicines = [
  { name: 'Panadol', price: 15 },
  { name: 'Brufen', price: 20 },
  { name: 'Nexium', price: 45 },
  { name: 'Lipitor', price: 85 },
  { name: 'Concor', price: 65 },
  { name: 'Glucophage', price: 25 },
  { name: 'Augmentin', price: 40 },
  { name: 'Amoxil', price: 30 },
  { name: 'Zithromax', price: 55 },
  { name: 'Crestor', price: 95 },
  { name: 'Ventolin', price: 35 },
  { name: 'Lantus', price: 150 },
  { name: 'Voltaren', price: 25 },
  { name: 'Plavix', price: 120 },
  { name: 'Januvia', price: 110 }
];

interface CollectionProduct {
  medicine: string;
  quantity: number;
  price: number;
  selected: boolean;
}

interface VisitFormData {
  visitDate: string;
  pharmacyName: string;
  draftDistribution: string;
  order: string;
  collection: string;
  introductoryVisit: string;
  receiptNumber?: string;
  receiptImage?: File | null;
  amount?: number;
  collectionStatus?: 'pending' | 'approved' | 'rejected';
  collectionProducts: CollectionProduct[];
  orderProducts: CollectionProduct[];
  introductoryNotes?: string;
  introductoryImage?: File | null;
}

export default function PharmacyVisitForm() {
  const [formData, setFormData] = useState<VisitFormData>({
    visitDate: '',
    pharmacyName: '',
    draftDistribution: '',
    order: '',
    collection: '',
    introductoryVisit: '',
    receiptNumber: '',
    receiptImage: null,
    amount: 0,
    collectionStatus: 'pending',
    collectionProducts: medicines.map(m => ({
      medicine: m.name,
      quantity: 0,
      price: m.price,
      selected: false
    })),
    orderProducts: medicines.map(m => ({
      medicine: m.name,
      quantity: 0,
      price: m.price,
      selected: false
    })),
    introductoryNotes: '',
    introductoryImage: null
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.files![0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    if (name === 'collection') {
      if (value === 'نعم') {
        setFormData(prev => ({
          ...prev,
          collectionStatus: 'pending'
        }));
      }
    }
  };

  const handleProductChange = (
    index: number, 
    field: 'selected' | 'quantity', 
    value: boolean | number,
    productType: 'collection' | 'order'
  ) => {
    const productField = `${productType}Products` as const;
    const newProducts = [...formData[productField]];
    
    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };
    
    const totalAmount = newProducts.reduce((sum, product) => {
      if (product.selected) {
        return sum + (product.price * product.quantity);
      }
      return sum;
    }, 0);

    setFormData(prev => ({
      ...prev,
      [productField]: newProducts,
      ...(productType === 'collection' ? { amount: totalAmount } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Generate unique group ID for this pharmacy visit
    const groupId = `${formData.pharmacyName}-${formData.visitDate}-${Date.now()}`;
    
    if (formData.collection === 'نعم') {
      const selectedProducts = formData.collectionProducts
        .filter(p => p.selected && p.quantity > 0)
        .map(p => ({
          medicine: p.medicine,
          quantity: p.quantity,
          price: p.price,
          totalPrice: p.price * p.quantity
        }));
      
      collections.push({
        id: Date.now(),
        date: formData.visitDate,
        pharmacy: formData.pharmacyName,
        amount: formData.amount,
        receiptNumber: formData.receiptNumber,
        products: selectedProducts,
        type: 'collection',
        status: 'pending',
        groupId: groupId
      });
    }

    if (formData.order === 'نعم') {
      const selectedOrderProducts = formData.orderProducts
        .filter(p => p.selected && p.quantity > 0);

      // Create individual order entries for each product
      selectedOrderProducts.forEach(product => {
        orders.push({
          id: Date.now() + Math.random(), // Ensure unique IDs
          date: formData.visitDate,
          pharmacy: formData.pharmacyName,
          medicine: product.medicine,
          quantity: product.quantity,
          price: product.price,
          totalPrice: product.price * product.quantity,
          type: 'order',
          status: 'pending',
          groupId: groupId
        });
      });
    }

    localStorage.setItem('collections', JSON.stringify(collections));
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert('تم تسجيل الزيارة بنجاح!');

    if (formData.collection === 'نعم') {
      setTimeout(() => handlePrint(), 100);
    }

    // Reset form
    setFormData({
      visitDate: '',
      pharmacyName: '',
      draftDistribution: '',
      order: '',
      collection: '',
      introductoryVisit: '',
      receiptNumber: '',
      receiptImage: null,
      amount: 0,
      collectionStatus: 'pending',
      collectionProducts: medicines.map(m => ({
        medicine: m.name,
        quantity: 0,
        price: m.price,
        selected: false
      })),
      orderProducts: medicines.map(m => ({
        medicine: m.name,
        quantity: 0,
        price: m.price,
        selected: false
      })),
      introductoryNotes: '',
      introductoryImage: null
    });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="py-6 px-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            نموذج زيارة صيدلية
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
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

            <div className="relative">
              <label className="flex items-center text-gray-700 mb-2">
                <Store className="w-5 h-5 ml-2" />
                اسم الصيدلية
              </label>
              <select
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">اختر الصيدلية</option>
                {pharmacies.map(pharmacy => (
                  <option key={pharmacy} value={pharmacy}>{pharmacy}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <label className="block text-gray-700 text-center mb-2">توزيع درافت</label>
                <div className="flex justify-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="draftDistribution"
                      value="نعم"
                      checked={formData.draftDistribution === 'نعم'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    نعم
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="draftDistribution"
                      value="لا"
                      checked={formData.draftDistribution === 'لا'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    لا
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-center mb-2">زيارة تعريفية</label>
                <div className="flex justify-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="introductoryVisit"
                      value="نعم"
                      checked={formData.introductoryVisit === 'نعم'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    نعم
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="introductoryVisit"
                      value="لا"
                      checked={formData.introductoryVisit === 'لا'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    لا
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-center mb-2">طلبية</label>
                <div className="flex justify-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="order"
                      value="نعم"
                      checked={formData.order === 'نعم'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    نعم
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="order"
                      value="لا"
                      checked={formData.order === 'لا'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    لا
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700 text-center mb-2">تحصيل</label>
                <div className="flex justify-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="collection"
                      value="نعم"
                      checked={formData.collection === 'نعم'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    نعم
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="collection"
                      value="لا"
                      checked={formData.collection === 'لا'}
                      onChange={handleChange}
                      className="ml-2"
                    />
                    لا
                  </label>
                </div>
              </div>
            </div>

            {/* إظهار حقول الزيارة التعريفية عند اختيار نعم */}
            {formData.introductoryVisit === 'نعم' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">بيانات الزيارة التعريفية</h3>
                
                <div className="relative">
                  <label className="flex items-center text-gray-700 mb-2">
                    ملاحظات الزيارة
                  </label>
                  <textarea
                    name="introductoryNotes"
                    value={formData.introductoryNotes}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل ملاحظات الزيارة التعريفية"
                    rows={3}
                  />
                </div>

                <div className="relative">
                  <label className="flex items-center text-gray-700 mb-2">
                    <Upload className="w-5 h-5 ml-2" />
                    صورة الزيارة
                  </label>
                  <input
                    type="file"
                    name="introductoryImage"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">يرجى رفع صورة توثق الزيارة التعريفية</p>
                </div>
              </div>
            )}

            {/* إظهار جدول الطلبية عند اختيار طلبية = نعم */}
            {formData.order === 'نعم' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">منتجات الطلبية</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اختيار</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدواء</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">السعر</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الكمية</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.orderProducts.map((product, index) => (
                        <tr key={product.medicine}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={product.selected}
                              onChange={(e) => handleProductChange(index, 'selected', e.target.checked, 'order')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{product.medicine}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{product.price} ريال</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value), 'order')}
                              className="w-20 p-1 border border-gray-300 rounded"
                              disabled={!product.selected}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {product.selected ? product.price * product.quantity : 0} ريال
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* إظهار جدول التحصيل عند اختيار تحصيل = نعم */}
            {formData.collection === 'نعم' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">منتجات التحصيل</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اختيار</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الدواء</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">السعر</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الكمية</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.collectionProducts.map((product, index) => (
                        <tr key={product.medicine}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={product.selected}
                              onChange={(e) => handleProductChange(index, 'selected', e.target.checked, 'collection')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{product.medicine}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{product.price} ريال</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value), 'collection')}
                              className="w-20 p-1 border border-gray-300 rounded"
                              disabled={!product.selected}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {product.selected ? product.price * product.quantity : 0} ريال
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end items-center gap-4 text-lg font-semibold">
                  <DollarSign className="w-6 h-6" />
                  <span>المجموع الكلي: {formData.amount} ريال</span>
                </div>

                {/* حقول التحصيل */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">بيانات التحصيل</h3>
                  
                  <div className="relative">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Receipt className="w-5 h-5 ml-2" />
                      رقم الوصل
                    </label>
                    <input
                      type="text"
                      name="receiptNumber"
                      value={formData.receiptNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رقم الوصل"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="flex items-center text-gray-700 mb-2">
                      <Upload className="w-5 h-5 ml-2" />
                      صورة الوصل
                    </label>
                    <input
                      type="file"
                      name="receiptImage"
                      onChange={handleChange}
                      accept="image/*"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">يرجى رفع صورة واضحة للوصل</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              تسجيل الزيارة
            </button>
          </form>
        </div>
      </div>

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <div ref={receiptRef}>
          {formData.collection === 'نعم' && (
            <PharmacyReceipt
              pharmacyName={formData.pharmacyName}
              date={formData.visitDate}
              amount={formData.amount || 0}
              products={formData.collectionProducts
                .filter(p => p.selected && p.quantity > 0)
                .map(p => ({
                  name: p.medicine,
                  quantity: p.quantity,
                  price: p.price,
                  total: p.price * p.quantity
                }))}
              representativeName="محمد أحمد"
              receiverName="أحمد محمد"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PharmacyReceipt({ 
  pharmacyName, 
  date, 
  amount, 
  products, 
  representativeName, 
  receiverName 
}: {
  pharmacyName: string;
  date: string;
  amount: number;
  products: Array<{name: string, quantity: number, price: number, total: number}>;
  representativeName: string;
  receiverName: string;
}) {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md" dir="rtl">
      <h2 className="text-xl font-bold text-center mb-4">إيصال تحصيل</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">الصيدلية:</span>
          <span>{pharmacyName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">التاريخ:</span>
          <span>{date}</span>
        </div>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <h3 className="font-medium">تفاصيل المنتجات:</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-2">المنتج</th>
              <th className="text-center py-2">الكمية</th>
              <th className="text-left py-2">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">{product.name}</td>
                <td className="text-center py-2">{product.quantity}</td>
                <td className="text-left py-2">{product.total} ريال</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <div className="flex justify-between font-bold text-lg">
          <span>المجموع الكلي:</span>
          <span>{amount} ريال</span>
        </div>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <div className="flex justify-between mt-8">
          <div className="text-center">
            <div className="font-medium mb-2">توقيع المندوب</div>
            <div>{representativeName}</div>
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">توقيع المستلم</div>
            <div>{receiverName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}