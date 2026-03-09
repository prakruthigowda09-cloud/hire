import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { Record, REGIONS, DRIVE_STATUSES } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { fileToBase64 } from '../lib/fileUtils';

const InputField: React.FC<any> = ({ label, required = false, type = 'text', value, onChange, placeholder, options, accept }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-stone-700">{label} {required && '*'}</label>
    {type === 'select' ? (
      <select
        required={required}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
      >
        {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        required={required}
        rows={3}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
        placeholder={placeholder}
      />
    ) : (
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        accept={accept}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        placeholder={placeholder}
      />
    )}
  </div>
);

export default function EditRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    candidate_name: '',
    college_name: '',
    date: '',
    place: '',
    region: REGIONS[0],
    contact_number: '',
    email_id: '',
    date_of_drive: '',
    drive_status: DRIVE_STATUSES[0],
    round_1_person: '',
    round_2_person: '',
    comments: '',
    training_period_date: '',
    resume: '',
    offer_letter: ''
  });

  const [fileNames, setFileNames] = useState({
    resume: '',
    offer_letter: ''
  });

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const record = data.find((r: any) => r.id === Number(id));
      if (record) {
        setFormData({
          candidate_name: record.candidate_name || '',
          college_name: record.college_name || '',
          date: record.date || '',
          place: record.place || '',
          region: record.region || REGIONS[0],
          contact_number: record.contact_number || '',
          email_id: record.email_id || '',
          date_of_drive: record.date_of_drive || '',
          drive_status: record.drive_status || DRIVE_STATUSES[0],
          round_1_person: record.round_1_person || '',
          round_2_person: record.round_2_person || '',
          comments: record.comments || '',
          training_period_date: record.training_period_date || '',
          resume: record.resume || '',
          offer_letter: record.offer_letter || ''
        });
        setFileNames({
          resume: record.resume ? 'Existing Resume (Upload to replace)' : '',
          offer_letter: record.offer_letter ? 'Existing Offer Letter (Upload to replace)' : ''
        });
      }
    } catch (err) {
      setError('Failed to load record');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'resume' | 'offer_letter') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
        setError('File size must be less than 10MB');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, [field]: base64 }));
        setFileNames(prev => ({ ...prev, [field]: file.name }));
        setError(null);
      } catch (err) {
        setError('Failed to process file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/records'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update record');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Record Updated!</h2>
          <p className="text-stone-500 mt-2">Redirecting you back...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Edit Record #{id}</h1>
            <p className="text-stone-500">Modify existing candidate entry</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Candidate Name" required value={formData.candidate_name} onChange={(e: any) => setFormData({ ...formData, candidate_name: e.target.value })} placeholder="e.g. John Doe" />
          <InputField label="College Name" required value={formData.college_name} onChange={(e: any) => setFormData({ ...formData, college_name: e.target.value })} placeholder="e.g. RVCE" />

          <InputField label="Contact Number" required type="tel" value={formData.contact_number} onChange={(e: any) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="+91..." />
          <InputField label="Email ID" required type="email" value={formData.email_id} onChange={(e: any) => setFormData({ ...formData, email_id: e.target.value })} placeholder="john@example.com" />

          <InputField label="Place" required value={formData.place} onChange={(e: any) => setFormData({ ...formData, place: e.target.value })} placeholder="e.g. Bangalore" />
          <InputField label="Region" type="select" value={formData.region} onChange={(e: any) => setFormData({ ...formData, region: e.target.value })} options={REGIONS} />

          <InputField label="Date" type="date" value={formData.date} onChange={(e: any) => setFormData({ ...formData, date: e.target.value })} />
          <InputField label="Date of Drive" type="date" value={formData.date_of_drive} onChange={(e: any) => setFormData({ ...formData, date_of_drive: e.target.value })} />
          <InputField label="Drive Status" type="select" value={formData.drive_status} onChange={(e: any) => setFormData({ ...formData, drive_status: e.target.value })} options={DRIVE_STATUSES} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
          <h3 className="col-span-full font-bold text-stone-800">Interview Details</h3>
          <InputField label="Round 1 Person Responsible" value={formData.round_1_person} onChange={(e: any) => setFormData({ ...formData, round_1_person: e.target.value })} placeholder="Interviewer Name" />
          <InputField label="Round 2 Person Responsible" value={formData.round_2_person} onChange={(e: any) => setFormData({ ...formData, round_2_person: e.target.value })} placeholder="Interviewer Name" />
          <InputField label="Training Period Date" value={formData.training_period_date} onChange={(e: any) => setFormData({ ...formData, training_period_date: e.target.value })} placeholder="e.g. Jan-March 2024" />
        </div>

        <div className="space-y-2">
          <InputField label="Comments" type="textarea" value={formData.comments} onChange={(e: any) => setFormData({ ...formData, comments: e.target.value })} placeholder="Any additional comments..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-stone-100 pt-6">
          <h3 className="col-span-full font-bold text-stone-800">Attachments</h3>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 block">Resume (PDF, Image)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(e, 'resume')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full px-4 py-4 bg-stone-50 border-2 border-dashed border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Upload size={18} />
                <span className="font-medium">{fileNames.resume || 'Click to Upload to Replace'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 block">Offer Letter (PDF, Image)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(e, 'offer_letter')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full px-4 py-4 bg-stone-50 border-2 border-dashed border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-600 hover:bg-emerald-50 transition-colors">
                <Upload size={18} />
                <span className="font-medium">{fileNames.offer_letter || 'Click to Upload to Replace'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : 'Update Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
