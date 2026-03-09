import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Edit2, Trash2, ChevronLeft, ChevronRight, Plus, Download } from 'lucide-react';
import { Record, REGIONS, DRIVE_STATUSES } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

export default function RecordsTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  const search = searchParams.get('search') || '';
  const region = searchParams.get('region') || '';
  const drive_status = searchParams.get('drive_status') || '';
  const sortField = searchParams.get('sortField') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  useEffect(() => {
    fetchRecords();
  }, [search, region, drive_status, sortField, sortOrder]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, region, drive_status, sortField, sortOrder });
      const res = await fetch(`/api/records?${params}`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSearchParams({ ...Object.fromEntries(searchParams), sortField: field, sortOrder: newOrder });
  };

  const handleDownload = (base64String: string, filename: string) => {
    if (!base64String) return;
    const a = document.createElement('a');
    a.href = base64String;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Candidate Records</h1>
          <p className="text-stone-500">View and manage all candidates</p>
        </div>
        <Link
          to="/add"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-emerald-700 transition-all self-start"
        >
          <Plus size={18} /> New Record
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search candidates/college/email..."
            value={search}
            onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), region: e.target.value })}
          className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none"
        >
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={drive_status}
          onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), drive_status: e.target.value })}
          className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none"
        >
          <option value="">All Drive Statuses</option>
          {DRIVE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setSearchParams({})}
          className="text-sm font-medium text-stone-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {[
                  { label: 'ID', field: 'id' },
                  { label: 'Candidate', field: 'candidate_name' },
                  { label: 'College', field: 'college_name' },
                  { label: 'Region', field: 'region' },
                  { label: 'Contact', field: 'contact_number' },
                  { label: 'Drive Date', field: 'date_of_drive' },
                  { label: 'Status', field: 'drive_status' },
                  { label: 'Files', field: 'files' },
                ].map((col) => (
                  <th
                    key={col.field}
                    onClick={() => col.field !== 'files' && toggleSort(col.field)}
                    className={`px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider ${col.field !== 'files' ? 'cursor-pointer hover:text-emerald-600 transition-colors' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.field !== 'files' && <ArrowUpDown size={14} className={sortField === col.field ? 'text-emerald-600' : 'text-stone-300'} />}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-stone-400">Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-stone-400">No candidates found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-stone-400">#{record.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-stone-900">{record.candidate_name}</div>
                      <div className="text-xs text-stone-500">{record.email_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{record.college_name}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      <span className="px-2 py-1 bg-stone-100 rounded-md text-xs">{record.region || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">{record.contact_number}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{record.date_of_drive || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        record.drive_status === 'Yes' ? 'bg-emerald-100 text-emerald-700' :
                          record.drive_status === 'No' ? 'bg-rose-100 text-rose-700' :
                            'bg-stone-100 text-stone-600'
                      )}>
                        {record.drive_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        {record.resume && (
                          <button
                            onClick={() => handleDownload(record.resume!, `Resume-${record.candidate_name}`)}
                            title="Download Resume"
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        {record.offer_letter && (
                          <button
                            onClick={() => handleDownload(record.offer_letter!, `Offer-${record.candidate_name}`)}
                            title="Download Offer Letter"
                            className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        {!record.resume && !record.offer_letter && (
                          <span className="text-xs text-stone-300">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAuthenticated ? (
                          <>
                            <Link to={`/admin/records/edit/${record.id}`} className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                              <Edit2 size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-300 italic">View Only</span>
                        )}
                      </div>
                    </td>
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
