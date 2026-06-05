import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets, createTicket } from '../services/ticketService';
import { getCategories } from '../services/categoryService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Ticket as TicketIcon, Plus, Search, Filter } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low', category_id: '' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
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
      loadTickets();
    } catch (e) {
      alert("Failed to create ticket");
    }
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
    { header: 'ID', accessor: 'id', render: (row) => <span className="text-slate-500 font-medium">#{row.id}</span> },
    { header: 'Judul Tiket', accessor: 'title', render: (row) => <span className="font-semibold text-slate-800">{row.title}</span> },
    { header: 'Kategori', render: (row) => row.category?.name || '-' },
    { header: 'Prioritas', render: (row) => <Badge color={getPriorityColor(row.priority)}>{row.priority}</Badge> },
    { header: 'Status', render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge> },
    { header: 'Tanggal', render: (row) => new Date(row.created_at).toLocaleDateString('id-ID') },
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
    <div className="space-y-6 md:space-y-8 pb-8">
      <PageHeader 
        title="Daftar Tiket Layanan" 
        subtitle="Kelola dan pantau semua tiket masuk, berikan respon dengan cepat."
        action={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Batal' : <><Plus className="w-4 h-4 mr-2" />Buat Tiket Baru</>}
          </Button>
        }
      />

      {showForm && (
        <Card title="Form Pembuatan Tiket" className="border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Judul Tiket" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Masukkan judul singkat masalah..." required />
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">Deskripsi Lengkap</label>
              <textarea 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                rows="4"
                placeholder="Ceritakan detail masalah yang dialami..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Tingkat Prioritas</label>
                <select 
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Low">Low (Rendah)</option>
                  <option value="Medium">Medium (Sedang)</option>
                  <option value="High">High (Tinggi)</option>
                  <option value="Critical">Critical (Kritis)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-1.5">Kategori Masalah</label>
                <select 
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" size="lg">Kirim Tiket Sekarang</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari ID tiket atau judul..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[140px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
          <div className="relative min-w-[140px]">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white cursor-pointer"
            >
              <option value="">Semua Prioritas</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <Card noPadding className="overflow-hidden">
        {filteredTickets.length > 0 ? (
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
  );
};

export default Tickets;
