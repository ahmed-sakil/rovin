import React, { useState } from 'react';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Phone, Mail, MapPin, Send, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  usePageTitle('Contact Command & Support', 'Direct transmission with the ROVIN engineering crew');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('PRODUCT_INQUIRY');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/cms/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, purpose, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      setSubmitted(true);
      toast.success('Transmission Dispatched', { description: data.message });
    } catch (err: any) {
      toast.error('Dispatch Error', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-machined-titanium uppercase mb-2">
            TRANSMIT TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-nitro-amber to-nitro-orange">COMMAND</span>
          </h1>
          <p className="text-xs sm:text-sm text-machined-muted font-mono">
            Have a question about brushless drift motors, order tracking, or wholesale batches? Connect with our crew.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Details Card (1 Col) */}
          <div className="space-y-4">
            <div className="chassis-card p-5 space-y-4">
              <h3 className="font-orbitron font-bold text-xs text-machined-titanium uppercase tracking-wider pb-3 border-b border-fastener-border">
                Direct Telemetry
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-carbon-slate border border-fastener-border flex items-center justify-center text-nitro-amber flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-machined-dim uppercase block">Hotline & WhatsApp</span>
                  <a href="tel:+8801711000000" className="font-mono text-xs text-machined-silver hover:text-nitro-amber">
                    +880 1711-000000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-carbon-slate border border-fastener-border flex items-center justify-center text-nitro-amber flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-machined-dim uppercase block">Support Frequency</span>
                  <a href="mailto:support@rovin.com.bd" className="font-mono text-xs text-machined-silver hover:text-nitro-amber">
                    support@rovin.com.bd
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-carbon-slate border border-fastener-border flex items-center justify-center text-nitro-amber flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-machined-dim uppercase block">Hangar & Warehouse</span>
                  <p className="font-mono text-xs text-machined-silver leading-snug">
                    Sector 7, Uttara, Dhaka-1230, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            <div className="chassis-card p-4 border-nitro-amber/30 text-xs font-mono text-machined-muted">
              <span className="text-nitro-amber font-bold block mb-1">Response Time Protocol</span>
              Customer support inquiries and order issues are typically addressed within 2 hours during active hangar hours (10:00 AM - 10:00 PM BST).
            </div>
          </div>

          {/* Inquiry Form (2 Cols) */}
          <div className="md:col-span-2 chassis-card p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-orbitron font-bold text-lg text-machined-titanium uppercase">
                  Transmission Recorded
                </h3>
                <p className="text-xs text-machined-muted font-mono max-w-md mx-auto">
                  Your message has been stored in our command database. A technical specialist will contact you via phone or email shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="outline-btn text-xs py-2 px-4 mt-4"
                >
                  Send Another Transmission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider pb-3 border-b border-fastener-border">
                  Submit Direct Inquiry
                </h2>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Select Transmission Purpose
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  >
                    <option value="PRODUCT_INQUIRY">Technical or Product Spec Question</option>
                    <option value="ORDER_PROBLEM">Order Tracking or Delivery Issue</option>
                    <option value="WHOLESALE_BUSINESS">Wholesale & B2B Bulk Inquiries</option>
                    <option value="CUSTOM_BUILD">Custom RC Chassis or Electronics Build</option>
                    <option value="OTHER">General Support Inquiry</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sakil Ahmed"
                      className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                      BD Mobile Phone (01XXXXXXXXX)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01711223344"
                      className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-machined-muted uppercase mb-1">
                    Your Message (Min 10 characters)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, order number, or question..."
                    className="w-full bg-carbon-slate border border-fastener-border rounded px-3 py-2 text-xs text-machined-titanium focus:outline-none focus:border-nitro-amber"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full nitro-btn flex items-center justify-center gap-2 py-3 text-xs"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <StorefrontFooter />

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
