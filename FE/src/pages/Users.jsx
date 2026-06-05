import React, { useEffect, useState } from 'react';
import { getUsers, createUser } from '../services/userService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { Users as UsersIcon, Plus } from 'lucide-react';

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
    { header: 'Role', render: (row) => (
      <Badge color={row.role_id === 1 ? 'rose' : row.role_id === 2 ? 'amber' : row.role_id === 4 ? 'emerald' : 'blue'}>
        {row.role?.name || row.role_id}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      <PageHeader 
        title="Pengguna Sistem" 
        subtitle="Kelola data pengguna, petugas, dan hak akses sistem."
        action={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? 'secondary' : 'primary'}>
            {showForm ? 'Batal' : <><Plus className="w-4 h-4 mr-2" />Tambah User</>}
          </Button>
        }
      />

      {showForm && (
        <Card title="Tambah Pengguna Baru" className="border-t-4 border-t-indigo-500">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Masukkan nama..." required />
            <Input label="Alamat Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@contoh.com" required />
            <Input label="Password Sementara" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">Pilih Peran (Role)</label>
              <select 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={formData.role_id}
                onChange={e => setFormData({...formData, role_id: e.target.value})}
              >
                <option value={1}>Admin</option>
                <option value={2}>Petugas</option>
                <option value={3}>User</option>
                <option value={4}>Pimpinan</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit">Simpan Pengguna</Button>
            </div>
          </form>
        </Card>
      )}

      <Card noPadding className="overflow-hidden">
        {users.length > 0 ? (
          <Table columns={columns} data={users} />
        ) : (
          <EmptyState icon={UsersIcon} title="Belum ada pengguna" subtitle="Data pengguna akan tampil di sini." />
        )}
      </Card>
    </div>
  );
};

export default Users;
