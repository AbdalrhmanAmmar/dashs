import React, { useState, useRef } from "react";
import {
  Check,
  X,
  Printer,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  CreditCard,
  Filter,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import PharmacyReceipt from "./components/PharmacyReceipt";

interface Product {
  medicine: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface Collection {
  id: number;
  date: string;
  pharmacy: string;
  amount?: number;
  receiptNumber?: string;
  products?: Product[];
  type: "collection" | "order";
  status: "pending" | "approved" | "rejected";
  groupId?: string;
}

const FinancialCollector: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const stored = localStorage.getItem("collections");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Collection[];
      return parsed.map((item) => ({
        ...item,
        amount: item.amount || 0,
        products:
          item.products?.map((p) => ({
            ...p,
            price: p.price || 0,
            totalPrice: p.totalPrice || 0,
          })) || [],
      }));
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Collection[]>(() => {
    try {
      const stored = localStorage.getItem("orders");
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Collection[];
      return parsed.map((item) => ({
        ...item,
        amount: item.amount || 0,
        products:
          item.products?.map((p) => ({
            ...p,
            price: p.price || 0,
            totalPrice: p.totalPrice || 0,
          })) || [],
      }));
    } catch {
      return [];
    }
  });

  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ content: () => receiptRef.current });

  const handleStatusChange = (
    list: Collection[],
    setList: (val: Collection[]) => void,
    id: number,
    newStatus: "approved" | "rejected",
    key: string
  ) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setList(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleGroupStatusChange = (
    groupId: string,
    newStatus: "approved" | "rejected"
  ) => {
    const updatedOrders = orders.map((order) =>
      order.groupId === groupId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const totalCollected = collections
    .filter((c) => c.status === "approved")
    .reduce((sum, collection) => sum + (collection.amount || 0), 0);

  const filteredCollections =
    filterStatus === "all"
      ? collections
      : collections.filter((c) => c.status === filterStatus);

  const groupedOrders = orders.reduce(
    (acc, order) => {
      const key = order.groupId || `${order.pharmacy}-${order.date}`;
      if (!acc[key]) {
        acc[key] = {
          groupId: key,
          pharmacy: order.pharmacy,
          date: order.date,
          products: [],
          status: order.status,
          totalAmount: 0,
        };
      }

      if (order.products) {
        acc[key].products.push(...order.products);
        acc[key].totalAmount += order.products.reduce(
          (sum, p) => sum + (p.totalPrice || 0),
          0
        );
      }
      acc[key].status = order.status;

      return acc;
    },
    {} as Record<
      string,
      {
        groupId: string;
        pharmacy: string;
        date: string;
        products: Product[];
        status: string;
        totalAmount: number;
      }
    >
  );

  const filteredGroupedOrders = Object.entries(groupedOrders).filter(
    ([, group]) => {
      if (group.products.length === 0) return false;
      if (filterStatus === "all") return true;
      return group.status === filterStatus;
    }
  );

  const safeToLocaleString = (value: number | undefined) => {
    return (value || 0).toLocaleString();
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">المحصل المالي</h2>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  إجمالي الأموال المحصلة
                </h3>
                <p className="text-gray-600">
                  المبالغ التي تمت الموافقة عليها فقط
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {safeToLocaleString(totalCollected)} ريال
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "pending" | "approved" | "rejected"
                )
              }
              className="p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">الكل</option>
              <option value="pending">قيد الانتظار</option>
              <option value="approved">تم الموافقة</option>
              <option value="rejected">تم الرفض</option>
            </select>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            التحصيلات المالية
          </h3>
          {filteredCollections.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right">التاريخ</th>
                    <th className="px-6 py-3 text-right">الصيدلية</th>
                    <th className="px-6 py-3 text-right">المبلغ</th>
                    <th className="px-6 py-3 text-right">رقم الإيصال</th>
                    <th className="px-6 py-3 text-right">المنتجات</th>
                    <th className="px-6 py-3 text-right">الحالة</th>
                    <th className="px-6 py-3 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="px-6 py-4 text-right">
                        {collection.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {collection.pharmacy}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {safeToLocaleString(collection.amount)} ريال
                      </td>
                      <td className="px-6 py-4 text-right">
                        {collection.receiptNumber || "--"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {collection.products?.map((p, i) => (
                          <div key={i} className="mb-1">
                            <span className="font-medium">{p.medicine}</span>
                            <span className="text-gray-500 mx-1">
                              ×{p.quantity}
                            </span>
                            <span>
                              = {safeToLocaleString(p.totalPrice)} ريال
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            collection.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : collection.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {collection.status === "pending"
                            ? "قيد الانتظار"
                            : collection.status === "approved"
                            ? "تم الموافقة"
                            : "تم الرفض"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {collection.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    collections,
                                    setCollections,
                                    collection.id,
                                    "approved",
                                    "collections"
                                  )
                                }
                                className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                                title="موافقة"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    collections,
                                    setCollections,
                                    collection.id,
                                    "rejected",
                                    "collections"
                                  )
                                }
                                className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                                title="رفض"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCollection(collection);
                              setTimeout(handlePrint, 100);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            title="طباعة"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">لا توجد تحصيلات حالياً</p>
          )}
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            طلبيات الصيدليات
          </h3>
          {filteredGroupedOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredGroupedOrders.map(([groupId, group]) => (
                <div
                  key={groupId}
                  className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
                >
                  <div
                    className="bg-gray-50 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleGroupExpansion(groupId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-1 bg-white rounded-full shadow">
                        {expandedGroups.has(groupId) ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">
                          {group.pharmacy}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {group.products.length} صنف
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {safeToLocaleString(group.totalAmount)} ريال
                          </span>
                          <span>{group.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          group.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : group.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {group.status === "pending"
                          ? "قيد الانتظار"
                          : group.status === "approved"
                          ? "تم الموافقة"
                          : "تم الرفض"}
                      </span>
                      {group.status === "pending" && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGroupStatusChange(groupId, "approved");
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                            title="موافقة على المجموعة"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGroupStatusChange(groupId, "rejected");
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            title="رفض المجموعة"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedGroups.has(groupId) && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">
                                الدواء
                              </th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">
                                السعر
                              </th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">
                                الكمية
                              </th>
                              <th className="px-6 py-3 text-right font-medium text-gray-500">
                                المجموع
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.products.map((product, i) => (
                              <tr key={i}>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                  {product.medicine}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                  {safeToLocaleString(product.price)} ريال
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                  {product.quantity}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                  {safeToLocaleString(product.totalPrice)} ريال
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td
                                colSpan={3}
                                className="px-6 py-4 text-right font-bold text-gray-900"
                              >
                                الإجمالي:
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-gray-900">
                                {safeToLocaleString(group.totalAmount)} ريال
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">لا توجد طلبيات حالياً</p>
          )}
        </div>
      </div>

      <div className="hidden">
        <div ref={receiptRef}>
          {selectedCollection && (
            <PharmacyReceipt
              pharmacyName={selectedCollection.pharmacy}
              date={selectedCollection.date}
              amount={selectedCollection.amount || 0}
              products={selectedCollection.products || []}
              representativeName="محمد أحمد"
              receiverName="أحمد محمد"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCollector;
