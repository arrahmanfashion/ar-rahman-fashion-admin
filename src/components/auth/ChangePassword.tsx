'use client';

import { useState } from 'react';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Password changed successfully!');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Network error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={(e) => setForm({...form, currentPassword: e.target.value})}
          required
          minLength={6}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="New Password"
          value={form.newPassword}
          onChange={(e) => setForm({...form, newPassword: e.target.value})}
          required
          minLength={6}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
          required
          minLength={6}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
}