import React from 'react';

interface ReceiptProps {
  pharmacyName: string;
  date: string;
  amount: number;
  representativeName: string;
  receiverName: string;
}

const numberToArabicWords = (number: number): string => {
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const teens = ['', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const thousands = ['', 'ألف', 'ألفان', 'آلاف'];

  if (number === 0) return 'صفر';

  let words = '';
  
  // Handle thousands
  const thousandsDigit = Math.floor(number / 1000);
  if (thousandsDigit > 0) {
    if (thousandsDigit <= 3) {
      words += thousands[thousandsDigit] + ' ';
    } else {
      words += units[thousandsDigit] + ' ' + thousands[1] + ' ';
    }
    number %= 1000;
  }

  // Handle hundreds
  const hundredsDigit = Math.floor(number / 100);
  if (hundredsDigit > 0) {
    words += hundreds[hundredsDigit] + ' ';
    number %= 100;
  }

  // Handle tens and units
  if (number > 0) {
    if (number < 11) {
      words += units[number];
    } else if (number < 20) {
      words += teens[number - 10];
    } else {
      const tensDigit = Math.floor(number / 10);
      const unitsDigit = number % 10;
      if (unitsDigit > 0) {
        words += units[unitsDigit] + ' و';
      }
      words += tens[tensDigit];
    }
  }

  return words.trim();
};

const PharmacyReceipt: React.FC<ReceiptProps> = ({
  pharmacyName,
  date,
  amount,
  representativeName,
  receiverName,
}) => {
  return (
    <div className="w-[21cm] h-[29.7cm] p-8 bg-white" dir="rtl">
      <div className="border-4 border-double border-gray-800 p-8 h-full relative">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">سند قبض</h1>
          <div className="text-xl font-semibold">رقم: {Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-lg">التاريخ: {date}</div>
            <div className="text-lg">اسم الصيدلية: {pharmacyName}</div>
          </div>

          <div className="border-2 border-gray-300 p-4 rounded-lg">
            <div className="text-lg mb-2">
              استلمت من صيدلية {pharmacyName} مبلغ وقدره:
            </div>
            <div className="text-xl font-bold mb-2">{amount} ريال</div>
            <div className="text-lg">
              فقط {numberToArabicWords(amount)} ريال لا غير
            </div>
          </div>

          <div className="flex justify-between items-center mt-16">
            <div className="text-center">
              <div className="font-semibold mb-2">اسم المندوب</div>
              <div>{representativeName}</div>
              <div className="mt-8 border-t border-gray-400 pt-2">التوقيع</div>
            </div>

            <div className="text-center">
              <div className="font-semibold mb-2">اسم المستلم</div>
              <div>{receiverName}</div>
              <div className="mt-8 border-t border-gray-400 pt-2">التوقيع</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8 text-center text-sm text-gray-500">
          <div className="border-t border-gray-300 pt-4">
            هذا السند صالح لمدة شهر من تاريخ الإصدار
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="transform rotate-45 text-6xl font-bold text-gray-400">
            سند قبض رسمي
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReceipt;