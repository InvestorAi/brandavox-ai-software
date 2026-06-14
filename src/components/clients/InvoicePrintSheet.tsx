// Brandavox Modernist Invoice Print Sheet Component
// Location: src/components/clients/InvoicePrintSheet.tsx

import React from 'react';
import { X, Printer, ArrowLeft } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePrintSheetProps {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  onClose: () => void;
}

export function InvoicePrintSheet({
  clientName,
  clientCompany,
  clientEmail,
  invoiceNumber,
  date,
  dueDate,
  items,
  onClose,
}: InvoicePrintSheetProps) {
  // Compute totals
  const subtotal = items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const tax = subtotal * 0.05; // 5% mock agency tax
  const total = subtotal + tax;

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Dynamic CSS block to override stylesheet during browser printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 2cm !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Container */}
      <div className="bg-surface border border-border-custom rounded-card w-full max-w-4xl overflow-hidden flex flex-col my-8 no-print">
        
        {/* Actions header */}
        <div className="px-6 py-4 border-b border-border-custom bg-background/50 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Console</span>
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={triggerPrint}
              className="bg-accent hover:bg-accent-hover text-white font-mono text-xs px-4 py-2 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 border border-border-custom text-text-muted hover:text-text-primary rounded-badge transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-8 md:p-12 overflow-y-auto bg-background/30 flex justify-center no-print">
          <div
            id="print-area"
            className="w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] font-sans border border-zinc-200 text-left leading-normal"
          >
            
            {/* Letterhead Logo */}
            <div className="flex justify-between items-start border-b-2 border-black pb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-black" />
                  <span className="font-display text-lg font-bold tracking-wider text-black">
                    BRANDAVOX
                  </span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Creative Operations Agency
                </p>
              </div>

              <div className="text-right font-mono text-xs text-zinc-500 space-y-0.5">
                <p className="font-bold text-black">Brandavox Group LLC</p>
                <p>12 Marina Boulevard, Level 18</p>
                <p>Singapore 018982</p>
                <p>billing@brandavox.co</p>
              </div>
            </div>

            {/* Invoice Meta coordinates */}
            <div className="grid grid-cols-2 gap-8 py-10 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Billed To
                  </span>
                  <p className="font-bold text-black">{clientCompany}</p>
                  <p className="text-zinc-600">{clientName}</p>
                  <p className="text-zinc-500 font-mono">{clientEmail}</p>
                </div>
              </div>

              <div className="space-y-3 text-right">
                <div>
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block mb-1">
                    Invoice Coordinates
                  </span>
                  <p className="font-mono font-bold text-black">ID: {invoiceNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-right">
                  <div>
                    <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block">
                      Issue Date
                    </span>
                    <span className="font-mono text-zinc-700">{date}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block">
                      Due Date
                    </span>
                    <span className="font-mono text-zinc-700">{dueDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items Table */}
            <div className="mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black text-zinc-400 font-mono text-[9px] uppercase tracking-widest">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center w-16">Qty</th>
                    <th className="py-2 text-right w-24">Unit Price</th>
                    <th className="py-2 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="text-zinc-800">
                      <td className="py-3 font-semibold text-black">{item.description}</td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">
                        ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-black">
                        ${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals panel */}
            <div className="mt-8 border-t border-zinc-200 pt-6 flex justify-end">
              <div className="w-64 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Service Tax (5%)</span>
                  <span className="font-mono font-medium">${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black border-t border-black pt-2">
                  <span>Invoice Total</span>
                  <span className="font-mono">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="mt-16 pt-8 border-t border-zinc-100 text-[10px] text-zinc-400 space-y-4 font-mono">
              <div className="space-y-1">
                <p className="font-bold text-zinc-600 uppercase tracking-widest text-[8px]">Payment Terms</p>
                <p>Payment is due within 15 days of invoice issue date. Transmit payments via bank wire transfer.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-zinc-600 uppercase tracking-widest text-[8px]">Wire Transfer Details</p>
                <p>Bank: Swiss National Bank, Zurich | SWIFT: SNBZZZH1A | Account: 0048-99431-29</p>
              </div>
              <p className="text-center pt-8 text-zinc-300">Thank you for your partnership with Brandavox.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
