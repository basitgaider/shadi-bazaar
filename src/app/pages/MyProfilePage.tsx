import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Lock, Mail, MapPin, MessageCircle, Phone, Save, ShieldCheck, Star, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredToken } from '@/core/api/client';
import { ROUTES } from '@/core/constants';
import { changePassword, getProfile, updateProfile } from '@/core/api/services/auth';
import { getCities } from '@/core/api/services/meta';
import { Skeleton } from '../components/ui/skeleton';
import { normalizePhoneInput, resolveApiAssetUrl } from '../utils/marketplace';

type ProfileTab = 'account' | 'password';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  cityId: string;
  rating: number;
  image: string;
  imageFile: File | null;
  countryCode: string;
  showPhone: boolean;
  allowSMS: boolean;
  allowWhatsApp: boolean;
}

interface PasswordFormState {
  old_password: string;
  password: string;
  password_confirmation: string;
}

const initialProfile: ProfileFormState = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  cityId: '',
  rating: 5,
  image: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=200',
  imageFile: null,
  countryCode: '92',
  showPhone: true,
  allowSMS: true,
  allowWhatsApp: true,
};

const initialPasswordForm: PasswordFormState = {
  old_password: '',
  password: '',
  password_confirmation: '',
};

function ProfileHeroSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-px w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

function asBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return fallback;
}

export function MyProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [profile, setProfile] = useState<ProfileFormState>(initialProfile);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(initialPasswordForm);
  const [cities, setCities] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const [profileRes, cityRecords] = await Promise.all([getProfile(), getCities()]);
        const user = profileRes.data?.records;
        if (!active || !user) return;

        const normalizedPhone = normalizePhoneInput(user.phone ? `+${user.country_code ?? '92'}${user.phone}` : '');

        setCities(cityRecords.map((city) => ({ id: city.id, title: city.title })));
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: normalizedPhone.display,
          whatsapp: user.whatsapp_number || normalizedPhone.display,
          address: user.address || '',
          cityId: user.city_id ? String(user.city_id) : '',
          rating: 5,
          image: resolveApiAssetUrl(user.image),
          imageFile: null,
          countryCode: user.country_code || normalizedPhone.countryCode,
          showPhone: asBoolean(user.show_my_phone_number_in_ads, true),
          allowSMS: asBoolean(user.send_me_sms_in_ads, true),
          allowWhatsApp: asBoolean(user.send_me_whatsapp_in_ads, true),
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load profile.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfile((current) => ({
      ...current,
      image: URL.createObjectURL(file),
      imageFile: file,
    }));
  }

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();

    const phone = normalizePhoneInput(profile.phone);
    const whatsapp = normalizePhoneInput(profile.whatsapp);
    const formData = new FormData();
    formData.set('name', profile.name.trim());
    formData.set('email', profile.email.trim());
    formData.set('country_code', phone.countryCode || profile.countryCode);
    formData.set('phone', phone.phone);
    formData.set('whatsapp_number', whatsapp.display);
    formData.set('address', profile.address.trim());
    if (profile.cityId) formData.set('city_id', profile.cityId);
    formData.set('show_my_phone_number_in_ads', profile.showPhone ? '1' : '0');
    formData.set('send_me_sms_in_ads', profile.allowSMS ? '1' : '0');
    formData.set('send_me_whatsapp_in_ads', profile.allowWhatsApp ? '1' : '0');
    if (profile.imageFile) formData.set('image', profile.imageFile);

    setSavingProfile(true);

    try {
      const res = await updateProfile(formData);
      if (res.status !== 1) throw new Error(res.message || 'Failed to update profile.');

      setProfile((current) => ({
        ...current,
        phone: phone.display,
        whatsapp: whatsapp.display,
        countryCode: phone.countryCode,
        imageFile: null,
      }));
      toast.success('Profile updated successfully.');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(event: React.FormEvent) {
    event.preventDefault();

    if (!passwordForm.old_password || !passwordForm.password || !passwordForm.password_confirmation) {
      toast.error('Fill in all password fields.');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await changePassword(passwordForm);
      if (res.status !== 1) throw new Error(res.message || 'Failed to update password.');
      setPasswordForm(initialPasswordForm);
      toast.success('Password changed successfully.');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information, privacy settings, and password.</p>
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div> : null}

          {loading ? (
            <>
              <ProfileHeroSkeleton />
              <ProfileFormSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 overflow-hidden rounded-full bg-gradient-to-br from-pink-100 to-rose-100">
                      <img src={profile.image} alt="Profile" className="h-full w-full object-cover" />
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg transition-colors hover:bg-pink-700"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">{profile.name || 'Your profile'}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= profile.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-600">{profile.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-3 shadow-lg">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'account' ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                    Account Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'password' ? 'bg-pink-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Password Change
                  </button>
                </div>
              </div>

              {activeTab === 'account' ? (
                <form onSubmit={handleProfileSave} className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                  <div className="space-y-6">
                    <h3 className="border-b pb-2 text-xl font-bold text-gray-900">Account Information</h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          id="profile-name"
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="profile-email" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        <input
                          id="profile-email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile((current) => ({ ...current, email: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="profile-phone" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="h-4 w-4" />
                          Mobile Number
                        </label>
                        <input
                          id="profile-phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile((current) => ({ ...current, phone: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="profile-whatsapp" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp Number
                        </label>
                        <input
                          id="profile-whatsapp"
                          type="tel"
                          value={profile.whatsapp}
                          onChange={(e) => setProfile((current) => ({ ...current, whatsapp: e.target.value }))}
                          className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="profile-address" className="mb-2 block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        id="profile-address"
                        rows={3}
                        value={profile.address}
                        onChange={(e) => setProfile((current) => ({ ...current, address: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-city" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4" />
                        Select City
                      </label>
                      <select
                        id="profile-city"
                        value={profile.cityId}
                        onChange={(e) => setProfile((current) => ({ ...current, cityId: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Select City</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="border-b pb-2 text-xl font-bold text-gray-900">Privacy Settings</h3>

                    <label className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                      <span className="font-medium text-gray-700">Show phone number in ads</span>
                      <input
                        type="checkbox"
                        checked={profile.showPhone}
                        onChange={(e) => setProfile((current) => ({ ...current, showPhone: e.target.checked }))}
                        className="h-5 w-5 rounded text-pink-600"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                      <span className="font-medium text-gray-700">Allow SMS notifications</span>
                      <input
                        type="checkbox"
                        checked={profile.allowSMS}
                        onChange={(e) => setProfile((current) => ({ ...current, allowSMS: e.target.checked }))}
                        className="h-5 w-5 rounded text-pink-600"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                      <span className="font-medium text-gray-700">Allow WhatsApp messages</span>
                      <input
                        type="checkbox"
                        checked={profile.allowWhatsApp}
                        onChange={(e) => setProfile((current) => ({ ...current, allowWhatsApp: e.target.checked }))}
                        className="h-5 w-5 rounded text-pink-600"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-4 font-semibold text-white transition-shadow hover:shadow-lg disabled:opacity-60"
                  >
                    <Save className="h-5 w-5" />
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSave} className="space-y-8 rounded-2xl bg-white p-8 shadow-lg">
                  <div className="space-y-3">
                    <h3 className="border-b pb-2 text-xl font-bold text-gray-900">Password Change</h3>
                    <p className="text-sm text-gray-600">
                      Use your current password to set a new one for your website account.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="current-password" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Lock className="h-4 w-4" />
                        Current Password
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm((current) => ({ ...current, old_password: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm((current) => ({ ...current, password: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.password_confirmation}
                        onChange={(e) =>
                          setPasswordForm((current) => ({ ...current, password_confirmation: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-4 font-semibold text-white transition-shadow hover:shadow-lg disabled:opacity-60"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    {savingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
