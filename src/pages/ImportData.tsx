import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { FileUp, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

export default function ImportData() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);
  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const excelDateToJS = (serial: any) => {
          if (typeof serial !== 'number') return serial;
          const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
        };

        // Basic mapping validation
        const mappedData = jsonData
          .filter((row: any) => row['Candidate Name'] || row.candidate_name || row.Name || row.name || row['Name of the college'])
          .map((row: any) => ({
            candidate_name: row['Candidate Name'] || row.candidate_name || row.Name || row.name || row['Name of the college'] || 'Untitled',
            college_name: row['College Name'] || row.college_name || row['Name of the college'] || 'Unknown',
            date: excelDateToJS(row.Date || row.date) || new Date().toISOString().split('T')[0],
            place: row.Place || row.place || '',
            region: row.Region || row.region || 'South',
            contact_number: String(row['Contact Number'] || row.contact_number || row['Contact number'] || ''),
            email_id: row['Email ID'] || row.email_id || '',
            date_of_drive: excelDateToJS(row['Date of Drive'] || row.date_of_drive || row['Date of drive']) || '',
            drive_status: row['Drive Status'] || row.drive_status || row['Drive Status Yes/No'] || 'Pending',
            round_1_person: row['Round 1 Person Responsible'] || row.round_1_person || row['Person responsible'] || '',
            round_2_person: row['Round 2 Person Responsible'] || row.round_2_person || '',
            comments: row.Comments || row.comments || '',
            training_period_date: excelDateToJS(row['Training Period Date'] || row.training_period_date) || '',
            resume: '',
            offer_letter: ''
          }));

        const res = await fetch('/api/admin/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ records: mappedData })
        });

        const resData = await res.json();
        if (res.ok) {
          setResult({ success: true, count: resData.count });
          setFile(null);
        } else {
          setResult({ success: false, error: resData.error });
        }
      } catch (err) {
        setResult({ success: false, error: 'Failed to process file' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Import Data</h1>
        <p className="text-stone-500">Upload an Excel (.xlsx) or CSV file to bulk import records</p>
      </div>

      <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
          <FileUp size={40} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-stone-900">Select your spreadsheet</h3>
          <p className="text-stone-500 text-sm max-w-xs">
            Make sure your file has columns like: <br />
            <span className="font-mono text-xs bg-stone-100 px-1 rounded">Candidate Name, College Name, Contact Number, Email ID, Drive Status...</span>
          </p>
        </div>

        <label className="cursor-pointer">
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" />
          <div className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center gap-2">
            <Upload size={18} /> {file ? 'Change File' : 'Choose File'}
          </div>
        </label>

        {file && (
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
            Selected: {file.name}
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Processing...' : 'Start Import'}
        </button>
      )}

      {result && (
        <div className={cn(
          "p-6 rounded-2xl flex items-start gap-4",
          result.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
        )}>
          {result.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <div>
            <h4 className="font-bold">{result.success ? 'Import Complete!' : 'Import Failed'}</h4>
            <p className="text-sm mt-1">
              {result.success
                ? `Successfully imported ${result.count} records into the database.`
                : result.error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
