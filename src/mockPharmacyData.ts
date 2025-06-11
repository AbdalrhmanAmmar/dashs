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
    name: 'صيدلية الشفاء الطبية',
    id: 'SHIFA_001',
    city: 'الرياض',
    area: 'حي الملك فهد',
    address: 'شارع الملك فهد، مجمع الشفاء التجاري',
    pharmacist: 'د. أحمد محمد الشمري',
    phone: '+966501234567',
    email: 'shifa.pharmacy@email.com',
    coordinates: { lat: 24.7136, lng: 46.6753 }
  },
  {
    name: 'صيدلية النهدي المركزية',
    id: 'NAHDI_002',
    city: 'جدة',
    area: 'حي الروضة',
    address: 'طريق الملك عبدالعزيز، برج النهدي',
    pharmacist: 'د. فاطمة علي القحطاني',
    phone: '+966502345678',
    email: 'nahdi.central@email.com',
    coordinates: { lat: 21.4858, lng: 39.1925 }
  },
  {
    name: 'صيدلية الدواء الذكية',
    id: 'SMART_003',
    city: 'الدمام',
    area: 'حي الفيصلية',
    address: 'شارع الأمير محمد بن فهد، مول الراشد',
    pharmacist: 'د. خالد عبدالله العتيبي',
    phone: '+966503456789',
    email: 'smart.pharmacy@email.com',
    coordinates: { lat: 26.4207, lng: 50.0888 }
  },
  {
    name: 'صيدلية الحياة الصحية',
    id: 'HAYAT_004',
    city: 'الرياض',
    area: 'حي العليا',
    address: 'طريق الملك فهد، برج الحياة الطبي',
    pharmacist: 'د. نورا سعد الدوسري',
    phone: '+966504567890',
    email: 'hayat.health@email.com',
    coordinates: { lat: 24.6877, lng: 46.7219 }
  },
  {
    name: 'صيدلية الرعاية المتقدمة',
    id: 'CARE_005',
    city: 'مكة المكرمة',
    area: 'حي العزيزية',
    address: 'شارع إبراهيم الخليل، مجمع الرعاية',
    pharmacist: 'د. محمد حسن الغامدي',
    phone: '+966505678901',
    email: 'advanced.care@email.com',
    coordinates: { lat: 21.3891, lng: 39.8579 }
  },
  {
    name: 'صيدلية السلام الطبية',
    id: 'SALAM_006',
    city: 'المدينة المنورة',
    area: 'حي قباء',
    address: 'طريق قباء، مركز السلام التجاري',
    pharmacist: 'د. عائشة محمد الأنصاري',
    phone: '+966506789012',
    email: 'salam.medical@email.com',
    coordinates: { lat: 24.4539, lng: 39.5775 }
  },
  {
    name: 'صيدلية الصحة الشاملة',
    id: 'HEALTH_007',
    city: 'الطائف',
    area: 'حي الشهداء',
    address: 'شارع الملك خالد، مجمع الصحة',
    pharmacist: 'د. سارة أحمد الثقفي',
    phone: '+966507890123',
    email: 'comprehensive.health@email.com',
    coordinates: { lat: 21.2703, lng: 40.4158 }
  },
  {
    name: 'صيدلية المدينة الحديثة',
    id: 'MODERN_008',
    city: 'الخبر',
    area: 'حي الراكة',
    address: 'شارع الأمير فيصل بن فهد، برج المدينة',
    pharmacist: 'د. عبدالرحمن علي الخالدي',
    phone: '+966508901234',
    email: 'modern.city@email.com',
    coordinates: { lat: 26.2172, lng: 50.1971 }
  },
  {
    name: 'صيدلية الأمل الطبية',
    id: 'AMAL_009',
    city: 'بريدة',
    area: 'حي الإسكان',
    address: 'طريق الملك عبدالعزيز، مجمع الأمل',
    pharmacist: 'د. منى عبدالله المطيري',
    phone: '+966509012345',
    email: 'amal.medical@email.com',
    coordinates: { lat: 26.3260, lng: 43.9750 }
  },
  {
    name: 'صيدلية الوفاء الذهبية',
    id: 'WAFA_010',
    city: 'أبها',
    area: 'حي المنهل',
    address: 'شارع الملك فيصل، برج الوفاء',
    pharmacist: 'د. هند محمد عسيري',
    phone: '+966500123456',
    email: 'wafa.golden@email.com',
    coordinates: { lat: 18.2164, lng: 42.5053 }
  },
  {
    name: 'صيدلية التقنية الطبية',
    id: 'TECH_011',
    city: 'الرياض',
    area: 'حي الياسمين',
    address: 'طريق الأمير تركي بن عبدالعزيز، مول التقنية',
    pharmacist: 'د. يوسف سالم الحربي',
    phone: '+966501234568',
    email: 'medical.tech@email.com',
    coordinates: { lat: 24.7744, lng: 46.7383 }
  },
  {
    name: 'صيدلية الخليج الطبية',
    id: 'GULF_012',
    city: 'الدمام',
    area: 'حي الشاطئ',
    address: 'كورنيش الدمام، مجمع الخليج',
    pharmacist: 'د. ريم خالد البحريني',
    phone: '+966502345679',
    email: 'gulf.medical@email.com',
    coordinates: { lat: 26.4282, lng: 50.1063 }
  }
];

const medicines = [
  { name: 'Panadol', category: 'مسكنات', manufacturer: 'GSK', unitPrice: 15 },
  { name: 'Brufen', category: 'مضادات الالتهاب', manufacturer: 'Abbott', unitPrice: 20 },
  { name: 'Nexium', category: 'أدوية الجهاز الهضمي', manufacturer: 'AstraZeneca', unitPrice: 45 },
  { name: 'Lipitor', category: 'أدوية القلب', manufacturer: 'Pfizer', unitPrice: 85 },
  { name: 'Concor', category: 'أدوية الضغط', manufacturer: 'Merck', unitPrice: 65 },
  { name: 'Glucophage', category: 'أدوية السكري', manufacturer: 'Merck', unitPrice: 25 },
  { name: 'Augmentin', category: 'مضادات حيوية', manufacturer: 'GSK', unitPrice: 40 },
  { name: 'Amoxil', category: 'مضادات حيوية', manufacturer: 'GSK', unitPrice: 30 },
  { name: 'Zithromax', category: 'مضادات حيوية', manufacturer: 'Pfizer', unitPrice: 55 },
  { name: 'Crestor', category: 'أدوية الكوليسترول', manufacturer: 'AstraZeneca', unitPrice: 95 },
  { name: 'Ventolin', category: 'أدوية الربو', manufacturer: 'GSK', unitPrice: 35 },
  { name: 'Lantus', category: 'أنسولين', manufacturer: 'Sanofi', unitPrice: 150 },
  { name: 'Voltaren', category: 'مضادات الالتهاب', manufacturer: 'Novartis', unitPrice: 25 },
  { name: 'Plavix', category: 'مضادات التجلط', manufacturer: 'Sanofi', unitPrice: 120 },
  { name: 'Januvia', category: 'أدوية السكري', manufacturer: 'Merck', unitPrice: 110 },
  { name: 'Symbicort', category: 'أدوية الربو', manufacturer: 'AstraZeneca', unitPrice: 180 },
  { name: 'Humira', category: 'أدوية المناعة', manufacturer: 'AbbVie', unitPrice: 2500 },
  { name: 'Xarelto', category: 'مضادات التجلط', manufacturer: 'Bayer', unitPrice: 200 },
  { name: 'Eliquis', category: 'مضادات التجلط', manufacturer: 'BMS', unitPrice: 220 },
  { name: 'Ozempic', category: 'أدوية السكري', manufacturer: 'Novo Nordisk', unitPrice: 450 }
];

const representatives = [
  'أحمد محمد الشمري',
  'فاطمة علي القحطاني', 
  'خالد عبدالله العتيبي',
  'نورا سعد الدوسري',
  'محمد حسن الغامدي',
  'عائشة محمد الأنصاري',
  'سارة أحمد الثقفي',
  'عبدالرحمن علي الخالدي'
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