import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  X,
  Package,
  Store,
  Calendar,
  DollarSign,
  Edit,
  Printer,
  Save,
  Eye,
  FileText,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface Product {
  medicine: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Order {
  id: number;
  date: string;
  pharmacy: string;
  products: Product[];
  status: "pending" | "approved" | "rejected";
  groupId?: string;
}

interface GroupedOrder {
  groupId: string;
  pharmacy: string;
  date: string;
  products: Product[];
  totalAmount: number;
  status: string;
}

const OrderCollector: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<GroupedOrder | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupedOrder | null>(null);
  const [editingProducts, setEditingProducts] = useState<Product[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(savedOrders);
  }, []);

  const handleStatusChange = (
    id: number,
    newStatus: "approved" | "rejected"
  ) => {
    const updatedOrders = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const handleGroupStatusChange = (
    groupKey: string,
    newStatus: "approved" | "rejected"
  ) => {
    const updatedOrders = orders.map((order) =>
      order.groupId === groupKey ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const handlePrintGroup = (group: GroupedOrder) => {
    setSelectedCollection(group);
    setTimeout(handlePrint, 100);
  };

  const handleViewGroup = (group: GroupedOrder) => {
    console.log("Viewing group:", group); // للتحقق من البيانات
    setSelectedCollection(group);
    setViewModalOpen(true);
  };

  const handleEditGroup = (group: GroupedOrder) => {
    setEditingGroup(group);
    setEditingProducts([...group.products]);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingGroup) return;

    const updatedOrders = orders.map((order) => {
      if (order.groupId === editingGroup.groupId) {
        return {
          ...order,
          products: editingProducts,
          // Recalculate total amount for the order if necessary
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    setEditModalOpen(false);
  };

  const handleProductQuantityChange = (index: number, newQuantity: number) => {
    const updatedProducts = [...editingProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: newQuantity,
      totalPrice: updatedProducts[index].price * newQuantity,
    };
    setEditingProducts(updatedProducts);
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const key = order.groupId || `${order.pharmacy}-${order.date}`;
    if (!acc[key]) {
      acc[key] = {
        groupId: key,
        pharmacy: order.pharmacy,
        date: order.date,
        products: [],
        totalAmount: 0,
        status: order.status,
      };
    }

    if (order.products) {
      acc[key].products.push(...order.products);
      acc[key].totalAmount += order.products.reduce(
        (sum, p) => sum + p.totalPrice,
        0
      );
    }

    return acc;
  }, {} as Record<string, GroupedOrder>);

  const safeToLocaleString = (value: number | undefined) => {
    const num = Number(value || 0);
    return isNaN(num) ? "٠" : num.toLocaleString("ar-SA");
  };

  const pendingGroups = Object.values(groupedOrders).filter(
    (group) => group.status !== "approved"
  );
  const approvedGroups = Object.values(groupedOrders).filter(
    (group) => group.status === "approved"
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">محصل الطلبيات</h2>

        {Object.keys(groupedOrders).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد طلبيات
            </h3>
            <p className="text-gray-500">
              لم يتم إرسال أي طلبيات من نموذج زيارة الصيدلية بعد
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Orders Section */}
            {pendingGroups.map((group) => (
              <div
                key={group.groupId}
                className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {group.pharmacy}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {group.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {group.products.length} صنف
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {safeToLocaleString(group.totalAmount)} ريال
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 text-sm font-semibold rounded-full ${
                          group.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {group.status === "pending"
                          ? "قيد الانتظار"
                          : "تم الرفض"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePrintGroup(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="طباعة الطلبية"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {group.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleGroupStatusChange(
                                  group.groupId,
                                  "approved"
                                )
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="تأكيد التوريد"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleGroupStatusChange(
                                  group.groupId,
                                  "rejected"
                                )
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="رفض الطلبية"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right">الدواء</th>
                        <th className="px-6 py-3 text-right">السعر</th>
                        <th className="px-6 py-3 text-right">الكمية</th>
                        <th className="px-6 py-3 text-right">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              {product.medicine}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {safeToLocaleString(product.price)} ريال
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                            {safeToLocaleString(product.totalPrice)} ريال
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={3} className="px-6 py-4 text-right">
                          الإجمالي:
                        </td>
                        <td className="px-6 py-4 text-right text-green-600">
                          {safeToLocaleString(group.totalAmount)} ريال
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Approved Orders Section */}
            {approvedGroups.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  الطلبيات الموردة
                </h3>
                <div className="space-y-4">
                  {approvedGroups.map((group) => (
                    <div
                      key={group.groupId}
                      className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
                    >
                      <div className="bg-blue-50 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full shadow-sm">
                            <Store className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-800">
                              {group.pharmacy}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <span>{group.date}</span>
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {group.products.length} صنف
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {safeToLocaleString(group.totalAmount)} ريال
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleViewGroup(group)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                            title="عرض"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            title="تعديل"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handlePrintGroup(group)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                            title="طباعة"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  تفاصيل الطلبية
                </h3>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">اسم الصيدلية:</p>
                  <p>{selectedCollection.pharmacy || "غير محدد"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">تاريخ الطلبية:</p>
                  <p>{selectedCollection.date || "غير محدد"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">عدد الأصناف:</p>
                  <p>{selectedCollection.products?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">المبلغ الإجمالي:</p>
                  <p>
                    {safeToLocaleString(selectedCollection.totalAmount)} ريال
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right">الدواء</th>
                      <th className="px-6 py-3 text-right">السعر</th>
                      <th className="px-6 py-3 text-right">الكمية</th>
                      <th className="px-6 py-3 text-right">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCollection.products?.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          {product.medicine || "--"}
                        </td>
                        <td className="px-6 py-4">
                          {safeToLocaleString(product.price)} ريال
                        </td>
                        <td className="px-6 py-4">{product.quantity || 0}</td>
                        <td className="px-6 py-4">
                          {safeToLocaleString(product.totalPrice)} ريال
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          لا توجد منتجات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setTimeout(() => handlePrint(), 100);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Printer className="w-5 h-5" />
                  طباعة الطلبية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  تعديل الطلبية
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">اسم الصيدلية:</p>
                  <p>{editingGroup.pharmacy}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">تاريخ الطلبية:</p>
                  <p>{editingGroup.date}</p>
                </div>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right">الدواء</th>
                      <th className="px-6 py-3 text-right">السعر</th>
                      <th className="px-6 py-3 text-right">الكمية</th>
                      <th className="px-6 py-3 text-right">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editingProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{product.medicine}</td>
                        <td className="px-6 py-4">
                          {safeToLocaleString(product.price)} ريال
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                              handleProductQuantityChange(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-20 p-2 border border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {safeToLocaleString(product.totalPrice)} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-lg font-bold">
                  الإجمالي:{" "}
                  {safeToLocaleString(
                    editingProducts.reduce((sum, p) => sum + p.totalPrice, 0)
                  )}{" "}
                  ريال
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="p-8 max-w-4xl mx-auto bg-white" dir="rtl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                طلبية صيدلية
              </h1>
              <div className="text-gray-600">
                تاريخ الطباعة: {new Date().toLocaleDateString("ar-SA")}
              </div>
            </div>

            {selectedCollection && (
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>اسم الصيدلية:</strong>{" "}
                      {selectedCollection.pharmacy}
                    </div>
                    <div>
                      <strong>تاريخ الطلبية:</strong> {selectedCollection.date}
                    </div>
                    <div>
                      <strong>عدد الأصناف:</strong>{" "}
                      {selectedCollection.products.length}
                    </div>
                    <div>
                      <strong>المبلغ الإجمالي:</strong>{" "}
                      {safeToLocaleString(selectedCollection.totalAmount)} ريال
                    </div>
                  </div>
                </div>

                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-right">
                        الدواء
                      </th>
                      <th className="border border-gray-300 p-3 text-right">
                        السعر
                      </th>
                      <th className="border border-gray-300 p-3 text-right">
                        الكمية
                      </th>
                      <th className="border border-gray-300 p-3 text-right">
                        المجموع
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCollection.products.map(
                      (product: Product, index: number) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">
                            {product.medicine}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {safeToLocaleString(product.price)} ريال
                          </td>
                          <td className="border border-gray-300 p-3">
                            {product.quantity}
                          </td>
                          <td className="border border-gray-300 p-3">
                            {safeToLocaleString(product.totalPrice)} ريال
                          </td>
                        </tr>
                      )
                    )}
                    <tr className="bg-gray-50 font-bold">
                      <td
                        colSpan={3}
                        className="border border-gray-300 p-3 text-right"
                      >
                        الإجمالي:
                      </td>
                      <td className="border border-gray-300 p-3">
                        {safeToLocaleString(selectedCollection.totalAmount)}{" "}
                        ريال
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-12 flex justify-between">
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <div>توقيع المندوب</div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-32 mb-2"></div>
                <div>توقيع المستلم</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCollector;
