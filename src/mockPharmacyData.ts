import { addDays, subDays, format } from 'date-fns';

export interface PharmacyVisit {
  id: number;
  date: string;
  time: string;
  pharmacy: string;
  pharmacyId: string;
  location: {
    city: string;
    area: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  contact: {
    pharmacist: string;
    phone: string;
    email: string;
  };
  medicine?: string;
  quantity?: number;
  amount?: number;
  receiptNumber?: string;
  type: 'collection' | 'order' | 'visit' | 'promotion';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  representative: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'regular' | 'new_client' | 'vip' | 'follow_up';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check';
  discount?: number;
  tax?: number;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
    manufacturer: string;
  }>;
}

const pharmacies = [
  {
    name: 'صيدلية نبض الحياة',
    id: 'ZLITEN_001',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة البديل فارما',
    id: 'ZLITEN_002',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية المركز التخصصي',
    id: 'ZLITEN_003',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية العلمين',
    id: 'ZLITEN_004',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة الهدى زليتن',
    id: 'ZLITEN_005',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة اليم',
    id: 'ZLITEN_006',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية الفردوس',
    id: 'ZLITEN_007',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة قطرة الندى',
    id: 'ZLITEN_008',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية نور المنشية 2',
    id: 'ZLITEN_009',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية عروس البحر',
    id: 'ZLITEN_010',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة الصواب سوق بن والي',
    id: 'ZLITEN_011',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة الزيتونة الصحية',
    id: 'ZLITEN_012',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة عوافي الخير',
    id: 'ZLITEN_013',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة الرسالة',
    id: 'ZLITEN_014',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة تاج ليبيا',
    id: 'ZLITEN_015',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة بيت الجمال للعطور',
    id: 'ZLITEN_016',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'مركز لافندر',
    id: 'ZLITEN_017',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'شركة التعاون',
    id: 'ZLITEN_018',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  },
  {
    name: 'صيدلية الزيتونة',
    id: 'ZLITEN_019',
    city: 'زليتن',
    area: 'زليتن',
    address: 'المنطقة الوسطى',
    pharmacist: 'وليد القاضي',
    phone: '',
    email: '',
    coordinates: { lat: 0, lng: 0 }
  }
];

const medicines = [
  { name: 'Panadol', category: 'مسكنات', manufacturer: 'GSK', unitPrice: 15 },
  { name: 'Brufen', category: 'مضادات الالتهاب', manufacturer: 'Abbott', unitPrice: 20 },
  // ... باقي الأدوية بنفس الهيكل
];

const representatives = [
  'أحمد محمد الشمري',
  'فاطمة علي القحطاني',
  'خالد عبدالله العتيبي',
  'نورا سعد الدوسري',
  'محمد حسن الغامدي',
  'عائشة محمد الأنصاري',
  'سارة أحمد الثقفي',
  'عبدالرحمن علي الخالدي',
  'وليد القاضي'
];

const paymentMethods = ['cash', 'card', 'transfer', 'check'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const categories = ['regular', 'new_client', 'vip', 'follow_up'];
const statuses = ['pending', 'approved', 'rejected', 'completed'];
const types = ['collection', 'order', 'visit', 'promotion'];

function generateRandomTime() {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateRandomProducts(count: number = Math.floor(Math.random() * 5) + 1) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const medicine = medicines[Math.floor(Math.random() * medicines.length)];
    const quantity = Math.floor(Math.random() * 50) + 1;
    const unitPrice = medicine.unitPrice + (Math.random() * 10 - 5); // Add some price variation
    const totalPrice = quantity * unitPrice;
    
    products.push({
      name: medicine.name,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      category: medicine.category,
      manufacturer: medicine.manufacturer
    });
  }
  return products;
}

function generateMockPharmacyData(count: number = 500): PharmacyVisit[] {
  const visits: PharmacyVisit[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const visitDate = subDays(today, Math.floor(Math.random() * 365));
    const pharmacy = pharmacies[Math.floor(Math.random() * pharmacies.length)];
    const type = types[Math.floor(Math.random() * types.length)] as PharmacyVisit['type'];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as PharmacyVisit['status'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as PharmacyVisit['priority'];
    const category = categories[Math.floor(Math.random() * categories.length)] as PharmacyVisit['category'];
    const representative = representatives[Math.floor(Math.random() * representatives.length)];
    
    let visitData: Partial<PharmacyVisit> = {
      id: i + 1,
      date: visitDate.toISOString().split('T')[0],
      time: generateRandomTime(),
      pharmacy: pharmacy.name,
      pharmacyId: pharmacy.id,
      location: {
        city: pharmacy.city,
        area: pharmacy.area,
        address: pharmacy.address,
        coordinates: pharmacy.coordinates
      },
      contact: {
        pharmacist: pharmacy.pharmacist,
        phone: pharmacy.phone,
        email: pharmacy.email
      },
      type,
      status,
      representative,
      priority,
      category,
      notes: Math.random() > 0.7 ? 'ملاحظات إضافية حول الزيارة' : undefined
    };

    if (type === 'collection') {
      const products = generateRandomProducts();
      const totalAmount = products.reduce((sum, p) => sum + p.totalPrice, 0);
      const discount = Math.random() > 0.8 ? Math.floor(Math.random() * 10) + 5 : 0;
      const tax = totalAmount * 0.15; // 15% VAT
      const finalAmount = totalAmount - (totalAmount * discount / 100) + tax;

      visitData = {
        ...visitData,
        amount: Math.round(finalAmount * 100) / 100,
        receiptNumber: `RCP-${Date.now()}-${i}`,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] as PharmacyVisit['paymentMethod'],
        discount,
        tax: Math.round(tax * 100) / 100,
        products
      };
    } else if (type === 'order') {
      const medicine = medicines[Math.floor(Math.random() * medicines.length)];
      visitData = {
        ...visitData,
        medicine: medicine.name,
        quantity: Math.floor(Math.random() * 100) + 1
      };
    }

    visits.push(visitData as PharmacyVisit);
  }

  return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockPharmacyVisits = generateMockPharmacyData(500);

export const getPharmacyStats = (visits: PharmacyVisit[]) => {
  const totalPharmacies = new Set(visits.map(v => v.pharmacyId)).size;
  const totalCollections = visits
    .filter(v => v.type === 'collection' && v.amount)
    .reduce((sum, v) => sum + (v.amount || 0), 0);
  
  const totalOrders = visits
    .filter(v => v.type === 'order')
    .reduce((sum, v) => sum + (v.quantity || 0), 0);

  const avgOrderValue = visits
    .filter(v => v.type === 'collection' && v.amount)
    .reduce((sum, v, _, arr) => sum + (v.amount || 0) / arr.length, 0);

  const topPharmacies = Object.entries(
    visits.reduce((acc, v) => {
      if (v.type === 'collection' && v.amount) {
        acc[v.pharmacy] = (acc[v.pharmacy] || 0) + v.amount;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topMedicines = Object.entries(
    visits
      .filter(v => v.type === 'order' && v.medicine)
      .reduce((acc, v) => {
        acc[v.medicine!] = (acc[v.medicine!] || 0) + (v.quantity || 0);
        return acc;
      }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const statusDistribution = visits.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeDistribution = visits.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityDistribution = visits.reduce((acc, v) => {
    acc[v.location.city] = (acc[v.location.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalPharmacies,
    totalCollections: Math.round(totalCollections * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topPharmacies,
    topMedicines,
    statusDistribution,
    typeDistribution,
    cityDistribution
  };
};

export const getPharmacyList = () => pharmacies;
export const getMedicineList = () => medicines;
export const getRepresentativeList = () => representatives;