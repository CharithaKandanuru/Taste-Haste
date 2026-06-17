import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ChefHat, Truck, Home, Clock, ArrowRight } from 'lucide-react';

interface OrderSuccessPageProps {
  params: { orderId: string; orderNumber: string };
  onNavigate: (page: string) => void;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: CheckCircle, desc: 'Your order has been received', time: 0 },
  { key: 'confirmed', label: 'Confirmed', icon: Package, desc: 'Restaurant confirmed your order', time: 2 },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Kitchen is preparing your food', time: 15 },
  { key: 'packed', label: 'Packed', icon: Package, desc: 'Your order is packed and ready', time: 25 },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, desc: 'Rider is on the way', time: 35 },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!', time: 45 },
];

export default function OrderSuccessPage({ params, onNavigate }: OrderSuccessPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(s => s < statusSteps.length - 1 ? s + 1 : s);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentStatus = statusSteps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-soft">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-neutral-100 mb-1">Order Placed!</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Order #{params.orderNumber}</p>
        </div>

        {/* ETA Banner */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 mb-6 text-white text-center animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Estimated Delivery</span>
          </div>
          <p className="text-3xl font-bold font-display">30-45 minutes</p>
          <p className="text-primary-100 text-sm mt-1">We'll notify you every step of the way</p>
        </div>

        {/* Order Tracking */}
        <div className="card p-5 mb-6 animate-slide-up">
          <h2 className="font-bold text-neutral-900 dark:text-neutral-100 mb-5">Order Tracking</h2>
          <div className="space-y-0">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      isCompleted
                        ? isCurrent
                          ? 'bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900 animate-pulse-soft'
                          : 'bg-success-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-10 mt-1 transition-all duration-500 ${index < currentStep ? 'bg-success-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                    )}
                  </div>
                  <div className="pb-10 pt-1.5">
                    <p className={`font-semibold text-sm transition-all duration-500 ${isCompleted ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-600'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 transition-all duration-500 ${isCurrent ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-600'}`}>
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse-soft">
                        ● In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onNavigate('orders')} className="btn-secondary flex items-center justify-center gap-2 text-sm">
            View Orders
          </button>
          <button onClick={() => onNavigate('home')} className="btn-primary flex items-center justify-center gap-2 text-sm">
            Back to Home <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
