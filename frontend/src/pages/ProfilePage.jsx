// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { updateProfile } from '../store/slices/authSlice';
import { PageHeader, Card, Button, Input, Select, Badge } from '../components/common';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await dispatch(updateProfile(form));
    setSaving(false);
    if (res.payload?.user) toast.success('Profile updated!');
    else toast.error('Update failed');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div>
      <PageHeader title="Profile & Settings" actions={<Button variant="primary" onClick={handleSave} loading={saving}>💾 Save Changes</Button>} />
      <div className="p-7">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <h2 className="font-bold text-sm mb-4">Personal Information</h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xl font-bold">
                  {initials}
                </div>
                <div>
                  <Button size="sm" variant="secondary" onClick={() => toast.success('Upload via Cloudinary – coming soon!')}>📷 Upload Photo</Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Email" value={user?.email || ''} disabled className="opacity-60 cursor-not-allowed" />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555-0100" />
                <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                <Input label="LinkedIn URL" value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} placeholder="linkedin.com/in/..." />
                <Input label="GitHub / Portfolio" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="github.com/username" />
              </div>
            </Card>
            <Card>
              <h2 className="font-bold text-sm mb-4">Security</h2>
              <div className="space-y-3">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                <Button variant="secondary" onClick={() => toast.success('Password updated!')}>Update Password</Button>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <h2 className="font-bold text-sm mb-4">Subscription</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-dark-400 rounded-lg">
                  <div>
                    <div className="text-sm font-semibold capitalize">{user?.plan || 'Free'} Plan</div>
                    <div className="text-xs text-gray-500">
                      {user?.plan === 'free' ? '3 resumes · Basic templates · 10 AI/mo' :
                       user?.plan === 'pro' ? 'Unlimited resumes · All features · 100 AI/mo' :
                       'Everything in Pro · Priority support · API access'}
                    </div>
                  </div>
                  <Badge variant={user?.plan === 'pro' ? 'purple' : user?.plan === 'enterprise' ? 'cyan' : 'amber'}>Current</Badge>
                </div>
                {user?.plan === 'free' && (
                  <div className="border border-brand-500/30 bg-brand-500/5 p-3 rounded-lg">
                    <div className="text-sm font-semibold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Pro Plan — $12/month</div>
                    <div className="text-xs text-gray-400 mt-1 mb-3">Unlimited resumes · All AI features · All templates</div>
                    <Button variant="primary" size="sm" onClick={() => toast.success('Stripe integration – coming soon!')}>Upgrade to Pro</Button>
                  </div>
                )}
              </div>
            </Card>
            <Card>
              <h2 className="font-bold text-sm mb-4">Account Statistics</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Resumes Created', user?.stats?.resumesCreated || 0],
                  ['AI Generations', user?.stats?.aiGenerations || 0],
                  ['PDF Downloads', user?.stats?.downloads || 0],
                  ['Account Since', new Date(user?.createdAt || Date.now()).getFullYear()],
                ].map(([label, value]) => (
                  <div key={label} className="bg-dark-400 rounded-lg p-3">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-lg font-bold text-brand-400 mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="font-bold text-sm mb-4 text-red-400">Danger Zone</h2>
              <div className="space-y-2">
                <Button variant="danger" onClick={() => toast.error('Deletion requires email confirmation')}>🗑 Delete Account</Button>
                <p className="text-xs text-gray-600">This will permanently delete your account and all resumes.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
