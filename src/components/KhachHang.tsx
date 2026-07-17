import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { formatMoney } from '../utils';
import { fetchData, postData } from '../api';

export default function KhachHang() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerForm, setCustomerForm] = useState({ id: '', name: '', phone: '', note: '', orders: '', paid: '', debt: '', acceptanceDate: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchData('khachhang').then(res => {
      if (res.data) setCustomers(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return !!(c.name?.toLowerCase().includes(lowerSearch) || c.phone?.includes(searchTerm));
  });

  const getCustomerBadge = (spent: number) => {
    if (spent >= 20000000) return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">VIP</span>;
    if (spent >= 5000000) return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Thân thiết</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">Mới</span>;
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCustomerForm({ id: '', name: '', phone: '', note: '', orders: '', paid: '', debt: '', acceptanceDate: '' });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (c: any) => {
    setIsEditMode(true);
    setCustomerForm({ 
      id: c.id, 
      name: c.name, 
      phone: c.phone, 
      note: c.note || '',
      orders: c.orders || '',
      paid: c.paid || '',
      debt: c.debt || '',
      acceptanceDate: c.acceptanceDate ? c.acceptanceDate.split('T')[0] : ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) {
      setErrorMsg('Vui lòng nhập tên và số điện thoại!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const action = isEditMode ? 'edit' : 'add';
      const res = await postData('khachhang', action, customerForm);
      if (res.success) {
        setShowModal(false);
        loadData(); // Tải lại danh sách
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra khi lưu khách hàng.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      setLoading(true);
      try {
        const res = await postData('khachhang', 'delete', { id });
        if (res.success) {
          loadData();
        } else {
          alert(res.error || 'Có lỗi xảy ra khi xóa.');
          setLoading(false);
        }
      } catch (err) {
        alert('Lỗi kết nối!');
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản Lý Khách Hàng (CRM)</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Danh sách Khách Hàng</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-sm"
                placeholder="Tìm theo tên hoặc SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
            >
              <UserPlus size={18} /> Thêm khách hàng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Đơn đặt hàng</th>
                <th className="px-6 py-4 text-right">Thanh toán</th>
                <th className="px-6 py-4 text-right">Còn nợ</th>
                <th className="px-6 py-4">Ngày nghiệm thu</th>
                <th className="px-6 py-4 text-center">Số lần mua</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && customers.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">Không tìm thấy khách hàng nào.</td></tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4">{c.phone}</td>
                    <td className="px-6 py-4 whitespace-normal">{c.orders || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">{formatMoney(c.paid || 0)}</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">{formatMoney(c.debt || 0)}</td>
                    <td className="px-6 py-4">{c.acceptanceDate ? new Date(c.acceptanceDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 w-8 h-8 rounded-full font-medium">
                        {c.purchaseCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-slate-500 max-w-[200px] truncate">{c.note || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(c)}
                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors inline-flex"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Xóa khách hàng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa Khách Hàng */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {isEditMode ? (
                  <><Edit2 size={20} className="text-sky-500" /> Sửa Khách Hàng</>
                ) : (
                  <><UserPlus size={20} className="text-sky-500" /> Tạo Khách Hàng Mới</>
                )}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitCustomer} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên khách hàng <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  placeholder="Nhập tên khách hàng..."
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  placeholder="Nhập số điện thoại..."
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Đơn đặt hàng</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  placeholder="Nhập thông tin đơn đặt hàng..."
                  value={customerForm.orders}
                  onChange={(e) => setCustomerForm({...customerForm, orders: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thanh toán</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    placeholder="0"
                    value={customerForm.paid}
                    onChange={(e) => setCustomerForm({...customerForm, paid: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Còn nợ</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    placeholder="0"
                    value={customerForm.debt}
                    onChange={(e) => setCustomerForm({...customerForm, debt: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày nghiệm thu</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  value={customerForm.acceptanceDate}
                  onChange={(e) => setCustomerForm({...customerForm, acceptanceDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ghi chú (Tùy chọn)</label>
                <textarea 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
                  placeholder="Thông tin thêm về khách hàng..."
                  rows={3}
                  value={customerForm.note}
                  onChange={(e) => setCustomerForm({...customerForm, note: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-sky-500/20"
                >
                  {isSubmitting ? 'Đang lưu...' : <><Save size={18} /> {isEditMode ? 'Cập Nhật' : 'Lưu Khách Hàng'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
