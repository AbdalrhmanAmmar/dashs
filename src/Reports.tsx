import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { mockVisits } from './mockData';
import { Calendar, Users, Target, Clock, Calendar as CalendarIcon } from 'lucide-react';

function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  
  const stats = useMemo(() => {
    const startDate = startOfMonth(new Date(selectedMonth));
    const endDate = endOfMonth(new Date(selectedMonth));
    
    const periodVisits = mockVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      return visitDate >= startDate && visitDate <= endDate;
    });

    // Fixed values as requested
    const expectedWorkDays = 16;
    const actualWorkDays = 3;
    const dailyAverage = 4.7;

    const uniqueDoctors = new Set(mockVisits.map(v => v.doctorName)).size;
    const targetVisits = expectedWorkDays * 5; // Assuming 5 visits per work day
    const targetDailyVisits = 5;

    const classAVisits = periodVisits.filter(v => v.classification === 'Class A').length;
    const classBVisits = periodVisits.filter(v => v.classification === 'Class B').length;
    
    const doctorsWithoutVisits = Array.from(new Set(mockVisits.map(v => v.doctorName)))
      .filter(doctor => !periodVisits.some(v => v.doctorName === doctor)).length;

    const daysWithoutReport = expectedWorkDays - actualWorkDays;
    const missedVisits = targetVisits - periodVisits.length;
    
    const visitCompletion = (periodVisits.length / targetVisits) * 100;
    const doctorCoverage = ((uniqueDoctors - doctorsWithoutVisits) / uniqueDoctors) * 100;

    return {
      totalDoctors: uniqueDoctors,
      targetVisits,
      targetDailyVisits,
      expectedWorkDays,
      actualWorkDays,
      periodTarget: targetVisits,
      actualVisits: periodVisits.length,
      classAVisits,
      classBVisits,
      dailyAverage,
      missedVisits,
      doctorsWithoutVisits,
      visitCompletion,
      doctorCoverage,
      daysWithoutReport,
    };
  }, [selectedMonth]);

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">تقرير الأداء</h1>
          <div className="flex items-center gap-4">
            <label className="text-gray-700">اختر الشهر:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">معلومات الأطباء</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">عدد الأطباء الكلي:</span>
                <span className="font-semibold text-gray-900">{stats.totalDoctors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">أطباء بدون زيارات:</span>
                <span className="font-semibold text-red-600">{stats.doctorsWithoutVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">نسبة تغطية الأطباء:</span>
                <span className="font-semibold text-green-600">{stats.doctorCoverage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">الأهداف والإنجاز</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الزيارات المستهدفة:</span>
                <span className="font-semibold text-gray-900">{stats.targetVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الزيارات المحققة:</span>
                <span className="font-semibold text-blue-600">{stats.actualVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">نسبة الإنجاز:</span>
                <span className="font-semibold text-green-600">{stats.visitCompletion.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">معدلات الزيارات</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المعدل اليومي المستهدف:</span>
                <span className="font-semibold text-gray-900">{stats.targetDailyVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المعدل اليومي الفعلي:</span>
                <span className="font-semibold text-blue-600">{stats.dailyAverage}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الزيارات الغير محققة:</span>
                <span className="font-semibold text-red-600">{stats.missedVisits}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">أيام العمل</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">أيام العمل المتوقعة:</span>
                <span className="font-semibold text-gray-900">{stats.expectedWorkDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">أيام العمل المحققة:</span>
                <span className="font-semibold text-green-600">{stats.actualWorkDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">أيام بدون تقرير:</span>
                <span className="font-semibold text-red-600">{stats.daysWithoutReport}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">تصنيف الزيارات</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">زيارات الفئة A:</span>
                <span className="font-semibold text-blue-600">{stats.classAVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">زيارات الفئة B:</span>
                <span className="font-semibold text-green-600">{stats.classBVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي الزيارات:</span>
                <span className="font-semibold text-gray-900">{stats.actualVisits}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;