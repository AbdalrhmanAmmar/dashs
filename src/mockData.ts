import { addDays, subDays, format } from 'date-fns';

export interface Visit {
  id: string;
  doctorName: string;
  clinicName: string;
  product1: string;
  product2: string;
  product3: string;
  samples1: number;
  samples2: number;
  samples3: number;
  visitDate: string;
  visitTime: string;
  country: string;
  area: string;
  city: string;
  address: string;
  brand: string;
  classification: string;
  specialty: string;
}

// Define locations data
const locations = {
  'المملكة العربية السعودية': {
    'المنطقة الشرقية': ['الدمام', 'الخبر', 'الظهران'],
    'المنطقة الوسطى': ['الرياض', 'الخرج', 'المجمعة'],
    'المنطقة الغربية': ['جدة', 'مكة المكرمة', 'المدينة المنورة']
  },
  'الإمارات العربية المتحدة': {
    'إمارة دبي': ['دبي', 'جبل علي'],
    'إمارة أبوظبي': ['أبوظبي', 'العين'],
    'إمارة الشارقة': ['الشارقة', 'خورفكان']
  },
  'مصر': {
    'القاهرة الكبرى': ['القاهرة', 'الجيزة', '6 أكتوبر'],
    'الإسكندرية': ['الإسكندرية', 'برج العرب'],
    'الدلتا': ['المنصورة', 'طنطا']
  }
};

const brands = ['فايزر', 'نوفارتس', 'روش', 'سانوفي', 'باير'];
const classifications = ['Class A', 'Class B', 'Class C'];
const specialties = [
  'أمراض القلب',
  'أمراض الباطنة',
  'طب الأطفال',
  'أمراض النساء والتوليد',
  'جراحة العظام',
  'طب العيون',
  'الأمراض الجلدية',
  'الأنف والأذن والحنجرة',
  'الطب النفسي',
  'المخ والأعصاب'
];

// Define doctor specialties and their associated products
const doctorProducts = {
  'د. أحمد محمد': {
    products1: ['Panadol', 'Brufen'],
    products2: ['Nexium', 'Lipitor'],
    products3: ['Concor', 'Glucophage'],
    country: 'المملكة العربية السعودية',
    area: 'المنطقة الشرقية',
    city: 'الدمام',
    address: 'شارع الملك فهد، حي النور',
    brand: 'فايزر',
    classification: 'Class A',
    specialty: 'أمراض القلب'
  },
  'د. سارة خالد': {
    products1: ['Augmentin', 'Amoxil'],
    products2: ['Zithromax', 'Crestor'],
    products3: ['Ventolin', 'Lantus'],
    country: 'الإمارات العربية المتحدة',
    area: 'إمارة دبي',
    city: 'دبي',
    address: 'شارع الشيخ زايد، برج الخليج',
    brand: 'نوفارتس',
    classification: 'Class B',
    specialty: 'طب الأطفال'
  },
  'د. محمد عبدالله': {
    products1: ['Voltaren', 'Panadol'],
    products2: ['Plavix', 'Nexium'],
    products3: ['Januvia', 'Concor'],
    country: 'مصر',
    area: 'القاهرة الكبرى',
    city: 'القاهرة',
    address: 'شارع التحرير، وسط البلد',
    brand: 'روش',
    classification: 'Class A',
    specialty: 'أمراض الباطنة'
  },
  'د. فاطمة علي': {
    products1: ['Brufen', 'Voltaren'],
    products2: ['Lipitor', 'Zithromax'],
    products3: ['Glucophage', 'Ventolin'],
    country: 'المملكة العربية السعودية',
    area: 'المنطقة الغربية',
    city: 'جدة',
    address: 'شارع فلسطين، حي الروضة',
    brand: 'سانوفي',
    classification: 'Class B',
    specialty: 'أمراض النساء والتوليد'
  },
  'د. عمر حسن': {
    products1: ['Amoxil', 'Augmentin'],
    products2: ['Crestor', 'Plavix'],
    products3: ['Lantus', 'Januvia'],
    country: 'الإمارات العربية المتحدة',
    area: 'إمارة أبوظبي',
    city: 'أبوظبي',
    address: 'شارع الكورنيش، برج المارينا',
    brand: 'باير',
    classification: 'Class C',
    specialty: 'جراحة العظام'
  },
  'د. ليلى أحمد': {
    products1: ['Panadol', 'Amoxil'],
    products2: ['Nexium', 'Crestor'],
    products3: ['Concor', 'Lantus'],
    country: 'مصر',
    area: 'الإسكندرية',
    city: 'الإسكندرية',
    address: 'طريق الحرية، سموحة',
    brand: 'فايزر',
    classification: 'Class A',
    specialty: 'طب العيون'
  },
  'د. خالد العمري': {
    products1: ['Voltaren', 'Brufen'],
    products2: ['Lipitor', 'Plavix'],
    products3: ['Glucophage', 'Januvia'],
    country: 'المملكة العربية السعودية',
    area: 'المنطقة الوسطى',
    city: 'الرياض',
    address: 'طريق الملك عبدالله، حي الورود',
    brand: 'نوفارتس',
    classification: 'Class B',
    specialty: 'الأمراض الجلدية'
  },
  'د. نورة السعيد': {
    products1: ['Augmentin', 'Panadol'],
    products2: ['Zithromax', 'Nexium'],
    products3: ['Ventolin', 'Concor'],
    country: 'الإمارات العربية المتحدة',
    area: 'إمارة الشارقة',
    city: 'الشارقة',
    address: 'شارع الاتحاد، المجاز',
    brand: 'روش',
    classification: 'Class C',
    specialty: 'الأنف والأذن والحنجرة'
  },
  'د. طارق حسين': {
    products1: ['Brufen', 'Amoxil'],
    products2: ['Crestor', 'Lipitor'],
    products3: ['Lantus', 'Glucophage'],
    country: 'مصر',
    area: 'الدلتا',
    city: 'المنصورة',
    address: 'شارع الجمهورية، حي الجامعة',
    brand: 'سانوفي',
    classification: 'Class A',
    specialty: 'الطب النفسي'
  },
  'د. رنا محمود': {
    products1: ['Voltaren', 'Augmentin'],
    products2: ['Plavix', 'Zithromax'],
    products3: ['Januvia', 'Ventolin'],
    country: 'المملكة العربية السعودية',
    area: 'المنطقة الشرقية',
    city: 'الخبر',
    address: 'شارع الأمير تركي، حي اليرموك',
    brand: 'باير',
    classification: 'Class B',
    specialty: 'المخ والأعصاب'
  }
};

const doctors = Object.keys(doctorProducts);

const clinics = [
  'عيادة الشفاء',
  'مركز الرعاية الطبي',
  'عيادة النور',
  'المركز التخصصي',
  'عيادة الأمل',
  'مستشفى السلام',
  'مركز الحياة الطبي',
  'عيادة الرحمة',
  'المركز الدولي',
  'مجمع العيادات الحديثة'
];

function generateRandomTime() {
  const hours = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
  const minutes = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateRandomVisits(count: number): Visit[] {
  const visits: Visit[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const visitDate = subDays(today, Math.floor(Math.random() * 365));
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const doctorProductList = doctorProducts[doctor];
    
    // Get random products from doctor's assigned products
    const product1 = doctorProductList.products1[Math.floor(Math.random() * doctorProductList.products1.length)];
    const product2 = doctorProductList.products2[Math.floor(Math.random() * doctorProductList.products2.length)];
    const product3 = doctorProductList.products3[Math.floor(Math.random() * doctorProductList.products3.length)];
    
    visits.push({
      id: `visit-${i + 1}`,
      doctorName: doctor,
      clinicName: clinics[Math.floor(Math.random() * clinics.length)],
      product1,
      product2,
      product3,
      samples1: Math.floor(Math.random() * 15) + 1,
      samples2: Math.floor(Math.random() * 15) + 1,
      samples3: Math.floor(Math.random() * 15) + 1,
      visitDate: visitDate.toISOString().split('T')[0],
      visitTime: generateRandomTime(),
      country: doctorProductList.country,
      area: doctorProductList.area,
      city: doctorProductList.city,
      address: doctorProductList.address,
      brand: doctorProductList.brand,
      classification: doctorProductList.classification,
      specialty: doctorProductList.specialty
    });
  }

  return visits;
}

export const mockVisits = generateRandomVisits(200);

export const getUniqueValues = (data: Visit[], field: keyof Visit) => {
  return Array.from(new Set(data.map(item => item[field])));
};

export const getUniqueMonths = (data: Visit[]) => {
  const months = new Set();
  data.forEach(visit => {
    const date = new Date(visit.visitDate);
    const monthYear = format(date, 'yyyy-MM');
    months.add(monthYear);
  });
  return Array.from(months) as string[];
};

// Helper function to get products for a specific doctor
export const getDoctorProducts = (doctorName: string) => {
  return doctorProducts[doctorName] || null;
};

// Helper function to get cities based on country and area
export const getCities = (country: string, area: string) => {
  return locations[country]?.[area] || [];
};

// Export locations data
export const getLocations = () => locations;

// Export brands and classifications
export const getBrands = () => brands;
export const getClassifications = () => classifications;
export const getSpecialties = () => specialties;