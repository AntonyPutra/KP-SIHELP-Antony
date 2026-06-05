import React, { useEffect, useState } from 'react';
import { getUsers, createUser } from '../services/userService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: 3 });

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({ ...formData, role_id: Number(formData.role_id) });
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role_id: 3 });
      loadUsers();
    } catch (e) {
      alert("Failed to create user");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', render: (row) => row.role?.name || row.role_id },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {showForm && (
        <Card title="Add New User">
          <form onSubmit={handleSubmit}>
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select 
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.role_id}
                onChange={e => setFormData({...formData, role_id: e.target.value})}
              >
                <option value={1}>Admin</option>
                <option value={2}>Petugas</option>
                <option value={3}>User</option>
                <option value={4}>Pimpinan</option>
              </select>
            </div>
            <Button type="submit">Save User</Button>
          </form>
        </Card>
      )}

      <Card>
        <Table columns={columns} data={users} />
      </Card>
    </div>
  );
};

export default Users;
