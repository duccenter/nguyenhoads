import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { fetchData } from '../api';
import { formatMoney } from '../utils';
import { format } from 'date-fns';

export default function DebtNotification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check once per session/reload to avoid spamming the API
    const checkDebts = async () => {
      try {
        const res = await fetchData('congno');
        if (res.phaithu && Array.isArray(res.phaithu)) {
          const limit = new Date();
          limit.setDate(limit.getDate() + 3);

          const dueDebts = res.phaithu.filter((row: any) => {
            if (row.debt > 0 && row.dueDate) {
              const d = new Date(row.dueDate);
              return d.getTime() <= limit.getTime();
            }
            return false;
          });

          if (dueDebts.length > 0) {
            setNotifications(dueDebts);
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra công nợ:", err);
      }
    };

    checkDebts();
  }, []);

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 shadow-2xl max-w-sm w-full no-print">
      <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-red-50 flex items-start justify-between">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle size={20} />
            Cảnh báo Công nợ
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-3">
            Có <strong>{notifications.length}</strong> khoản nợ sắp hoặc đã đến hạn:
          </p>
          <div className="space-y-3">
            {notifications.map((n, idx) => {
              const isOverdue = new Date(n.dueDate).getTime() < new Date().setHours(0,0,0,0);
              return (
                <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="font-semibold text-slate-800">{n.name}</div>
                  <div className="text-sm text-slate-600">SĐT: {n.phone}</div>
                  <div className="text-sm text-red-600 font-bold">Nợ: {formatMoney(n.debt)} đ</div>
                  <div className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                    Hạn: {format(new Date(n.dueDate), 'dd/MM/yyyy')} {isOverdue ? '(Quá hạn)' : '(Sắp đến hạn)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
