import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react';
import { fetchData, postData } from '../api';

interface Account {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
}

const PERMISSIONS = [
  { id: 'thuchi', label: 'Sổ Thu Chi' },
  { id: 'banhang', label: 'Bán Hàng' },
  { id: 'nhapkho', label: 'Kho' },
  { id: 'congno', label: 'Công Nợ' },
  { id: 'khachhang', label: 'Khách Hàng' }
];

export default function QuanLyTaiKhoan() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchData('users');
      setAccounts(res.data || []);
    } catch (err) {
      alert('Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ username: '', password: '', fullName: '', permissions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingId(acc.id);
    setForm({
      username: acc.username,
      password: '', // do not show password
      fullName: acc.fullName,
      permissions: acc.permissions || []
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!form.username || !form.fullName) {
      alert('Vui lòng điền đủ tên và tài khoản');
      return;
    }
    if (!editingId && !form.password) {
      alert('Vui lòng nhập mật khẩu cho tài khoản mới');
      return;
    }

    setIsSubmitting(true);
    try {
      const action = editingId ? 'update' : 'add';
      const payload = { data: { ...form, id: editingId }, id: editingId };
      const res = await postData('users', action, payload);
      
      if (res.success) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm tài khoản thành công!');
        setIsModalOpen(false);
        loadData();
      } else {
        alert(res.error || 'Lỗi lưu tài khoản');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn khóa/xóa tài khoản này không?')) return;
    try {
      const res = await postData('users', 'delete', { id });
      if (res.success) {
        alert('Đã xóa tài khoản');
        loadData();
      } else {
        alert('Xóa thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-sky-500" size={32} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Quản Lý Tài Khoản</h2>
            <p className="text-sm text-slate-500">Phân quyền và quản lý nhân viên</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Thêm Tài Khoản Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.filter(a => a.role !== 'admin').map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg">
                  {acc.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{acc.fullName}</h3>
                  <div className="text-sm text-slate-500 font-medium">@{acc.username}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(acc)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(acc.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase">Quyền truy cập:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(!acc.permissions || acc.permissions.length === 0) ? (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">Chưa có quyền</span>
                ) : (
                  acc.permissions.map(p => {
                    const perm = PERMISSIONS.find(x => x.id === p);
                    return perm ? (
                      <span key={p} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">
                        {perm.label}
                      </span>
                    ) : null;
                  })
                )}
              </div>
            </div>
          </div>
        ))}
        {accounts.filter(a => a.role !== 'admin').length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            Chưa có tài khoản nhân viên nào
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Họ và tên nhân viên</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  placeholder="VD: nva"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mật khẩu {editingId && <span className="text-slate-400 font-normal">(Bỏ trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  disabled={isSubmitting}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phân quyền chức năng</label>
                <div className="grid grid-cols-2 gap-3">
                  {PERMISSIONS.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        disabled={isSubmitting}
                        checked={form.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-indigo-400 transition-colors"
                >
                  {isSubmitting ? (
                    <><RefreshCw className="animate-spin" size={20} /> Đang lưu...</>
                  ) : (
                    <><Save size={20} /> {editingId ? 'Cập Nhật' : 'Tạo Tài Khoản'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
