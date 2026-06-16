import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { formatMoney } from '../utils';
import { fetchData } from '../api';

export default function KhachHang() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData('khachhang').then(res => {
      if (res.data) setCustomers(res.data);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return !!(c.name?.toLowerCase().includes(lowerSearch) || c.phone?.includes(searchTerm));
  });

  const getCustomerBadge = (spent: number) => {
    if (spent >= 20000000) return <span style={{ padding: '4px 8px', background: '#fef08a', color: '#854d0e', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>VIP</span>;
    if (spent >= 5000000) return <span style={{ padding: '4px 8px', background: '#bfdbfe', color: '#1e40af', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Thân thiết</span>;
    return <span style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontSize: '12px' }}>Mới</span>;
  };

  return (
    <div className="module-container">
      <div className="header">
        <h1 className="title">Quản Lý Khách Hàng (CRM)</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 className="card-title">Danh sách Khách Hàng</h2>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tìm theo tên hoặc SĐT..." 
              style={{ paddingLeft: '35px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Khách Hàng</th>
                <th>SĐT</th>
                <th className="text-center">Phân hạng</th>
                <th className="text-right">Số lần mua</th>
                <th className="text-right">Tổng Chi Tiêu</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {loading && customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center" style={{padding: '2rem'}}>Đang tải dữ liệu...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="text-center" style={{padding: '2rem', color: 'var(--text-secondary)'}}>Không tìm thấy khách hàng.</td></tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td className="text-center">{getCustomerBadge(c.totalSpent)}</td>
                    <td className="text-right">{c.purchaseCount}</td>
                    <td className="text-right" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{formatMoney(c.totalSpent)} đ</td>
                    <td>{c.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
