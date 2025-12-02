import React from 'react';
import { useCart } from '../contexts/CartContext';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { Trash } from 'lucide-react';

export default function Cart() {
    const { cartItems, removeFromCart, getCartTotal } = useCart();

    const formatIndianCurrency = (amount) => {
        if (!amount || isNaN(amount)) return "—";
        const num = Number(amount);
        return num.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR'
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 pt-24 px-4 flex flex-col items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-gray-200">Your Cart is Empty</h2>
                    <p className="text-gray-400">Looks like you haven't added any cars to your cart yet.</p>
                    <Link
                        to="/inventory"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                        Browse Inventory
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                    Shopping Cart
                    <span className="text-lg font-normal text-gray-400">({cartItems.length} items)</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="relative group">
                                <Card
                                    car={item}
                                    isCartPage={true}
                                    onRemove={() => removeFromCart(item._id)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sticky top-24 backdrop-blur-sm">
                            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span>{formatIndianCurrency(getCartTotal())}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Processing Fee</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="border-t border-gray-700 pt-4 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span>
                                    <span>{formatIndianCurrency(getCartTotal())}</span>
                                </div>
                            </div>

                                    <p className="text-sm text-gray-400 text-center">
                                Click "Buy Now" on any car to proceed with purchase
                            </p>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Secure Checkout • 100% Money Back Guarantee
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
