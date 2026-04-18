import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "@/services/order";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const result = await getOrders();
        if (result.success) setOrders(result.data.orders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchUserOrders();
  }, []);

  return (
    <div className="animate-in fade-in duration-300 w-full">
      <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight mb-2">Order History</h1>
      <p className="text-[15px] text-gray-500 mb-8">View and track your recent purchases.</p>
      
      {isLoadingOrders ? (
        <div className="flex justify-center py-12 w-full">
          <div className="w-8 h-8 border-4 border-[#0047b3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center w-full">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-[18px] font-bold text-[#191c1d] mb-2">No orders yet</h3>
          <p className="text-gray-500 text-[14px] mb-6">Looks like you haven't made a purchase yet.</p>
          <button onClick={() => navigate("/")} className="text-[#0047b3] font-bold hover:underline cursor-pointer">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6 w-full">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden w-full">
              <div className="bg-[#f8f9fa] p-5 border-b border-gray-100 flex flex-wrap justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                  <p className="text-[14px] font-bold text-[#191c1d]">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-[14px] font-bold text-[#0047b3]">${parseFloat(order.totalAmount).toLocaleString()}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order #</p>
                  <p className="text-[14px] text-gray-700 font-mono">{order.orderNumber}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="inline-block px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-4">{order.status}</div>
                <div className="space-y-4">
                  {order.items?.map(item => {
                    let imageUrl = '/placeholder.png';
                    if (item.productImageUrl) imageUrl = item.productImageUrl;
                    else if (item.product?.imageUrls?.[0]) imageUrl = item.product.imageUrls[0];
                    else if (typeof item.productImage === "string" && item.productImage.startsWith("http")) imageUrl = item.productImage;

                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100 flex-shrink-0">
                          <img src={imageUrl} alt={item.productName || item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-[14px] font-bold text-[#191c1d] leading-tight mb-1">{item.productName || item.product?.name}</h4>
                          <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex flex-col justify-center font-bold text-[#191c1d]">
                          ${parseFloat(item.totalPrice || (item.price * item.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
