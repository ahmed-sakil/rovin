import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
  Ban,
  RotateCcw,
  Clock,
  Activity,
  UserX,
  Gavel,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  profileImageUrl?: string;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: string;
  strikeCount: number;
  orderCount: number;
  lifetimeSpent: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    isBanned: boolean;
  };
}

export const AdminUsers: React.FC = () => {
  usePageTitle('Security Audit & Pilot Roster', 'Admin Command Center');

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, striked: 0, banned: 0 });
  const [loading, setLoading] = useState(true);

  // User filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logAction, setLogAction] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Ban Modal
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('Repeated Fake COD Orders');
  const [banDuration, setBanDuration] = useState('168'); // 7 days in hours

  // Strike Modal
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [strikeReason, setStrikeReason] = useState('Failed COD delivery / Unreachable phone');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      toast.error('Failed to load user roster');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const params = new URLSearchParams();
      if (logAction !== 'ALL') params.append('action', logAction);
      if (logSearch) params.append('search', logSearch);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch {
      toast.error('Failed to retrieve audit feed');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (activeTab === 'audit') fetchLogs();
  }, [activeTab, logAction, logSearch]);

  // Execute Ban
  const handleExecuteBan = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: banReason,
          durationHours: banDuration === '0' ? undefined : Number(banDuration),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Suspension Imposed', { description: data.message });
      setShowBanModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Suspension Failed', { description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Unban
  const handleExecuteUnban = async (user: UserRecord) => {
    setActionLoading(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/admin/users/${user.id}/unban`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Clearance Restored', { description: data.message });
      fetchUsers();
    } catch (err: any) {
      toast.error('Action Failed', { description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Strike (Punish)
  const handleExecuteStrike = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem('rovin_token');
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/punish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ strikeReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.autoBanned) {
        toast.error('Auto-Suspension Enforced', { description: data.message });
      } else {
        toast.warning('Disciplinary Strike Imposed', { description: data.message });
      }
      setShowStrikeModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Strike Protocol Failed', { description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Security & Pilots"
      comment="Audit security access, enforce anti-abuse suspensions, and issue disciplinary strikes."
    >
      <div className="space-y-6">
        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-machined-dim uppercase tracking-wider">Total Registered Pilots</span>
              <UserCheck className="w-5 h-5 text-nitro-amber" />
            </div>
            <div className="font-orbitron font-black text-2xl text-machined-titanium">
              {stats.total}
            </div>
          </div>

          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-machined-dim uppercase tracking-wider">Active Flight Clearance</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="font-orbitron font-black text-2xl text-emerald-400">
              {stats.active}
            </div>
          </div>

          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-machined-dim uppercase tracking-wider">Disciplinary Strikes</span>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="font-orbitron font-black text-2xl text-yellow-400">
              {stats.striked}
            </div>
            <span className="text-[10px] font-mono text-machined-dim">3 strikes = auto-suspend</span>
          </div>

          <div className="chassis-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-machined-dim uppercase tracking-wider">Suspended / Banned</span>
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div className="font-orbitron font-black text-2xl text-red-400">
              {stats.banned}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-fastener-border">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-3 px-6 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-nitro-amber text-nitro-amber bg-nitro-amber/5'
                : 'border-transparent text-machined-dim hover:text-machined-titanium'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Pilot Roster & Moderation
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-3 px-6 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'audit'
                ? 'border-nitro-amber text-nitro-amber bg-nitro-amber/5'
                : 'border-transparent text-machined-dim hover:text-machined-titanium'
            }`}
          >
            <Activity className="w-4 h-4" /> Security Audit Event Feed
          </button>
        </div>

        {/* TAB 1: PILOT ROSTER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-carbon-card p-4 rounded-lg border border-fastener-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search pilot by callsign, email, phone..."
                  className="w-full bg-carbon-elevated border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-carbon-elevated border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-silver outline-none focus:border-nitro-amber"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-carbon-elevated border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-silver outline-none focus:border-nitro-amber"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="STRIKED">Striked Warnings</option>
                  <option value="BANNED">Suspended / Banned</option>
                </select>
              </div>
            </div>

            {/* User Roster Table */}
            <div className="chassis-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-carbon-slate border-b border-fastener-border text-machined-dim uppercase">
                    <tr>
                      <th className="py-3 px-4">Pilot Callsign</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Clearance Status</th>
                      <th className="py-3 px-4">Strikes</th>
                      <th className="py-3 px-4">Orders & Lifetime</th>
                      <th className="py-3 px-4">Joined</th>
                      <th className="py-3 px-4 text-right">Disciplinary Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fastener-border">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-machined-dim">
                          Ingesting pilot telemetry...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-machined-dim">
                          No pilots matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-carbon-elevated/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                                alt={u.name}
                                className="w-8 h-8 rounded-full border border-fastener-border object-cover"
                              />
                              <div>
                                <span className="font-bold text-machined-titanium block leading-tight">
                                  {u.name}
                                </span>
                                <span className="text-[11px] text-machined-dim">
                                  {u.email} &bull; {u.phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="telemetry-tag text-[10px]">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.isBanned ? (
                              <div>
                                <span className="telemetry-tag border-red-500/50 text-red-400 font-bold block mb-1">
                                  SUSPENDED
                                </span>
                                <span className="text-[10px] text-machined-dim block line-clamp-1">
                                  {u.banReason || 'Policy violation'}
                                </span>
                              </div>
                            ) : (
                              <span className="telemetry-tag border-emerald-500/40 text-emerald-400">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-orbitron font-bold ${
                                u.strikeCount >= 3
                                  ? 'text-red-400'
                                  : u.strikeCount > 0
                                  ? 'text-yellow-400'
                                  : 'text-machined-dim'
                              }`}
                            >
                              {u.strikeCount} / 3
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-bold text-machined-titanium block">
                                ৳{u.lifetimeSpent.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-machined-dim">
                                {u.orderCount} missions confirmed
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-machined-dim text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Strike Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowStrikeModal(true);
                                }}
                                disabled={u.role === 'ADMIN'}
                                className="p-1.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-30"
                                title="Issue Disciplinary Strike"
                              >
                                <Gavel className="w-3.5 h-3.5" />
                              </button>

                              {/* Ban / Unban Button */}
                              {u.isBanned ? (
                                <button
                                  onClick={() => handleExecuteUnban(u)}
                                  className="outline-btn text-[10px] py-1 px-2.5 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                                >
                                  Pardon / Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setShowBanModal(true);
                                  }}
                                  disabled={u.role === 'ADMIN'}
                                  className="outline-btn text-[10px] py-1 px-2.5 text-red-400 border-red-500/40 hover:bg-red-500/10 disabled:opacity-30"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT EVENT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-carbon-card p-4 rounded-lg border border-fastener-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-machined-dim absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs by IP, action, pilot..."
                  className="w-full bg-carbon-elevated border border-fastener-border rounded pl-9 pr-3 py-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                />
              </div>

              <select
                value={logAction}
                onChange={(e) => setLogAction(e.target.value)}
                className="bg-carbon-elevated border border-fastener-border rounded px-3 py-2 text-xs font-mono text-machined-silver outline-none focus:border-nitro-amber"
              >
                <option value="ALL">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="FAILED_LOGIN">FAILED_LOGIN</option>
                <option value="ORDER_CREATE">ORDER_CREATE</option>
                <option value="ADMIN_BAN_USER">ADMIN_BAN_USER</option>
                <option value="ADMIN_STRIKE_USER">ADMIN_STRIKE_USER</option>
                <option value="ADMIN_UNBAN_USER">ADMIN_UNBAN_USER</option>
              </select>
            </div>

            {/* Audit Table */}
            <div className="chassis-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-carbon-slate border-b border-fastener-border text-machined-dim uppercase">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action Protocol</th>
                      <th className="py-3 px-4">Target Pilot</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Metadata / Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-fastener-border">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-machined-dim">
                          Ingesting security telemetry stream...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-machined-dim">
                          No audit telemetry recorded for this filter.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-carbon-elevated/40 transition-colors">
                          <td className="py-3 px-4 text-machined-dim whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`telemetry-tag font-bold ${
                                log.action.includes('BAN') || log.action.includes('STRIKE')
                                  ? 'border-red-500/50 text-red-400'
                                  : log.action.includes('LOGIN')
                                  ? 'border-blue-500/50 text-blue-400'
                                  : 'border-fastener-border text-machined-silver'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {log.user ? (
                              <div>
                                <span className="font-bold text-machined-titanium block">
                                  {log.user.name}
                                </span>
                                <span className="text-[10px] text-machined-dim">
                                  {log.user.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-machined-dim">System / Guest</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-machined-silver font-mono">
                            {log.ipAddress || 'Internal Socket'}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-machined-dim max-w-xs truncate">
                            {log.metadata ? JSON.stringify(log.metadata) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAN MODAL */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-pitch-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chassis-card max-w-md w-full p-6 border-red-500/50 relative">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-fastener-border text-red-400">
              <Ban className="w-5 h-5" />
              <h3 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
                Suspend Pilot Clearance
              </h3>
            </div>

            <p className="text-xs font-mono text-machined-muted mb-4">
              Suspending pilot <strong>{selectedUser.name}</strong> ({selectedUser.phone}) will invalidate access and prevent order placements.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-machined-dim mb-1">
                  Violation Reason
                </label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-red-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-machined-dim mb-1">
                  Suspension Duration
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-red-400 outline-none"
                >
                  <option value="24">24 Hours (Temporary Cool-off)</option>
                  <option value="168">7 Days (1 Week Suspension)</option>
                  <option value="720">30 Days (1 Month Disbarment)</option>
                  <option value="0">Indefinite / Permanent Ban</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setShowBanModal(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBan}
                  disabled={actionLoading}
                  className="nitro-btn text-xs py-2 px-5 bg-red-500 hover:bg-red-600 text-white"
                >
                  {actionLoading ? 'Enforcing...' : 'Enforce Suspension'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRIKE MODAL */}
      {showStrikeModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-pitch-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chassis-card max-w-md w-full p-6 border-yellow-500/50 relative">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-fastener-border text-yellow-400">
              <Gavel className="w-5 h-5" />
              <h3 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
                Issue Disciplinary Strike
              </h3>
            </div>

            <p className="text-xs font-mono text-machined-muted mb-4">
              Current Strike Level for <strong>{selectedUser.name}</strong>: <strong>{selectedUser.strikeCount}/3</strong>.
              <br />
              <span className="text-yellow-400">
                Notice: Reaching strike #3 triggers an automated 7-day suspension.
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-machined-dim mb-1">
                  Infraction Note
                </label>
                <input
                  type="text"
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setShowStrikeModal(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteStrike}
                  disabled={actionLoading}
                  className="nitro-btn text-xs py-2 px-5 bg-yellow-500 hover:bg-yellow-600 text-pitch-obsidian font-bold"
                >
                  {actionLoading ? 'Recording...' : 'Impose Strike'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
