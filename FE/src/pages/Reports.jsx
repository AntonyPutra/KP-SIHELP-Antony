import React, { useEffect, useState } from 'react';
import { getReportTickets } from '../services/reportService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import DatePicker from '../components/ui/DatePicker';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { FileText, Filter as FilterIcon } from 'lucide-react';

const Reports = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status) params.status = filters.status;
      
      const res = await getReportTickets(params);
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Category', render: (row) => row.category?.name },
    { header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      <PageHeader 
        title="Laporan Tiket" 
        subtitle="Unduh atau lihat rekapitulasi tiket berdasarkan filter tanggal dan status."
      />

      <Card className="border-t-4 border-t-emerald-500">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm relative z-10">
          <div className="flex-1 w-full md:w-auto">
            <DatePicker label="Tanggal Mulai" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
          </div>
          <div className="flex-1 w-full md:w-auto">
            <DatePicker label="Tanggal Akhir" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
          </div>
          <div className="w-full md:w-auto flex-1">
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Status Tiket</label>
            <div className="relative">
              <Select 
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'Open', label: 'Open' },
                  { value: 'Diproses', label: 'Diproses' },
                  { value: 'Selesai', label: 'Selesai' },
                  { value: 'Ditolak', label: 'Ditolak' }
                ]}
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
                icon={FilterIcon}
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button type="submit" className="w-full md:w-auto shadow-sm">Terapkan Filter</Button>
          </div>
        </form>
        <div className="-mx-6 sm:-mx-8 -mb-5 sm:-mb-8 mt-6">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Memuat laporan...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : tickets.length > 0 ? (
            <Table columns={columns} data={tickets} />
          ) : (
            <EmptyState icon={FileText} title="Tidak ada laporan" subtitle="Silakan sesuaikan filter tanggal atau status untuk melihat data." />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
