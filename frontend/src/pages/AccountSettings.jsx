// frontend/src/pages/AccountSettings.jsx
import { useState } from 'react';
import { authAPI } from '../api/auth';

export default function AccountSettings({ user, setUser }) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [msgNotif, setMsgNotif] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    try {
   
      const res = await authAPI.updateUser({
        notifications_enabled: emailNotif,
        message_notifications_enabled: msgNotif,
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setStatus('Settings updated.');
    } catch (err) {
      console.error(err);
      setStatus('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Account Settings</h1>
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl shadow p-6 space-y-6"
        >
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Notification Preferences</h2>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => setEmailNotif(e.target.checked)}
                className="rounded border-gray-300"
              />
              Email / in-app alerts for important updates
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={msgNotif}
                onChange={(e) => setMsgNotif(e.target.checked)}
                className="rounded border-gray-300"
              />
              Notify me when I receive messages or contract updates
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {status && (
              <span className="ml-3 text-xs text-gray-600">{status}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
