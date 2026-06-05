import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getTicketsByStatus, getTicketsByCategory, getTicketsMonthly } from '../services/dashboardService';
import { getTickets } from '../services/ticketService';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, CheckCircle, AlertTriangle, Plus, FileText, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sum = await getDashboardSummary();
        setSummary(sum.data);

        const stat = await getTicketsByStatus();
        setStatusData(stat.data || []);

        const cat = await getTicketsByCategory();
        setCategoryData(cat.data || []);

        const mon = await getTicketsMonthly();
        setMonthlyData(mon.data || []);

        const ticketsRes = await getTickets();
        setRecentTickets(ticketsRes.data ? ticketsRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  if (!summary) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Memuat dashboard...</div>;

  const statusChartData = {
    labels: statusData.map(d => d.status),
    datasets: [{
      data: statusData.map(d => d.count),
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const categoryChartData = {
    labels: categoryData.map(d => d.name),
    datasets: [{
      label: 'Jumlah Tiket',
      data: categoryData.map(d => d.count),
      backgroundColor: '#8b5cf6',
      borderRadius: 6,
    }],
  };

  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: 'Tiket Masuk',
      data: monthlyData.map(d => d.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 8,
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Hero Panel */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Selamat datang di SIHELP</h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Pantau tiket layanan, pengguna, kategori masalah, dan aktivitas sistem secara terpusat dalam satu workspace.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" onClick={() => navigate('/reports')} className="bg-white/10 hover:bg-white/20 text-white border-none">
              <FileText className="w-4 h-4 mr-2" />
              Laporan
            </Button>
            <Button onClick={() => navigate('/tickets')} className="bg-blue-500 hover:bg-blue-600 border-none">
              <Plus className="w-4 h-4 mr-2" />
              Buat Tiket
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Tickets" value={summary.total_tickets} subtitle="Seluruh tiket masuk" icon={Ticket} colorClass="blue" />
        <StatCard title="Open Tickets" value={summary.total_open_tickets} subtitle="Menunggu diproses" icon={AlertTriangle} colorClass="amber" />
        <StatCard title="Done Tickets" value={summary.total_done_tickets} subtitle="Tiket telah selesai" icon={CheckCircle} colorClass="emerald" />
        <StatCard title="Total Users" value={summary.total_users} subtitle="Pengguna terdaftar" icon={Users} colorClass="indigo" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Monthly Trend - 2/3 */}
        <div className="lg:col-span-2 flex flex-col">
          <ChartCard title="Tren Tiket Bulanan" subtitle="Statistik jumlah tiket masuk per bulan" className="h-full">
            {monthlyData.length > 0 ? (
              <Line data={monthlyChartData} options={barChartOptions} />
            ) : (
              <EmptyState icon={Activity} title="Belum ada tren" subtitle="Data tren bulanan akan muncul setelah ada tiket." />
            )}
          </ChartCard>
        </div>

        {/* Status Chart - 1/3 */}
        <div className="lg:col-span-1 flex flex-col">
          <ChartCard title="Status Tiket" subtitle="Proporsi status tiket saat ini" className="h-full">
            {statusData.length > 0 ? (
              <Pie data={statusChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {position: 'bottom', labels: {usePointStyle: true, boxWidth: 8}}}}} />
            ) : (
              <EmptyState icon={AlertTriangle} title="Tidak ada status" subtitle="Buat tiket pertama untuk melihat status." />
            )}
          </ChartCard>
        </div>

        {/* Category Chart - 1/2 or 2/3 */}
        <div className="lg:col-span-1 flex flex-col">
          <ChartCard title="Kategori Masalah" subtitle="Distribusi tiket berdasarkan kategori" className="h-full">
            {categoryData.length > 0 ? (
              <Bar data={categoryChartData} options={barChartOptions} />
            ) : (
              <EmptyState icon={FileText} title="Belum ada kategori" subtitle="Data kategori akan tampil di sini." />
            )}
          </ChartCard>
        </div>

        {/* Recent Tickets - 1/2 or 2/3 */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-200/70 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center bg-white">
              <h3 className="text-base font-bold text-slate-800">Tiket Terbaru</h3>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tickets')}>Lihat Semua</Button>
            </div>
            <div className="flex-1 p-0 overflow-x-auto custom-scrollbar">
              {recentTickets.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Judul Tiket</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Prioritas</th>
                      <th className="px-6 py-3 whitespace-nowrap">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {recentTickets.map(ticket => (
                      <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-colors group">
                        <td className="px-6 py-3.5 text-sm font-medium text-slate-500">#{ticket.id}</td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{ticket.title}</td>
                        <td className="px-6 py-3.5">
                          <Badge color={ticket.status === 'Open' ? 'blue' : ticket.status === 'Selesai' ? 'emerald' : ticket.status === 'Ditolak' ? 'rose' : 'amber'}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge color={ticket.priority === 'High' ? 'orange' : ticket.priority === 'Critical' ? 'rose' : ticket.priority === 'Medium' ? 'blue' : 'slate'}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                          {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8">
                  <EmptyState icon={Ticket} title="Belum ada tiket masuk" subtitle="Tiket yang dibuat pengguna akan muncul di daftar ini." />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
