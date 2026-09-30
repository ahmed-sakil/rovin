import React from 'react';
import { Printer, X, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ThermalShippingLabelProps {
  order: any;
  consignment?: any;
  onClose: () => void;
  onMarkPrinted?: () => void;
}

export const ThermalShippingLabel: React.FC<ThermalShippingLabelProps> = ({
  order,
  consignment,
  onClose,
  onMarkPrinted,
}) => {
  const handlePrint = () => {
    window.print();
    if (onMarkPrinted) onMarkPrinted();
    toast.success('Thermal Label Sent to Printer');
  };

  const trackingCode = consignment?.trackingCode || consignment?.consignmentId || `ROV-${order.orderNumber}`;
  const courierName = consignment?.courierProvider || 'STEADFAST';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitch-obsidian/85 backdrop-blur-md overflow-y-auto">
      {/* Container Dialog */}
      <div className="bg-carbon-card border border-fastener-gunmetal rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-fastener-border mb-6 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber"></span>
            <span className="font-orbitron font-bold text-xs uppercase text-machined-titanium tracking-wider">
              4×6" THERMAL SHIPPING LABEL (100×150mm)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="nitro-btn text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-nitro-sm"
            >
              <Printer className="w-4 h-4" /> Print Label
            </button>
            <button onClick={onClose} className="text-machined-dim hover:text-machined-titanium p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4x6 Thermal Label Canvas (100mm x 150mm layout) */}
        <div
          id="rovin-thermal-label"
          className="bg-white text-black p-6 rounded-lg font-sans border border-black shadow-lg mx-auto print:m-0 print:border-none print:shadow-none print:w-full print:h-full"
          style={{ width: '100%', maxWidth: '420px', minHeight: '580px' }}
        >
          {/* Header & Logo */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
            <div>
              <h1 className="font-black text-2xl tracking-[0.2em] font-mono leading-none">ROVIN</h1>
              <p className="text-[9px] font-bold tracking-widest text-gray-700 mt-1 uppercase font-mono">
                PRECISION RC & TECH NOVELTIES
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block border-2 border-black px-2 py-0.5 font-bold font-mono text-xs uppercase">
                {courierName}
              </span>
              <p className="text-[10px] font-mono text-gray-600 mt-0.5">Air/Ground Express</p>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="text-center py-2 border-b-2 border-black mb-3">
            <div className="h-12 flex items-center justify-center gap-1 mx-auto overflow-hidden">
              {/* High-contrast simulated Code128 pattern */}
              {[4, 2, 6, 2, 4, 3, 2, 5, 2, 4, 6, 2, 3, 5, 2, 4, 3, 6, 2, 4, 2, 5, 3, 2, 4, 6, 2, 3, 5, 2, 4, 2, 6, 3, 4, 2, 5, 2, 4, 6].map((w, i) => (
                <div key={i} className="bg-black h-12" style={{ width: `${w}px` }} />
              ))}
            </div>
            <p className="font-mono font-bold text-sm tracking-widest mt-1 uppercase">
              *{trackingCode}*
            </p>
          </div>

          {/* Recipient Details Block */}
          <div className="border-b-2 border-black pb-3 mb-3">
            <span className="text-[9px] font-mono font-bold uppercase text-gray-500 block">Deliver To:</span>
            <h2 className="font-black text-base uppercase leading-tight mt-0.5">{order.customerName}</h2>
            <p className="font-mono font-black text-lg text-black tracking-wide my-1">
              📞 {order.customerPhone}
            </p>
            <p className="text-xs font-semibold leading-snug mt-1">
              {order.deliveryAddress}
            </p>
            <div className="flex items-center gap-2 mt-2 font-mono text-xs font-bold">
              <span className="bg-black text-white px-2 py-0.5 rounded uppercase">
                THANA: {order.thana}
              </span>
              <span className="border border-black px-2 py-0.5 rounded uppercase">
                DISTRICT: {order.district}
              </span>
            </div>
          </div>

          {/* COD Collection Box (Prominent for Rider) */}
          <div className="border-2 border-black bg-gray-100 p-2.5 rounded text-center mb-3">
            <span className="text-[10px] font-mono font-bold uppercase block text-gray-700">
              Cash on Delivery (COD) Amount to Collect:
            </span>
            <span className="font-black text-2xl font-mono block leading-tight text-black">
              {order.paymentMethod === 'COD' ? `৳${order.totalAmount.toLocaleString()}` : 'PAID (PREPAID MFS)'}
            </span>
          </div>

          {/* Items Summary Manifest */}
          <div className="border-b-2 border-black pb-2 mb-3">
            <span className="text-[9px] font-mono font-bold uppercase text-gray-500 block mb-1">
              Package Manifest:
            </span>
            <ul className="text-xs font-mono space-y-1">
              {order.orderItems?.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between">
                  <span className="truncate pr-2 font-semibold">
                    {item.product?.title || 'ROVIN Unit'} {item.chosenColor ? `(${item.chosenColor})` : ''}
                  </span>
                  <span className="font-bold flex-shrink-0">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sender / Hangar Details */}
          <div className="text-[10px] font-mono text-gray-600 flex justify-between items-end pt-1">
            <div>
              <span className="font-bold text-black block uppercase">Shipper: ROVIN Bangladesh</span>
              <span>Uttara Hangar, Sector 7, Dhaka</span>
              <span className="block">Support: +880 1711-000000</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-black uppercase">Order: {order.orderNumber}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Print Stylesheet Hook */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #rovin-thermal-label, #rovin-thermal-label * {
              visibility: visible;
            }
            #rovin-thermal-label {
              position: fixed;
              left: 0;
              top: 0;
              width: 100mm !important;
              height: 150mm !important;
              max-width: 100mm !important;
              margin: 0 !important;
              padding: 6mm !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        ` }} />
      </div>
    </div>
  );
};
