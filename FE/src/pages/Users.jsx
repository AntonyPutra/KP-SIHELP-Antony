import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { Users as UsersIcon, Plus, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create / Edit state
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role_id: 3 });
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role_id: 3 });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEdit = (user) => {
    setIsEditMode(true);
    setEditingId(user.id);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', // Leave empty for edit unless they want to change
      role_id: user.role_id 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (e) {
      alert("Gagal menghapus pengguna. Mungkin pengguna ini masih memiliki tiket terkait.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role_id: Number(formData.role_id) };
      
      if (isEditMode) {
        if (!payload.password) delete payload.password; // Don't send empty password on update
        await updateUser(editingId, payload);
      } else {
        await createUser(payload);
      }
      
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role_id: 3 });
      loadUsers();
    } catch (e) {
      alert(`Gagal ${isEditMode ? 'mengubah' : 'menambah'} pengguna`);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="text-slate-500 font-bold">#{row.id}</span> },
    { header: 'Nama Lengkap', accessor: 'name', render: (row) => <span className="font-bold text-slate-800">{row.name}</span> },
    { header: 'Email', accessor: 'email', render: (row) => <span className="text-slate-600 font-medium">{row.email}</span> },
    { header: 'Role Akses', render: (row) => (
      <Badge color={row.role_id === 1 ? 'rose' : row.role_id === 2 ? 'amber' : row.role_id === 4 ? 'emerald' : 'blue'}>
        {row.role?.name || (row.role_id === 1 ? 'Admin' : row.role_id === 2 ? 'Petugas' : row.role_id === 3 ? 'User' : 'Pimpinan')}
      </Badge>
    )},
    { header: 'Aksi', render: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}
          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title="Edit Pengguna"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); confirmDelete(row); }}
          className="p-1.5 rounded-lg transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100"
          title="Hapus Pengguna"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in relative">
      <PageHeader 
        title="Manajemen Pengguna" 
        subtitle="Kelola data akun, petugas, dan hak akses sistem secara terpusat."
        action={
          <Button onClick={() => showForm ? setShowForm(false) : handleOpenCreate()} variant={showForm ? 'secondary' : 'primary'} className={showForm ? "" : "shadow-blue-500/20 shadow-lg"}>
            {showForm ? 'Tutup Form' : <><Plus className="w-4 h-4 mr-2" />Tambah Pengguna</>}
          </Button>
        }
      />

      {showForm && (
        <Card title={isEditMode ? "Ubah Data Pengguna" : "Tambah Pengguna Baru"} className="animate-slide-up border-t-4 border-t-blue-500 relative overflow-visible z-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Masukkan nama pengguna..." required />
              <Input label="Alamat Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@contoh.com" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">
                  Password {isEditMode && <span className="text-slate-400 font-normal text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={isEditMode ? "••••••••" : "Masukkan password awal"}
                  required={!isEditMode}
                  className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Hak Akses (Role)</label>
                <div className="relative">
                  <Select
                    options={[
                      { value: 1, label: 'Administrator' },
                      { value: 2, label: 'Petugas IT/Support' },
                      { value: 3, label: 'Pengguna Umum' },
                      { value: 4, label: 'Pimpinan/Manajemen' }
                    ]}
                    value={Number(formData.role_id)}
                    onChange={e => setFormData({...formData, role_id: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 flex items-center gap-3">
              <Button type="submit" size="lg" className="shadow-blue-500/20 shadow-lg">
                {isEditMode ? 'Simpan Perubahan' : 'Buat Pengguna'}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="delay-100 animate-slide-up">
        <Card noPadding className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <span className="font-semibold tracking-wide">Memuat daftar pengguna...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 font-medium">{error}</div>
          ) : users.length > 0 ? (
            <Table columns={columns} data={users} />
          ) : (
            <EmptyState icon={UsersIcon} title="Belum ada pengguna" subtitle="Data pengguna akan tampil di sini setelah ditambahkan." />
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
          <div className="glass-panel-strong p-6 w-full max-w-md relative z-10 animate-slide-up">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 rounded-full bg-rose-100/80 flex items-center justify-center mb-4 shadow-inner border border-rose-200">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Pengguna?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-slate-700">{userToDelete?.name}</span>? 
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>Batal</Button>
                <Button variant="danger" className="flex-1" onClick={handleDelete}>Ya, Hapus</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronDownIcon = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export default Users;
