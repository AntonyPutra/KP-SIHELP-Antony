import React, { useEffect, useState } from 'react';
import { getReportTickets } from '../services/reportService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Reports = () => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ start_date: '', end_date: '', status: '' });

  const loadData = async () => {
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status) params.status = filters.status;
      
      const res = await getReportTickets(params);
      setTickets(res.data);
    } catch (e) {
      console.error(e);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tickets Report</h1>

      <Card>
        <form onSubmit={handleFilter} className="flex gap-4 items-end mb-4">
          <Input label="Start Date" type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
          <Input label="End Date" type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select 
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none"
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All</option>
              <option value="Open">Open</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
          <div className="mb-4">
            <Button type="submit">Filter</Button>
          </div>
        </form>

        <Table columns={columns} data={tickets} />
      </Card>
    </div>
  );
};

export default Reports;
