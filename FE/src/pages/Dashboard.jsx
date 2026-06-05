import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getTicketsByStatus, getTicketsByCategory, getTicketsMonthly } from '../services/dashboardService';
import Card from '../components/ui/Card';
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
  LineElement
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

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
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  if (!summary) return <div>Loading dashboard...</div>;

  const statusChartData = {
    labels: statusData.map(d => d.status),
    datasets: [
      {
        data: statusData.map(d => d.count),
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.map(d => d.name),
    datasets: [
      {
        label: 'Tickets',
        data: categoryData.map(d => d.count),
        backgroundColor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Tickets',
        data: monthlyData.map(d => d.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 uppercase">Total Tickets</div>
          <div className="text-3xl font-bold text-gray-800">{summary.total_tickets}</div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500 uppercase">Open Tickets</div>
          <div className="text-3xl font-bold text-gray-800">{summary.total_open_tickets}</div>
        </Card>
        <Card className="border-l-4 border-green-500">
          <div className="text-sm text-gray-500 uppercase">Done Tickets</div>
          <div className="text-3xl font-bold text-gray-800">{summary.total_done_tickets}</div>
        </Card>
        <Card className="border-l-4 border-purple-500">
          <div className="text-sm text-gray-500 uppercase">Total Users</div>
          <div className="text-3xl font-bold text-gray-800">{summary.total_users}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tickets by Status">
          <div className="h-64">
            <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
        <Card title="Tickets by Category">
          <div className="h-64">
            <Bar data={categoryChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
        <Card title="Tickets Monthly Trend" className="lg:col-span-2">
          <div className="h-64">
            <Line data={monthlyChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
