// frontend/src/pages/Notifications.jsx
import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Mail, FileText, Briefcase } from 'lucide-react';
import { notificationsAPI } from '../api/notifications';
import { useNavigate } from 'react-router-dom';
import { messagesAPI } from '../api/messages';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.list();
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setItems(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

    const markReadAndGo = async (notif) => {
    try {
        if (!notif.is_read) {
        await notificationsAPI.markRead(notif.id);
        setItems((prev) =>
            prev.map((n) =>
            n.id === notif.id ? { ...n, is_read: true } : n
            )
        );
        }
    } catch (err) {
        console.error('Failed to mark notification read:', err);
    }

    const meta = notif.metadata || {};

        if (notif.type === 'message') {
        // if backend sends a thread id, jump straight there
        if (meta.thread_id) {
            navigate(`/messages/${meta.thread_id}`);
            setNotificationsOpen(false);
            return;
        }
        // else create/open a DM with the sender/partner
        if (meta.conversation_user_id) {
            try {
            const res = await messagesAPI.getOrCreateThreadWith(meta.conversation_user_id);
            const threadId = res.data?.id || res.data?.thread?.id;
            if (threadId) {
                navigate(`/messages/${threadId}`);
            } else {
                navigate('/messages');
            }
            } catch {
            navigate('/messages');
            }
        } else {
            navigate('/messages');
        }
        setNotificationsOpen(false);
        return;
        

    } else if (notif.type === 'proposal') {
        if (meta.proposal_id) {
        navigate(`/proposals/${meta.proposal_id}`);
        } else if (meta.project_id) {
        navigate(`/projects/${meta.project_id}`);
        } else {
        navigate('/proposals');
        }
    } else if (notif.type === 'contract') {
        if (meta.contract_id) {
        navigate(`/contracts/${meta.contract_id}`);
        // or `/contracts?contract=${meta.contract_id}` depending on how you render
        } else {
        navigate('/contracts');
        }
    } else {
        navigate('/notifications');
    }
    };

  const iconFor = (type) => {
    if (type === 'message') return <Mail size={18} className="text-purple-600" />;
    if (type === 'proposal') return <FileText size={18} className="text-blue-600" />;
    if (type === 'contract') return <Briefcase size={18} className="text-green-600" />;
    return <Bell size={18} className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-purple-600" />
            Notifications
          </h1>
          {items.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <CheckCircle size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
            {items.map((n) => (
              <div
                key={n.id}
                onClick={() => markReadAndGo(n)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 ${
                  !n.is_read ? 'bg-purple-50/50' : ''
                }`}
              >
                <div className="mt-1">{iconFor(n.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {n.title || 'Notification'}
                    </p>
                    <span className="text-[10px] text-gray-500">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  {n.message && (
                    <p className="text-xs text-gray-700 mt-1">
                      {n.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
