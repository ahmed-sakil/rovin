import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import { Truck, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const StorefrontFooter: React.FC = () => {
  return (
    <footer className="border-t border-fastener-border bg-carbon-slate transition-colors text-xs text-machined-dim mt-auto">
      {/* Upper Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-3">
            <BrandLogo variant="horizontal" size="md" />
            <p className="text-xs text-machined-muted leading-relaxed font-normal">
              Precision gyro-assisted RC drift cars, high-clearance 4x4 trail crawlers, and CNC machined mechanical room sculptures. Chiseled aesthetics engineered for Bangladesh enthusiasts.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>100% Pre-Dispatch Telemetry Verified</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium mb-3">
              Equipment Hangar
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <Link to="/products" className="hover:text-nitro-amber transition-colors">
                  All Equipment Catalog
                </Link>
              </li>
              <li>
                <Link to="/#new-arrivals" className="hover:text-nitro-amber transition-colors">
                  Latest New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/#most-selling" className="hover:text-nitro-amber transition-colors">
                  High-Velocity Flagships
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-nitro-amber transition-colors">
                  Pilot Command Station
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Information */}
          <div>
            <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium mb-3">
              Support & Intel
            </h4>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <Link to="/about" className="hover:text-nitro-amber transition-colors">
                  About ROVIN
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-nitro-amber transition-colors">
                  Contact & Inquiry Routing
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-nitro-amber transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-nitro-amber transition-colors">
                  Terms of Operation & Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Logistics & Dispatch Protocol */}
          <div>
            <h4 className="font-orbitron font-bold text-xs uppercase tracking-wider text-machined-titanium mb-3">
              Logistics Telemetry
            </h4>
            <div className="space-y-2 font-mono text-[11px] text-machined-muted">
              <div className="flex items-start gap-2">
                <Truck className="w-3.5 h-3.5 text-nitro-amber flex-shrink-0 mt-0.5" />
                <span>Nationwide COD via Steadfast & Pathao (Dhaka ৳70 / Outside ৳130)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-nitro-amber flex-shrink-0" />
                <a href="mailto:support@rovin.com.bd" className="hover:text-nitro-amber">
                  support@rovin.com.bd
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-nitro-amber flex-shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="border-t border-fastener-border py-4 px-4 sm:px-6 bg-pitch-deep">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL
          </span>
          <div className="flex items-center gap-4 font-mono text-[10px] text-machined-dim">
            <span>2.4GHz RADIO &bull; BRUSHLESS HIGH-TORQUE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
