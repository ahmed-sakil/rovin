import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Truck,
  Clock,
  Users,
  Globe,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyReport {
  todayNewUsers: number;
  todayUniqueVisitors: number;
  todayOrdersCount: number;
  todayCompletedOrders: number;
  todayRevenue: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  dailyReport?: DailyReport;
  statusDistribution: Record<string, number>;
  stockDistribution: Array<{ name: string; count: number; color: string }>;
  salesTrend: Array<{ day: string; sales: number; orders: number }>;
  categories: Array<{ name: string; count: number }>;
  recentOrders: Array<any>;
  recentLogs: Array<any>;
}

export const AdminDashboard: React.FC = () => {
  usePageTitle('Admin Command Telemetry', 'Comprehensive e-commerce analytics and inventory ledger');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      toast.error('Telemetry Sync Error', { description: 'Failed to aggregate dashboard analytics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const maxSale = stats?.salesTrend.reduce((max, p) => Math.max(max, p.sales), 1) || 50000;

  return (
    <AdminLayout
      title="COMMAND TELEMETRY DASHBOARD"
      comment="Real-time multi-channel overview: revenue, inventory health, courier pipeline, and audit logs."
      action={
        <button
          onClick={fetchStats}
          disabled={loading}
          className="outline-btn flex items-center gap-2 py-2 px-3 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Recalibrate Telemetry
        </button>
      }
    >
      {/* 0. Daily Performance Report (Today) */}
      <div className="chassis-card p-5 mb-6 border-nitro-amber/30 bg-gradient-to-r from-carbon-card via-carbon-slate/60 to-carbon-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-fastener-border gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <h2 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-nitro-amber" />
              Daily Performance Report (Today)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-nitro-amber bg-nitro-amber/10 px-2.5 py-1 rounded border border-nitro-amber/30">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* New Accounts Today */}
          <div className="p-3.5 rounded-lg bg-carbon-slate/80 border border-fastener-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-machined-dim mb-1">
              <span className="text-[11px] font-mono uppercase">New Accounts</span>
              <Users className="w-3.5 h-3.5 text-nitro-amber" />
            </div>
            <div className="font-orbitron font-black text-xl text-machined-titanium">
              {stats?.dailyReport?.todayNewUsers ?? 0}
            </div>
            <span className="text-[10px] font-mono text-machined-dim mt-1">Registrations today</span>
          </div>

          {/* Unique IP Visitors Today */}
          <div className="p-3.5 rounded-lg bg-carbon-slate/80 border border-fastener-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-machined-dim mb-1">
              <span className="text-[11px] font-mono uppercase">Unique Visitors</span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-orbitron font-black text-xl text-cyan-400">
              {stats?.dailyReport?.todayUniqueVisitors ?? 0}
            </div>
            <span className="text-[10px] font-mono text-machined-dim mt-1">Distinct client IPs</span>
          </div>

          {/* Orders Received Today */}
          <div className="p-3.5 rounded-lg bg-carbon-slate/80 border border-fastener-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-machined-dim mb-1">
              <span className="text-[11px] font-mono uppercase">Orders Placed</span>
              <ShoppingBag className="w-3.5 h-3.5 text-nitro-amber" />
            </div>
            <div className="font-orbitron font-black text-xl text-nitro-amber">
              {stats?.dailyReport?.todayOrdersCount ?? 0}
            </div>
            <span className="text-[10px] font-mono text-machined-dim mt-1">Received today</span>
          </div>

          {/* Orders Completed Today */}
          <div className="p-3.5 rounded-lg bg-carbon-slate/80 border border-fastener-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-machined-dim mb-1">
              <span className="text-[11px] font-mono uppercase">Completed</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-orbitron font-black text-xl text-emerald-400">
              {stats?.dailyReport?.todayCompletedOrders ?? 0}
            </div>
            <span className="text-[10px] font-mono text-machined-dim mt-1">Delivered today</span>
          </div>

          {/* Today's Revenue */}
          <div className="p-3.5 rounded-lg bg-carbon-slate/80 border border-fastener-border flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-machined-dim mb-1">
              <span className="text-[11px] font-mono uppercase">Today's Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-nitro-amber" />
            </div>
            <div className="font-orbitron font-black text-xl text-machined-titanium truncate">
              ৳{(stats?.dailyReport?.todayRevenue ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-1">Gross sales today</span>
          </div>
        </div>
      </div>

      {/* 1. Top KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="chassis-card p-5">
          <div className="flex items-center justify-between text-machined-dim mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-machined-muted">Total Gross Volume</span>
            <DollarSign className="w-4 h-4 text-nitro-amber" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium">
              ৳{(stats?.totalRevenue || 0).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] font-mono text-machined-dim mt-2">Aggregated BDT revenue across all channels</p>
        </div>

        <div className="chassis-card p-5">
          <div className="flex items-center justify-between text-machined-dim mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-machined-muted">Total Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-nitro-amber" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium">
              {stats?.totalOrders || 0}
            </span>
            <span className="telemetry-tag border-nitro-amber/30 text-nitro-amber text-[10px]">
              {stats?.statusDistribution?.PENDING || 0} PENDING
            </span>
          </div>
          <p className="text-[11px] font-mono text-machined-dim mt-2">Steadfast & Pathao courier queue</p>
        </div>

        <div className="chassis-card p-5">
          <div className="flex items-center justify-between text-machined-dim mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-machined-muted">Cataloged SKUs</span>
            <Package className="w-4 h-4 text-machined-silver" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium">
              {stats?.totalProducts || 0}
            </span>
            <span className="text-xs font-mono text-machined-muted">
              in {stats?.categories.length || 0} categories
            </span>
          </div>
          <p className="text-[11px] font-mono text-machined-dim mt-2">Active precision products in stock</p>
        </div>

        <div className="chassis-card p-5 border-nitro-amber/40">
          <div className="flex items-center justify-between text-machined-dim mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-nitro-amber font-semibold">Low-Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-nitro-amber animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron font-black text-2xl sm:text-3xl text-nitro-amber">
              {stats?.lowStockCount || 0}
            </span>
            <span className="telemetry-tag border-red-500/40 text-red-400 text-[10px]">
              {stats?.outOfStockCount || 0} DEPLETED
            </span>
          </div>
          <p className="text-[11px] font-mono text-machined-dim mt-2">SKUs below safety stock threshold (&le;5)</p>
        </div>
      </div>

      {/* 2. Visualizations Row 1: Interactive Sales Trend & Inventory Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Interactive 7-Day Revenue Trend (SVG Area Chart) */}
        <div className="lg:col-span-2 chassis-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-nitro-amber"></span>
                <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider">
                  Weekly Revenue Velocity (BDT)
                </h3>
              </div>
              <p className="text-xs text-machined-dim font-mono mt-0.5">
                Dynamic revenue curve with 7-day telemetry tracking
              </p>
            </div>
            <span className="telemetry-tag text-emerald-400 border-emerald-500/40">
              PEAK: ৳{maxSale.toLocaleString()}
            </span>
          </div>

          {/* SVG Area Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="nitroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC837" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFC837" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 60, 120, 180].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={y}
                  x2="680"
                  y2={y}
                  stroke="#242836"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Area & Polyline */}
              {stats?.salesTrend && (
                <>
                  <polygon
                    points={`40,200 ${stats.salesTrend
                      .map((p, i) => `${40 + i * 105},${200 - (p.sales / maxSale) * 160}`)
                      .join(' ')} ${40 + (stats.salesTrend.length - 1) * 105},200`}
                    fill="url(#nitroGradient)"
                  />
                  <polyline
                    fill="none"
                    stroke="#FFC837"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={stats.salesTrend
                      .map((p, i) => `${40 + i * 105},${200 - (p.sales / maxSale) * 160}`)
                      .join(' ')}
                  />

                  {/* Data Points */}
                  {stats.salesTrend.map((p, i) => {
                    const cx = 40 + i * 105;
                    const cy = 200 - (p.sales / maxSale) * 160;
                    const isHovered = hoveredPoint === i;

                    return (
                      <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 6 : 4}
                          fill="#0E0F14"
                          stroke={isHovered ? '#ED6A00' : '#FFC837'}
                          strokeWidth="2.5"
                          className="transition-all"
                        />
                        <text
                          x={cx}
                          y="225"
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontSize="11"
                          fontFamily="monospace"
                        >
                          {p.day}
                        </text>

                        {isHovered && (
                          <g>
                            <rect
                              x={cx - 50}
                              y={cy - 45}
                              width="100"
                              height="35"
                              rx="4"
                              fill="#14161F"
                              stroke="#FFC837"
                              strokeWidth="1"
                            />
                            <text
                              x={cx}
                              y={cy - 28}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="11"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              ৳{p.sales.toLocaleString()}
                            </text>
                            <text
                              x={cx}
                              y={cy - 14}
                              textAnchor="middle"
                              fill="#FFC837"
                              fontSize="9"
                              fontFamily="monospace"
                            >
                              {p.orders} Orders
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Inventory Stock Health Meter */}
        <div className="chassis-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider">
                Inventory Health
              </h3>
            </div>
            <p className="text-xs text-machined-dim font-mono mb-6">
              Safety stock allocation & stockout risk
            </p>

            <div className="space-y-4">
              {stats?.stockDistribution.map((item) => {
                const total = stats.totalProducts || 1;
                const percentage = Math.round((item.count / total) * 100);

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-machined-silver">{item.name}</span>
                      <span className="font-bold" style={{ color: item.color }}>
                        {item.count} SKUs ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-carbon-slate h-2.5 rounded-full overflow-hidden border border-fastener-border">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-carbon-slate rounded border border-fastener-border mt-6 text-xs text-machined-muted font-mono flex items-center justify-between">
            <span>Critical Reorder Alert:</span>
            <span className="text-nitro-amber font-bold">
              {stats?.lowStockCount ? `${stats.lowStockCount} items need restock` : 'Stock Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visualizations Row 2: Courier Pipeline & Taxonomy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Fulfillment Pipeline */}
        <div className="chassis-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-nitro-amber" />
              Courier Fulfillment Status
            </h3>
            <span className="telemetry-tag border-fastener-border">PIPELINE</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-carbon-slate border border-fastener-border">
              <span className="text-[10px] font-mono text-machined-dim uppercase block">Pending Review</span>
              <span className="font-orbitron font-bold text-lg text-nitro-amber">
                {stats?.statusDistribution?.PENDING || 0}
              </span>
            </div>
            <div className="p-3 rounded bg-carbon-slate border border-fastener-border">
              <span className="text-[10px] font-mono text-machined-dim uppercase block">Confirmed & Packed</span>
              <span className="font-orbitron font-bold text-lg text-cyan-400">
                {(stats?.statusDistribution?.CONFIRMED || 0) + (stats?.statusDistribution?.PACKED || 0)}
              </span>
            </div>
            <div className="p-3 rounded bg-carbon-slate border border-fastener-border">
              <span className="text-[10px] font-mono text-machined-dim uppercase block">In Courier Transit</span>
              <span className="font-orbitron font-bold text-lg text-purple-400">
                {stats?.statusDistribution?.SHIPPED || 0}
              </span>
            </div>
            <div className="p-3 rounded bg-carbon-slate border border-fastener-border">
              <span className="text-[10px] font-mono text-machined-dim uppercase block">Delivered & Closed</span>
              <span className="font-orbitron font-bold text-lg text-emerald-400">
                {stats?.statusDistribution?.DELIVERED || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Category Allocation */}
        <div className="chassis-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-nitro-amber" />
              Taxonomy Stocking
            </h3>
            <span className="telemetry-tag border-fastener-border">CATEGORIES</span>
          </div>

          <div className="space-y-3">
            {stats?.categories.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-machined-silver truncate">{c.name}</span>
                  <span className="text-nitro-amber font-bold">{c.count} items</span>
                </div>
                <div className="w-full bg-carbon-slate h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-nitro-amber rounded-full"
                    style={{ width: `${Math.min(100, (c.count / (stats.totalProducts || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Security & Telemetry Audit */}
        <div className="chassis-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-orbitron font-bold text-sm text-machined-titanium uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-nitro-amber" />
              Live Security Telemetry
            </h3>
            <span className="telemetry-tag border-emerald-500/40 text-emerald-400">AUDIT</span>
          </div>

          <div className="space-y-2.5">
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.slice(0, 4).map((log, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-carbon-slate/80 border border-fastener-border/80 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-nitro-amber font-bold block">{log.action}</span>
                    <span className="text-[10px] text-machined-dim">
                      {log.user?.email || 'System Gate'} • {log.ipAddress || '127.0.0.1'}
                    </span>
                  </div>
                  <span className="text-[10px] text-machined-dim">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-machined-dim font-mono">No telemetry events logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
