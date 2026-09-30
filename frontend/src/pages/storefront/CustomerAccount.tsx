import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  MapPin,
  User,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Lock,
  Edit3,
  UserCheck,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_AVATARS = [
  { id: 'm1', label: 'Recon Pilot (M)', url: '/assets/avatars/avatar-m1.svg' },
  { id: 'm2', label: 'Torque Lead (M)', url: '/assets/avatars/avatar-m2.svg' },
  { id: 'm3', label: 'Chassis Lead (M)', url: '/assets/avatars/avatar-m3.svg' },
  { id: 'f1', label: 'Avionics (F)', url: '/assets/avatars/avatar-f1.svg' },
  { id: 'f2', label: 'Suspension (F)', url: '/assets/avatars/avatar-f2.svg' },
  { id: 'f3', label: 'Commander (F)', url: '/assets/avatars/avatar-f3.svg' },
];

const BD_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chittagong', 'Cox\'s Bazar', 'Sylhet',
  'Mymensingh', 'Rajshahi', 'Bogra', 'Khulna', 'Barisal', 'Rangpur',
  'Comilla', 'Brahmanbaria', 'Noakhali', 'Feni', 'Tangail', 'Faridpur',
  'Jessore', 'Kushtia', 'Pabna', 'Dinajpur', 'Other District (All BD Covered)'
];

export const CustomerAccount: React.FC = () => {
  usePageTitle('My Account', 'Profile, Delivery Addresses & Security');
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, refreshProfile, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'>(user?.gender || 'MALE');
  const [editDob, setEditDob] = useState(user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
  const [editAvatar, setEditAvatar] = useState(user?.profileImageUrl || '/assets/avatars/avatar-m1.svg');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isProfileDirty = Boolean(
    user && (
      editName.trim() !== (user.name || '').trim() ||
      editPhone.trim() !== (user.phone || '').trim() ||
      editGender !== (user.gender || 'MALE') ||
      editDob !== (user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '') ||
      editAvatar !== (user.profileImageUrl || '/assets/avatars/avatar-m1.svg')
    )
  );

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditGender(user.gender || 'MALE');
      setEditDob(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
      setEditAvatar(user.profileImageUrl || '/assets/avatars/avatar-m1.svg');
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 2MB size limit
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      toast.error('File Exceeds 2MB Limit', {
        description: `Your image is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed avatar size is 2MB.`,
      });
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid Format', {
        description: 'Please upload an image file (PNG, JPG, WebP, etc.).',
      });
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setEditAvatar(data.url);
        toast.success('Photo Uploaded', {
          description: `Avatar photo successfully processed (${data.metadata?.sizeFormatted || '2MB max verified'}).`,
        });
      } else {
        toast.error('Upload Failed', {
          description: data.message || 'Server rejected photo upload.',
        });
      }
    } catch {
      toast.error('Network Error', {
        description: 'Failed to upload photo.',
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name Required', { description: 'Please enter your full name.' });
      return;
    }
    if (!editPhone.trim()) {
      toast.error('Mobile Required', { description: 'Please enter your 11-digit BD mobile number.' });
      return;
    }

    setSavingProfile(true);
    await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      gender: editGender,
      dateOfBirth: editDob || undefined,
      profileImageUrl: editAvatar,
    });
    setSavingProfile(false);
  };

  // Address form modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressTitle, setAddressTitle] = useState('Home');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const openAddAddressModal = () => {
    setAddressTitle('Home');
    setRecipientName(user?.name || '');
    setPhoneNumber(user?.phone || '');
    setDistrict('Dhaka');
    setThana('');
    setAddressLine('');
    setIsDefault(false);
    setShowAddressModal(true);
  };

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/account');
    }
  }, [isAuthenticated, navigate]);


    // Add Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phoneNumber.trim() || !district.trim() || !thana.trim() || !addressLine.trim()) {
      toast.error('Incomplete Address', { description: 'Please complete all required address fields.' });
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: addressTitle.trim() || 'Home',
          recipientName: recipientName.trim(),
          phoneNumber: phoneNumber.trim(),
          district: district.trim(),
          thana: thana.trim(),
          addressLine: addressLine.trim(),
          isDefault,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save address');

      toast.success('Address Saved', { description: 'New delivery address stored.' });
      setShowAddressModal(false);
      setAddressTitle('Home');
      setThana('');
      setAddressLine('');
      setIsDefault(false);
      await refreshProfile();
    } catch (err: any) {
      toast.error('Failed to Save Address', { description: err.message });
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.info('Address Erased');
        await refreshProfile();
      }
    } catch {
      toast.error('Failed to remove address');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Weak Security Key', { description: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mismatch', { description: 'New passwords do not match.' });
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');

      toast.success('Access Key Recalibrated', { description: 'Password successfully changed.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Update Failed', { description: err.message });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        {/* Customer Profile Banner (Centralized) */}
        <div className="chassis-card p-6 sm:p-8 mb-8 border-nitro-amber/30 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-nitro-amber/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="flex flex-col items-center text-center gap-4 relative z-10 max-w-xl mx-auto">
            <div className="relative">
              <img
                src={user?.profileImageUrl || '/assets/avatars/avatar-m1.svg'}
                alt={user?.name || 'Customer'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-nitro-amber object-cover shadow-nitro-sm mx-auto"
              />
              <div className="absolute -bottom-1 -right-1 bg-carbon-slate border border-nitro-amber/50 rounded-full p-1.5 text-nitro-amber" title="Verified Customer">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5">
                <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium">
                  {user?.name || 'Customer'}
                </h1>
                <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber">
                  {user?.role || 'MEMBER'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-machined-silver font-mono mt-3">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-nitro-amber" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-nitro-amber" />
                  {user?.phone}
                </span>
                {user?.gender && (
                  <span className="text-machined-dim uppercase tracking-wider">
                    GENDER: {user.gender}
                  </span>
                )}
                {user?.dateOfBirth && (
                  <span className="flex items-center gap-1.5 text-machined-silver">
                    <Calendar className="w-3.5 h-3.5 text-nitro-amber" />
                    DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`outline-btn text-xs py-2 px-5 flex items-center gap-2 transition-all ${
                  activeTab === 'profile'
                    ? 'border-nitro-amber bg-nitro-amber/15 text-nitro-amber'
                    : 'border-nitro-amber/50 text-nitro-amber hover:bg-nitro-amber/10'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                onClick={logout}
                className="outline-btn text-xs py-2 px-5 flex items-center gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Centralized 3 Options) */}
        <div className="max-w-md mx-auto grid grid-cols-3 border-b border-fastener-border mb-8 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 py-3 px-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 text-center ${
              activeTab === 'profile'
                ? 'border-nitro-amber text-nitro-amber bg-nitro-amber/5'
                : 'border-transparent text-machined-dim hover:text-machined-titanium'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center justify-center gap-2 py-3 px-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 text-center ${
              activeTab === 'addresses'
                ? 'border-nitro-amber text-nitro-amber bg-nitro-amber/5'
                : 'border-transparent text-machined-dim hover:text-machined-titanium'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center justify-center gap-2 py-3 px-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 text-center ${
              activeTab === 'security'
                ? 'border-nitro-amber text-nitro-amber bg-nitro-amber/5'
                : 'border-transparent text-machined-dim hover:text-machined-titanium'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Security</span>
          </button>
        </div>

        {/* TAB 1: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-orbitron font-bold text-base text-machined-titanium">
                  Saved Delivery Addresses
                </h3>
                <p className="text-xs text-machined-dim font-mono">
                  Manage multiple shipping addresses for fast checkout
                </p>
              </div>
              <button
                onClick={openAddAddressModal}
                className="nitro-btn text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {(!user?.addresses || user.addresses.length === 0) ? (
              <div className="chassis-card p-10 text-center">
                <MapPin className="w-10 h-10 text-machined-dim mx-auto mb-2 opacity-50" />
                <p className="text-xs text-machined-muted mb-4 font-mono">
                  No saved delivery addresses yet.
                </p>
                <button
                  onClick={openAddAddressModal}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`chassis-card p-5 relative ${
                      addr.isDefault ? 'border-nitro-amber shadow-nitro-sm' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-xs uppercase text-machined-titanium">
                          {addr.title}
                        </span>
                        {addr.isDefault && (
                          <span className="telemetry-tag border-nitro-amber text-nitro-amber text-[9px]">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-machined-dim hover:text-red-400 p-1"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-mono text-xs text-machined-silver space-y-1">
                      <p className="font-bold text-machined-titanium">{addr.recipientName}</p>
                      <p>{addr.phoneNumber}</p>
                      <p className="text-machined-dim">{addr.addressLine}</p>
                      <p className="text-nitro-amber font-semibold">{addr.thana}, {addr.district}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SECURITY & KEY */}
        {activeTab === 'security' && (
          <div className="max-w-md mx-auto">
            <div className="chassis-card p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-10 h-10 rounded-full bg-nitro-amber/10 border border-nitro-amber/30 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5 text-nitro-amber" />
                </div>
                <h3 className="font-orbitron font-bold text-base text-machined-titanium mb-1">
                  Recalibrate Security Key
                </h3>
                <p className="text-xs text-machined-dim font-mono">
                  Update the password guarding your ROVIN account.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    New Security Key (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1">
                    Confirm New Security Key
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="nitro-btn w-full text-xs py-2.5 mt-2"
                >
                  {changingPass ? 'Updating Key...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="chassis-card p-6 sm:p-8 border-nitro-amber/30">
              <div className="flex items-center justify-center gap-2 mb-6 pb-3 border-b border-fastener-border text-center">
                <UserCheck className="w-5 h-5 text-nitro-amber" />
                <h2 className="font-orbitron font-bold text-base text-machined-titanium uppercase">
                  Personal Telemetry & Profile Settings
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar Selection Grid */}
                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-2">
                    Select Tactical Avatar
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
                    {DEFAULT_AVATARS.map((av) => {
                      const isSelected = editAvatar === av.url;
                      return (
                        <div
                          key={av.id}
                          onClick={() => setEditAvatar(av.url)}
                          className={`cursor-pointer rounded-lg p-2 text-center border transition-all ${
                            isSelected
                              ? 'border-nitro-amber bg-nitro-amber/15 shadow-nitro-sm ring-1 ring-nitro-amber'
                              : 'border-fastener-border bg-carbon-elevated hover:border-machined-dim'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-12 h-12 rounded-full mx-auto mb-1.5 object-cover"
                          />
                          <p className="text-[10px] font-mono text-machined-silver truncate">
                            {av.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-fastener-border">
                    <label className="block text-xs font-mono uppercase text-machined-silver mb-2">
                      Upload Custom Photo (Max 2MB)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-lg border border-dashed border-fastener-border bg-carbon-elevated/50">
                      {/* Active Preview */}
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-nitro-amber bg-pitch-obsidian flex-shrink-0 shadow-chassis">
                        <img
                          src={editAvatar}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <label className="inline-flex items-center gap-2 cursor-pointer nitro-btn py-2 px-4 text-xs">
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Choose Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingAvatar}
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] font-mono text-machined-dim mt-1.5">
                          Supported formats: JPG, PNG, WEBP &bull; Max size: 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Sakil Ahmed"
                        className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 pl-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 pl-9 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                      Gender
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as any)}
                      className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    >
                      <option value="MALE" className="bg-carbon-card text-machined-titanium">Male</option>
                      <option value="FEMALE" className="bg-carbon-card text-machined-titanium">Female</option>
                      <option value="OTHER" className="bg-carbon-card text-machined-titanium">Other</option>
                      <option value="PREFER_NOT_TO_SAY" className="bg-carbon-card text-machined-titanium">Prefer Not To Say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full bg-carbon-elevated border border-fastener-border rounded p-2.5 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-machined-muted mb-1.5">
                    Registered Email (Fixed)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-machined-dim absolute left-3 top-3" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-carbon-slate border border-fastener-border rounded p-2.5 pl-9 text-xs text-machined-dim font-mono cursor-not-allowed opacity-80"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-machined-dim mt-1">
                    Contact mission command if you require email re-calibration.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile || !isProfileDirty}
                    className={`w-full text-xs py-3 flex items-center justify-center gap-2 font-orbitron font-bold uppercase tracking-wider rounded transition-all ${
                      isProfileDirty
                        ? 'nitro-btn cursor-pointer'
                        : 'bg-carbon-slate text-machined-dim border border-fastener-border opacity-40 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {savingProfile
                      ? 'Saving Changes...'
                      : isProfileDirty
                      ? 'Save Profile Changes'
                      : 'No Changes Detected'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Add Delivery Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-pitch-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="chassis-card max-w-md w-full p-6 border-nitro-amber/50 relative">
            <h3 className="font-orbitron font-bold text-base text-machined-titanium mb-4">
              Add Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                  Address Label (e.g. Home, Office)
                </label>
                <input
                  type="text"
                  required
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  placeholder="Home"
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                    BD Phone (01XXXXXXXXX)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d} className="bg-carbon-card text-machined-titanium">{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                    Thana / Upazila
                  </label>
                  <input
                    type="text"
                    required
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                    placeholder="e.g. Uttara / Dhanmondi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-machined-muted mb-1">
                  Full House / Road / Area Details
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-carbon-elevated border border-fastener-border rounded p-2 text-xs text-machined-titanium font-mono focus:border-nitro-amber outline-none"
                  placeholder="House 12, Road 4, Sector 7..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-fastener-border text-nitro-amber focus:ring-nitro-amber bg-carbon-elevated"
                />
                <label htmlFor="defaultAddress" className="text-xs font-mono text-machined-silver cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-fastener-border">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="outline-btn text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="nitro-btn text-xs py-2 px-5"
                >
                  {savingAddress ? 'Saving...' : 'Confirm Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <StorefrontFooter />

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
