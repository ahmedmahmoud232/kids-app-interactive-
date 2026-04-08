import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Users, Bell, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useNotifications } from './NotificationProvider';

export default function AdminNotifications() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'error'>('info');
  const [sending, setSending] = useState(false);
  const { showNotification } = useNotifications();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const usersList = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);
    try {
      const notificationData = {
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
        read: false
      };

      if (selectedUser === 'all') {
        // Send to all users
        const promises = users.map(user => 
          addDoc(collection(db, 'notifications'), { ...notificationData, userId: user.id })
        );
        await Promise.all(promises);
        showNotification('تم الإرسال', `تم إرسال التنبيه إلى ${users.length} مستخدم`, 'success');
      } else {
        // Send to specific user
        await addDoc(collection(db, 'notifications'), { ...notificationData, userId: selectedUser });
        showNotification('تم الإرسال', 'تم إرسال التنبيه بنجاح', 'success');
      }

      setTitle('');
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-brand-purple animate-spin" />
        <p className="text-xl font-bold">جاري تحميل قائمة المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">مركز التنبيهات</h1>
        <p className="text-xl font-bold text-white">أرسل تحديثات فورية لمستخدمي نبراس</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2 bento-card p-8 bg-white space-y-6">
          <div className="flex items-center gap-3 text-brand-purple">
            <Send className="w-8 h-8" />
            <h2 className="text-2xl font-black">إرسال تنبيه جديد</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-black text-lg">المستلم</label>
              <select 
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-4 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 ring-brand-purple/20"
              >
                <option value="all">جميع المستخدمين ({users.length})</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>مستخدم: {u.id.substring(0, 8)}...</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-black text-lg">عنوان التنبيه</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: تحديث جديد متاح"
                className="w-full p-4 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 ring-brand-purple/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-black text-lg">نص الرسالة</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب تفاصيل التنبيه هنا..."
                rows={4}
                className="w-full p-4 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 ring-brand-purple/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-black text-lg">نوع التنبيه</label>
              <div className="grid grid-cols-3 gap-4">
                {(['info', 'success', 'error'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "p-3 border-4 border-black font-black capitalize transition-all",
                      type === t ? "translate-x-[2px] translate-y-[2px] shadow-none" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      t === 'info' && (type === t ? "bg-brand-blue text-white" : "bg-white"),
                      t === 'success' && (type === t ? "bg-brand-green text-white" : "bg-white"),
                      t === 'error' && (type === t ? "bg-brand-red text-white" : "bg-white")
                    )}
                  >
                    {t === 'info' ? 'معلومة' : t === 'success' ? 'نجاح' : 'خطأ'}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={sending}
              className="btn-bento btn-bento-primary w-full flex items-center justify-center gap-3 text-2xl py-6"
            >
              {sending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
              إرسال التنبيه الآن
            </button>
          </form>
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          <div className="bento-card p-6 bg-brand-yellow space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7" />
              <h3 className="text-xl font-black">المستخدمين</h3>
            </div>
            <p className="text-4xl font-black">{users.length}</p>
            <p className="font-bold opacity-80">إجمالي المسجلين في المنصة</p>
          </div>

          <div className="bento-card p-6 bg-brand-blue text-white space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7" />
              <h3 className="text-xl font-black">نصيحة</h3>
            </div>
            <p className="font-bold">استخدم التنبيهات لإخبار الأطفال عن الألعاب الجديدة أو المسابقات الأسبوعية!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
