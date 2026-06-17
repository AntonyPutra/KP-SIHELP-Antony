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
  const [role, setRole] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const uStr = localStorage.getItem('user');
        let userRole = 3;
        if (uStr) {
          try {
            const u = JSON.parse(uStr);
            userRole = u.role || 3;
          } catch(e) {}
        }
        setRole(userRole);

        if (userRole !== 1 && userRole !== 4) {
          navigate('/tickets', { replace: true });
          return;
        }

        if (userRole === 1 || userRole === 4) {
          const sum = await getDashboardSummary();
          setSummary(sum.data);

          const stat = await getTicketsByStatus();
          setStatusData(stat.data || []);

          const cat = await getTicketsByCategory();
          setCategoryData(cat.data || []);

          const mon = await getTicketsMonthly();
          setMonthlyData(mon.data || []);
        } else {
          setSummary({ total_tickets: 0, total_open_tickets: 0, total_done_tickets: 0, total_users: 0 });
        }

        const ticketsRes = await getTickets();
        setRecentTickets(ticketsRes.data ? ticketsRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Memuat dashboard...</div>;
  if (error) return <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">{error}</div>;
  if (!summary) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Data tidak ditemukan</div>;

  const statusChartData = {
    labels: statusData.map(d => d.status),
    datasets: [{
      data: statusData.map(d => d.count),
      backgroundColor: ['#2563EB', '#F59E0B', '#10B981', '#F43F5E', '#06B6D4'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const categoryChartData = {
    labels: categoryData.map(d => d.name),
    datasets: [{
      label: 'Jumlah Tiket',
      data: categoryData.map(d => d.count),
      backgroundColor: '#2563EB',
      borderRadius: 8,
    }],
  };

  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: 'Tiket Masuk',
      data: monthlyData.map(d => d.count),
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#2563EB',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true, font: { family: 'Inter', size: 12, weight: '500' } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
        padding: 12,
        titleFont: { family: 'Inter', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 12,
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Hero Panel */}
      <div className="rounded-3xl p-8 sm:p-10 relative overflow-hidden animate-slide-up border border-blue-900/20"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1E40AF 100%)' }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-30"
          style={{ background: 'radial-gradient(circle, #38BDF8, #0EA5E9)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
          style={{ background: 'radial-gradient(circle, #06B6D4, #0891B2)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">Helpdesk &amp; Ticketing System</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Selamat datang di SIHELP</h1>
            <p className="text-blue-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              Kelola tiket layanan, pengguna, dan laporan secara terpusat. Cepat, terstruktur, dan cerdas dengan dukungan AI.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Button variant="ghost" onClick={() => navigate('/reports')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md">
              <FileText className="w-4 h-4 mr-2" />
              Laporan
            </Button>
            <Button onClick={() => navigate('/tickets')} className="!bg-white !text-blue-700 hover:!bg-blue-50 border-transparent shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Buat Tiket
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {(role === 1 || role === 4) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="animate-slide-up delay-100"><StatCard title="Total Tickets" value={summary.total_tickets} subtitle="Seluruh tiket masuk" icon={Ticket} colorClass="blue" /></div>
          <div className="animate-slide-up delay-200"><StatCard title="Open Tickets" value={summary.total_open_tickets} subtitle="Menunggu diproses" icon={AlertTriangle} colorClass="amber" /></div>
          <div className="animate-slide-up delay-300"><StatCard title="Done Tickets" value={summary.total_done_tickets} subtitle="Tiket telah selesai" icon={CheckCircle} colorClass="emerald" /></div>
          <div className="animate-slide-up delay-[400ms]"><StatCard title="Total Users" value={summary.total_users} subtitle="Pengguna terdaftar" icon={Users} colorClass="cyan" /></div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Monthly Trend - 2/3 */}
        {(role === 1 || role === 4) && (
        <div className="lg:col-span-2 flex flex-col animate-slide-up delay-[200ms]">
          <ChartCard title="Tren Tiket Bulanan" subtitle="Statistik jumlah tiket masuk per bulan" className="h-full hover:shadow-lg transition-shadow duration-300">
            {monthlyData.length > 0 ? (
              <Line data={monthlyChartData} options={barChartOptions} />
            ) : (
              <EmptyState icon={Activity} title="Belum ada tren" subtitle="Data tren bulanan akan muncul setelah ada tiket." />
            )}
          </ChartCard>
        </div>
        )}

        {/* Status Chart - 1/3 */}
        {(role === 1 || role === 4) && (
        <div className="lg:col-span-1 flex flex-col animate-slide-up delay-[300ms]">
          <ChartCard title="Status Tiket" subtitle="Proporsi status tiket saat ini" className="h-full hover:shadow-lg transition-shadow duration-300">
            {statusData.length > 0 ? (
              <Pie data={statusChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {position: 'bottom', labels: {usePointStyle: true, boxWidth: 8}}}}} />
            ) : (
              <EmptyState icon={AlertTriangle} title="Tidak ada status" subtitle="Buat tiket pertama untuk melihat status." />
            )}
          </ChartCard>
        </div>
        )}

        {/* Category Chart - 1/2 or 2/3 */}
        {(role === 1 || role === 4) && (
        <div className="lg:col-span-1 flex flex-col animate-slide-up delay-[400ms]">
          <ChartCard title="Kategori Masalah" subtitle="Distribusi tiket berdasarkan kategori" className="h-full hover:shadow-lg transition-shadow duration-300">
            {categoryData.length > 0 ? (
              <Bar data={categoryChartData} options={barChartOptions} />
            ) : (
              <EmptyState icon={FileText} title="Belum ada kategori" subtitle="Data kategori akan tampil di sini." />
            )}
          </ChartCard>
        </div>
        )}

        {/* Recent Tickets - 1/2 or 2/3 */}
        <div className={`${(role === 1 || role === 4) ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col animate-slide-up delay-[500ms]`}>
          <div className="glass-panel flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-5 border-b border-white/40 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Tiket Terbaru</h3>
              <Button variant="secondary" size="sm" onClick={() => navigate('/tickets')} className="!py-1.5 !px-3 !text-xs">Lihat Semua</Button>
            </div>
            <div className="flex-1 p-0 overflow-x-auto custom-scrollbar">
              {recentTickets.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/40 text-xs uppercase tracking-widest text-slate-500 font-bold bg-white/20">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Judul Tiket</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Prioritas</th>
                      <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/30">
                    {recentTickets.map(ticket => (
                      <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} className="hover:bg-white/50 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">#{ticket.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{ticket.title}</td>
                        <td className="px-6 py-4">
                          <Badge color={ticket.status === 'Open' ? 'blue' : ticket.status === 'Selesai' ? 'emerald' : ticket.status === 'Ditolak' ? 'rose' : 'amber'}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={ticket.priority === 'High' ? 'orange' : ticket.priority === 'Critical' ? 'rose' : ticket.priority === 'Medium' ? 'blue' : 'slate'}>
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
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
