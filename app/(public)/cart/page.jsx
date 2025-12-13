'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs";
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
    setTotalPrice(0);
    const cartArray = [];
    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((product) => product.id === key);
      if (product) {
        cartArray.push({
          ...product,
          quantity: value,
        });
        setTotalPrice((prev) => prev + product.price * value);
      }
    }
    setCartArray(cartArray);
  };

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  useEffect(() => {
    if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products]);

  return cartArray.length > 0 ? (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            My <span className="text-emerald-600">DreamSaver</span> Cart
          </h1>
          <p className="mt-3 text-slate-500 text-sm sm:text-base">
            Review your selected items before checkout
          </p>
        </div>

        {/* Main Cart Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Table */}
          <div className="flex-1 bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 rounded-2xl overflow-x-auto p-6 transition-all hover:shadow-2xl">
            <table className="w-full min-w-[640px] text-slate-700">
              <thead className="border-b border-slate-300">
                <tr className="text-left text-sm sm:text-base font-medium text-slate-600">
                  <th className="py-3">Product</th>
                  <th className="py-3 text-center">Quantity</th>
                  <th className="py-3 text-center">Total</th>
                  <th className="py-3 text-center max-md:hidden">Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartArray.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-all duration-200"
                  >
                    {/* Product Details */}
                    <td className="flex items-center gap-4 py-5">
                      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-2 shadow-inner">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          width={70}
                          height={70}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm sm:text-base">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          {currency}
                          {item.price.toLocaleString()}
                        </p>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="text-center">
                      <Counter productId={item.id} />
                    </td>

                    {/* Total */}
                    <td className="text-center font-semibold text-slate-800">
                      {currency}
                      {(item.price * item.quantity).toLocaleString()}
                    </td>

                    {/* Remove */}
                    <td className="text-center max-md:hidden">
                      <button
                        onClick={() => handleDeleteItemFromCart(item.id)}
                        className="text-red-500 hover:bg-red-100/70 p-2 rounded-full active:scale-95 transition-all"
                        title="Remove Item"
                      >
                        <Trash2Icon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <OrderSummary totalPrice={totalPrice} items={cartArray} />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-50 to-slate-200">
      <h1 className="text-3xl sm:text-5xl font-semibold text-slate-700">
        Your <span className="text-emerald-600">DreamSaver</span> cart is empty
      </h1>
      <p className="mt-4 text-slate-500 text-sm sm:text-base max-w-md">
        Start setting your goals and bring your dreams to life.
      </p>
    </div>
  );
}
