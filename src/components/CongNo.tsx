import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, Search } from 'lucide-react';
import { formatMoney } from '../utils';
import { fetchData, postData } from '../api';

export default function CongNo() {
  const [activeTab, setActiveTab] = useState<'phaithu' | 'phaitra'>('phaithu');
  const [debts, setDebts] = useState<any[]>([]);
  const [debtsTra, setDebtsTra] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [payModal, setPayModal] = useState<{isOpen: boolean, data: any, type: 'thu'|'tra'}>({ isOpen: false, data: null, type: 'thu' });
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  // Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchData('congno');
      if (res.phaithu) setDebts(res.phaithu);
      if (res.phaitra) setDebtsTra(res.phaitra);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);



  const handleOpenPayModal = (data: any, type: 'thu'|'tra') => {
    setPayModal({ isOpen: true, data, type });
    setPayAmount(data.debt.toString());
    setPayNote(type === 'thu' ? `Thu nợ khách ${data.name}` : `Trả nợ NCC ${data.name}`);
  };

  const handleSubmitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postData('congno', 'pay_debt', { 
        data: { id: payModal.data.id, amount: payAmount, type: payModal.type, note: payNote, date: new Date().toISOString() }
      });
      alert(payModal.type === 'thu' ? "Thu nợ thành công!" : "Trả nợ thành công!");
      setPayModal({ isOpen: false, data: null, type: 'thu' });
      await loadData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const rawCurrentData = activeTab === 'phaithu' ? debts : debtsTra;

  const currentData = rawCurrentData.filter(row => {
    let matchSearch = true;
    if (filterSearch) {
      const lowerSearch = filterSearch.toLowerCase();
      matchSearch = !!(row.name?.toLowerCase().includes(lowerSearch) || row.phone?.includes(filterSearch));
    }
    if (!matchSearch) return false;
    
    if (filterFromDate || filterToDate) {
      // row.date format is usually YYYY-MM-DD from backend
      const rowDate = new Date(row.date);
      rowDate.setHours(0,0,0,0);
      
      if (filterFromDate) {
        const from = new Date(filterFromDate);
        from.setHours(0,0,0,0);
        if (rowDate < from) return false;
      }
      if (filterToDate) {
        const to = new Date(filterToDate);
        to.setHours(23,59,59,999);
        if (rowDate > to) return false;
      }
    }
    return true;
  });

  const totalPhaiThu = debts.filter(row => currentData.includes(row) || activeTab === 'phaitra').reduce((sum, d) => sum + d.debt, 0);
  const totalPhaiTra = debtsTra.filter(row => currentData.includes(row) || activeTab === 'phaithu').reduce((sum, d) => sum + d.debt, 0);

  return (
    <div className="module-container">
      <div className="header">
        <h1 className="title">Quản Lý Công Nợ</h1>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="summary-card income" onClick={() => setActiveTab('phaithu')} style={{ cursor: 'pointer', border: activeTab === 'phaithu' ? '2px solid var(--income-color)' : '' }}>
          <div className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Khách Nợ (Phải Thu)
          </div>
          <div className="summary-amount income-text">{formatMoney(totalPhaiThu)} đ</div>
        </div>
        <div className="summary-card expense" onClick={() => setActiveTab('phaitra')} style={{ cursor: 'pointer', border: activeTab === 'phaitra' ? '2px solid var(--expense-color)' : '' }}>
          <div className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Nợ Nhà Cung Cấp (Phải Trả)
          </div>
          <div className="summary-amount expense-text">{formatMoney(totalPhaiTra)} đ</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            {activeTab === 'phaithu' ? 'Danh sách Khách Hàng còn nợ' : 'Danh sách Nhà Cung Cấp đang nợ'}
          </h2>
          
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tìm theo tên hoặc SĐT..." 
                style={{ paddingLeft: '35px', marginBottom: 0 }}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>Từ ngày:</span>
              <input 
                type="date" 
                className="form-control" 
                style={{ marginBottom: 0 }}
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
              />
            </div>
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', whiteSpace: 'nowrap' }}>Đến ngày:</span>
              <input 
                type="date" 
                className="form-control" 
                style={{ marginBottom: 0 }}
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Ngày lập phiếu</th>
                <th>Đối tác</th>
                <th className="text-right">Tổng Tiền Đơn</th>
                <th className="text-right">Còn Nợ</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && currentData.length === 0 ? (
                <tr><td colSpan={5} className="text-center" style={{padding: '2rem'}}>Đang tải dữ liệu...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={5} className="text-center" style={{padding: '2rem', color: 'var(--text-secondary)'}}>{rawCurrentData.length === 0 ? 'Không có công nợ nào.' : 'Không tìm thấy kết quả phù hợp.'}</td></tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{row.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{row.phone}</div>
                    </td>
                    <td className="text-right" style={{ color: 'var(--text-secondary)' }}>{formatMoney(row.total)}</td>
                    <td className="text-right" style={{ color: activeTab === 'phaithu' ? 'var(--expense-color)' : 'var(--income-color)', fontWeight: 'bold' }}>
                      {formatMoney(row.debt)}
                    </td>
                    <td className="text-center">
                      <button className={activeTab === 'phaithu' ? "btn btn-income" : "btn btn-expense"} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => handleOpenPayModal(row, activeTab === 'phaithu' ? 'thu' : 'tra')}>
                        {activeTab === 'phaithu' ? 'Thu Nợ' : 'Trả Nợ'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thanh toán nợ */}
      {payModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div className="card-header">
              <h2 className="card-title">{payModal.type === 'thu' ? 'Ghi nhận Thu Nợ' : 'Ghi nhận Trả Nợ'}</h2>
            </div>
            <div className="form-body">
              <form onSubmit={handleSubmitPay}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Đối tác:</strong> {payModal.data.name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>{payModal.type === 'thu' ? 'Khách còn nợ:' : 'Mình đang nợ:'}</strong> <span style={{ color: payModal.type === 'thu' ? 'var(--expense-color)' : 'var(--income-color)', fontWeight: 'bold' }}>{formatMoney(payModal.data.debt)} đ</span>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Số tiền {payModal.type === 'thu' ? 'thu' : 'trả'}</label>
                  <input type="number" className="form-control" min="0" max={payModal.data.debt} required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú / Diễn giải</label>
                  <input type="text" className="form-control" required value={payNote} onChange={(e) => setPayNote(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#e2e8f0' }} onClick={() => setPayModal({ isOpen: false, data: null, type: 'thu' })}>
                    Hủy
                  </button>
                  <button type="submit" className={payModal.type === 'thu' ? "btn btn-income" : "btn btn-expense"} style={{ flex: 1 }} disabled={loading}>
                    {loading ? <RefreshCw size={18} className="spinning" /> : <CheckCircle size={18} />} Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
