import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets, createTicket } from '../services/ticketService';
import { getCategories } from '../services/categoryService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low', category_id: '' });
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      if (res.data.length > 0) {
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
      case 'Diproses': return 'yellow';
      case 'Selesai': return 'green';
      case 'Ditolak': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return 'gray';
      case 'Medium': return 'blue';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Category', render: (row) => row.category?.name },
    { header: 'Priority', render: (row) => <Badge color={getPriorityColor(row.priority)}>{row.priority}</Badge> },
    { header: 'Status', render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge> },
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tickets Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Ticket'}
        </Button>
      </div>

      {showForm && (
        <Card title="Create New Ticket">
          <form onSubmit={handleSubmit}>
            <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea 
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                rows="4"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Priority</label>
                <select 
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <select 
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">Submit Ticket</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table 
          columns={columns} 
          data={tickets} 
          onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        />
      </Card>
    </div>
  );
};

export default Tickets;
