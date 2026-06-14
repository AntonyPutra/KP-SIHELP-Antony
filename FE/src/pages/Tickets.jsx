import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets, createTicket } from '../services/ticketService';
import { getCategories } from '../services/categoryService';
import { generateTicketSuggestion } from '../services/aiService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Ticket as TicketIcon, Plus, Search, Filter, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low', category_id: '' });
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTickets();
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
      if (res.data?.length > 0) {
        setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTickets();
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket({ ...formData, category_id: Number(formData.category_id) });
      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'Low', category_id: categories[0]?.id || '' });
      setAiResult(null);
      setAiError(null);
      loadTickets();
    } catch (e) {
      alert("Failed to create ticket");
    }
  };

  const handleAIAssist = async () => {
    if (!formData.title && !formData.description) {
      alert("Mohon isi judul atau deskripsi terlebih dahulu.");
      return;
    }
    try {
      setAiLoading(true);
      setAiResult(null);
      setAiError(null);
      const res = await generateTicketSuggestion({
        title: formData.title,
        description: formData.description,
        category_hint: "",
        priority_hint: formData.priority
      });
      if (res.success) {
        setAiResult(res.data);
      } else {
        setAiError(res.message || "AI Assistant belum dapat digunakan. Kuota Gemini API habis atau konfigurasi belum tersedia.");
      }
    } catch (e) {
      console.error(e);
      setAiError("AI Assistant tidak tersedia atau terjadi kesalahan jaringan.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = () => {
    if (!aiResult) return;
    setFormData({
      ...formData,
      title: aiResult.improved_title || formData.title,
      description: aiResult.improved_description || formData.description,
    });
    alert("Saran AI telah diterapkan ke form.");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'blue';
      case 'Diproses': return 'amber';
      case 'Selesai': return 'emerald';
      case 'Ditolak': return 'rose';
      default: return 'slate';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return 'slate';
      case 'Medium': return 'blue';
      case 'High': return 'orange';
      case 'Critical': return 'rose';
      default: return 'slate';
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="text-slate-500 font-bold">#{row.id}</span> },
    { header: 'Judul Tiket', accessor: 'title', render: (row) => <span className="font-bold text-slate-800">{row.title}</span> },
    { header: 'Kategori', render: (row) => <span className="font-medium text-slate-600">{row.category?.name || '-'}</span> },
    { header: 'Prioritas', render: (row) => <Badge color={getPriorityColor(row.priority)}>{row.priority}</Badge> },
    { header: 'Status', render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge> },
    { header: 'Tanggal', render: (row) => <span className="text-slate-500 font-medium">{new Date(row.created_at).toLocaleDateString('id-ID')}</span> },
  ];

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.id.toString() === searchQuery;
      const matchStatus = statusFilter ? ticket.status === statusFilter : true;
      const matchPriority = priorityFilter ? ticket.priority === priorityFilter : true;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in">
      <PageHeader 
        title="Daftar Tiket Layanan" 
        subtitle="Kelola dan pantau semua tiket masuk, berikan respon dengan cepat."
        action={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'} className={showForm ? "" : "shadow-indigo-500/20 shadow-lg"}>
            {showForm ? 'Batal' : <><Plus className="w-4 h-4 mr-2" />Buat Tiket Baru</>}
          </Button>
        }
      />

      {showForm && (
        <Card title="Form Pembuatan Tiket" className="animate-slide-up border-t-4 border-t-blue-500">
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* Background decorative blob for form */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <Input label="Judul Tiket" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Masukkan judul singkat masalah..." required />
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Deskripsi Lengkap</label>
              <textarea 
                className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                rows="4"
                placeholder="Ceritakan detail masalah yang dialami..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Tingkat Prioritas</label>
                <div className="relative">
                  <Select
                    options={[
                      { value: 'Low', label: 'Low (Rendah)' },
                      { value: 'Medium', label: 'Medium (Sedang)' },
                      { value: 'High', label: 'High (Tinggi)' },
                      { value: 'Critical', label: 'Critical (Kritis)' }
                    ]}
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Kategori Masalah</label>
                <div className="relative">
                  <Select
                    options={categories.map(c => ({ value: c.id, label: c.name }))}
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Button type="submit" size="lg" className="shadow-blue-500/20 shadow-lg">Kirim Tiket Sekarang</Button>
              <Button 
                type="button" 
                size="lg" 
                onClick={handleAIAssist} 
                disabled={aiLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/25 shadow-lg border-none group"
              >
                {aiLoading ? (
                  <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Memproses AI...</span>
                ) : (
                  <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Bantu AI</span>
                )}
              </Button>
            </div>
            
            {aiError && (
              <div className="mt-6 p-4 glass-panel border-rose-200 bg-rose-50/50 text-rose-800 text-sm animate-fade-in shadow-inner">
                <span className="font-bold flex items-center mb-1"><AlertTriangleIcon className="w-4 h-4 mr-2" /> Peringatan AI Assistant</span>
                {aiError}
              </div>
            )}
            
            {aiResult && (
              <div className="mt-8 overflow-hidden rounded-3xl glass-panel border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-cyan-50/40 animate-slide-up shadow-xl shadow-blue-500/5">
                <div className="px-6 py-4 bg-blue-500/10 border-b border-blue-200/50 flex justify-between items-center backdrop-blur-md">
                  <h4 className="font-bold text-blue-900 flex items-center text-lg">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" /> Saran AI Assistant
                  </h4>
                  <Button type="button" size="sm" onClick={applyAISuggestion} className="!bg-blue-600 hover:!bg-blue-700 text-white shadow-blue-500/20 shadow-md border-none">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Gunakan Saran
                  </Button>
                </div>
                <div className="p-6 space-y-5 text-sm text-blue-950/80">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white/50 p-4 rounded-2xl border border-white/70 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Rekomendasi Judul</p>
                      <p className="font-semibold text-slate-800 text-base">{aiResult.improved_title}</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-2xl border border-white/70 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Kategori & Prioritas</p>
                      <div className="flex gap-2 mt-1.5">
                        <Badge color="blue">{aiResult.suggested_category}</Badge>
                        <Badge color="amber">{aiResult.suggested_priority}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 p-4 rounded-2xl border border-white/70 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Rekomendasi Deskripsi</p>
                    <p className="text-slate-700 leading-relaxed">{aiResult.improved_description}</p>
                  </div>

                  <div className="bg-white/50 p-4 rounded-2xl border border-white/70 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Ringkasan Analisis</p>
                    <p className="text-slate-700 italic">{aiResult.summary}</p>
                  </div>

                  {aiResult.recommended_steps && aiResult.recommended_steps.length > 0 && (
                    <div className="bg-white/50 p-4 rounded-2xl border border-white/70 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Langkah Awal Penanganan</p>
                      <ul className="space-y-2">
                        {aiResult.recommended_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start">
                            <ChevronRight className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                            <span className="text-slate-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 delay-100 animate-slide-up relative overflow-visible z-10">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari ID tiket atau judul..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-2.5 text-sm rounded-xl outline-none"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[150px]">
            <Select
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'Open', label: 'Open' },
                { value: 'Diproses', label: 'Diproses' },
                { value: 'Selesai', label: 'Selesai' },
                { value: 'Ditolak', label: 'Ditolak' }
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={Filter}
            />
          </div>
          <div className="relative min-w-[150px]">
            <Select
              options={[
                { value: '', label: 'Semua Prioritas' },
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
              ]}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              icon={Filter}
            />
          </div>
        </div>
      </div>

      <div className="delay-200 animate-slide-up relative z-0">
        <Card noPadding className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <span className="font-semibold tracking-wide">Memuat data tiket...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 font-medium">{error}</div>
          ) : filteredTickets.length > 0 ? (
            <Table 
              columns={columns} 
              data={filteredTickets} 
              onRowClick={(row) => navigate(`/tickets/${row.id}`)}
            />
          ) : (
            <EmptyState 
              icon={TicketIcon} 
              title="Tidak ada tiket ditemukan" 
              subtitle={tickets.length > 0 ? "Tidak ada tiket yang sesuai dengan filter pencarian Anda." : "Belum ada tiket layanan yang terdaftar di sistem."} 
            />
          )}
        </Card>
      </div>
    </div>
  );
};

// Helper components for missing icons
const ChevronDownIcon = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const AlertTriangleIcon = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default Tickets;
