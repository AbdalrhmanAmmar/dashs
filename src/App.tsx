import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Package, LayoutDashboard, FileBarChart2, Megaphone, FlaskRound as Flask, ClipboardCheck, Store, DollarSign, ShoppingCart, FileSpreadsheet, BarChart2, Calendar, AlertTriangle } from 'lucide-react';
import Dashboard from './Dashboard';
import Reports from './Reports';
import VisitForm from './VisitForm';
import MarketingActivity from './MarketingActivity';
import SamplesForm from './SamplesForm';
import EvaluationForm from './EvaluationForm';
import PharmacyVisitForm from './PharmacyVisitForm';
import FinancialCollector from './FinancialCollector';
import OrderCollector from './OrderCollector';
import PharmacyReports from './PharmacyReports';
import PharmacyDashboard from './PharmacyDashboard';
import MissingItems from './MissingItems';
import WorkCalendar from './components/WorkCalendar';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="bg-white shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* <div className="flex space-x-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Package className="w-5 h-5" />
                <span>نموذج الزيارة</span>
              </Link>
              <Link
                to="/pharmacy"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Store className="w-5 h-5" />
                <span>زيارة صيدلية</span>
              </Link>
              <Link
                to="/samples"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Flask className="w-5 h-5" />
                <span>طلب العينات</span>
              </Link>
              <Link
                to="/marketing"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Megaphone className="w-5 h-5" />
                <span>النشاط التسويقي</span>
              </Link>
              <Link
                to="/evaluation"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>تقييم المندوب</span>
              </Link>
              <Link
                to="/calendar"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <Calendar className="w-5 h-5" />
                <span>تقويم العمل</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>لوحة التحكم</span>
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <FileBarChart2 className="w-5 h-5" />
                <span>التقارير</span>
              </Link>
              <Link
                to="/pharmacy-dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <BarChart2 className="w-5 h-5" />
                <span>لوحة تحكم. الصيدليات</span>
              </Link>
              <Link
                to="/pharmacy-reports"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>تقارير الصيدليات</span>
              </Link>
              <Link
                to="/financial-collector"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <DollarSign className="w-5 h-5" />
                <span>المحصل المالي</span>
              </Link>
              <Link
                to="/order-collector"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>محصل الطلبيات</span>
              </Link>
              <Link
                to="/missing-items"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>الطلبيات المفقودة</span>
              </Link>
            </div> */}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<VisitForm />} />
          <Route path="/pharmacy" element={<PharmacyVisitForm />} />
          <Route path="/samples" element={<SamplesForm />} />
          <Route path="/marketing" element={<MarketingActivity />} />
          <Route path="/evaluation" element={<EvaluationForm />} />
          <Route path="/calendar" element={<WorkCalendar  />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pharmacy-dashboard" element={<PharmacyDashboard />} />
          <Route path="/pharmacy-reports" element={<PharmacyReports />} />
          <Route path="/financial-collector" element={<FinancialCollector />} />
          <Route path="/order-collector" element={<OrderCollector />} />
          <Route path="/missing-items" element={<MissingItems />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;