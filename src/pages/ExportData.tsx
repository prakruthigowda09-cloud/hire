import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileDown, FileSpreadsheet, FileText, FileJson } from 'lucide-react';

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchAllRecords = async () => {
    if (!token) return [];
    const res = await fetch('/api/records', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  };

  const exportExcel = async () => {
    setLoading(true);
    const records = await fetchAllRecords();
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
    XLSX.writeFile(workbook, "records_export.xlsx");
    setLoading(false);
  };

  const exportCSV = async () => {
    setLoading(true);
    const records = await fetchAllRecords();
    const worksheet = XLSX.utils.json_to_sheet(records);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "records_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoading(false);
  };

  const exportPDF = async () => {
    setLoading(true);
    const records = await fetchAllRecords();
    const doc = new jsPDF() as any;

    doc.text("Hire Drive Records Export", 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['ID', 'Candidate', 'College', 'Contact', 'Status', 'Drive Date']],
      body: records.map((r: any) => [r.id, r.candidate_name, r.college_name, r.contact_number, r.drive_status, r.date_of_drive]),
    });

    doc.save("records_export.pdf");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Export Data</h1>
        <p className="text-stone-500">Download your entire database in various professional formats</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { name: 'Excel (.xlsx)', icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50', action: exportExcel },
          { name: 'CSV (.csv)', icon: FileJson, color: 'text-blue-600', bg: 'bg-blue-50', action: exportCSV },
          { name: 'PDF (.pdf)', icon: FileText, color: 'text-red-600', bg: 'bg-red-50', action: exportPDF },
        ].map((format, i) => (
          <button
            key={i}
            onClick={format.action}
            disabled={loading}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-4 group"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", format.bg, format.color)}>
              <format.icon size={32} />
            </div>
            <span className="font-bold text-stone-900">{format.name}</span>
            <div className="text-xs text-stone-400 flex items-center gap-1">
              <FileDown size={12} /> Download
            </div>
          </button>
        ))}
      </div>

      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-sm text-stone-500">
        <p className="font-semibold text-stone-700 mb-2">Export Information:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All records currently in the database will be included.</li>
          <li>Filters applied in the table view do not affect exports.</li>
          <li>PDF exports are optimized for standard A4 printing.</li>
        </ul>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
