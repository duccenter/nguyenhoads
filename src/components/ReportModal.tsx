import React, { useState, useMemo } from 'react';
import { X, FileDown, Printer } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

export interface ReportColumn {
  header: string;
  key?: string;
  render: (row: any, index: number) => React.ReactNode;
  exportValue?: (row: any) => string | number;
  align?: 'left' | 'center' | 'right';
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  dateField: string;
  columns: ReportColumn[];
  totals?: (filteredData: any[]) => React.ReactNode;
  filename: string;
}

export default function ReportModal({ isOpen, onClose, title, data, dateField, columns, totals, filename }: ReportModalProps) {
  const [fromDate, setFromDate] = useState(() => format(new Date(), 'yyyy-MM-01'));
  const [toDate, setToDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const filteredData = useMemo(() => {
    if (!fromDate || !toDate) return data;
    try {
      const start = startOfDay(new Date(fromDate));
      const end = endOfDay(new Date(toDate));
      
      return data.filter(item => {
        const itemDateStr = item[dateField];
        if (!itemDateStr) return false;
        
        const itemDate = typeof itemDateStr === 'string' ? parseISO(itemDateStr) : new Date(itemDateStr);
        if (isNaN(itemDate.getTime())) return false;
        
        return isWithinInterval(itemDate, { start, end });
      });
    } catch (e) {
      return data;
    }
  }, [data, dateField, fromDate, toDate]);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    const headers = ["STT", ...columns.map(c => c.header)];
    const rows = filteredData.map((row, idx) => {
      const rowData = columns.map(c => {
        let val: string | number = '';
        if (c.exportValue) {
          val = c.exportValue(row);
        } else if (c.key) {
          val = row[c.key];
        }
        return val;
      });
      return [idx + 1, ...rowData];
    });
    
    // Add totals row if exists (simplistic evaluation by just leaving blank/formulas if we want, but let's just keep it simple)
    // Actually, XLSX supports aoa_to_sheet perfectly
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Auto-size columns roughly
    const colWidths = headers.map(h => ({ wch: Math.max(10, h.length + 5) }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo");
    
    XLSX.writeFile(wb, `${filename}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-print-area');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Từ ngày:</span>
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Đến ngày:</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
            >
              <Printer size={16} /> In báo cáo
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              <FileDown size={16} /> Xuất Excel
            </button>
          </div>
        </div>

        {/* Content (Table) */}
        <div className="flex-1 overflow-auto p-5 bg-slate-50" id="report-print-area">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Print Header */}
            <div className="hidden print:block text-center mb-6 pt-4">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm text-gray-600 mt-2">
                Từ ngày: {fromDate ? format(new Date(fromDate), 'dd/MM/yyyy') : '...'} - Đến ngày: {toDate ? format(new Date(toDate), 'dd/MM/yyyy') : '...'}
              </p>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left text-sm whitespace-nowrap print:whitespace-normal print:text-[10px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs print:text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3 print:px-1 print:py-1">STT</th>
                    {columns.map((col, idx) => (
                      <th key={idx} className={`px-4 py-3 print:px-1 print:py-1 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">
                        Không có dữ liệu trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50 print:border-b print:border-slate-200">
                        <td className="px-4 py-3 print:px-1 print:py-1 text-slate-500">{rowIdx + 1}</td>
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className={`px-4 py-3 print:px-1 print:py-1 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                            <div className="max-w-[200px] sm:max-w-[250px] truncate print:max-w-none print:whitespace-normal print:break-words" title={col.exportValue ? String(col.exportValue(row)) : (col.key ? String(row[col.key] || '') : '')}>
                              {col.render(row, rowIdx)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
                {totals && filteredData.length > 0 && (
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    {totals(filteredData)}
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          #report-print-area, #report-print-area * {
            visibility: visible;
          }
          #report-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            padding: 0 !important;
            background: white !important;
          }
          .print\\:block {
            display: block !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
            table-layout: fixed;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          td, th {
            word-wrap: break-word;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          .overflow-x-auto {
            overflow: visible !important;
          }
        }
      `}} />
    </div>
  );
}
