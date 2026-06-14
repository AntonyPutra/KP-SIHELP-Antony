import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Folders, Trash2, Info, Lightbulb, PieChart, ShieldCheck, AlertTriangle, X } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name });
      setName('');
      loadCategories();
    } catch (e) {
      alert("Failed to create category");
    }
  };

  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (e) {
      alert("Gagal menghapus kategori. Kategori mungkin masih digunakan oleh tiket.");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', render: (row) => <span className="text-slate-500 font-bold">#{row.id}</span> },
    { header: 'Nama Kategori', accessor: 'name', render: (row) => <span className="font-bold text-slate-800">{row.name}</span> },
    { 
      header: 'Aksi', 
      render: (row) => (
        <button 
          onClick={() => confirmDelete(row)} 
          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors shadow-sm"
          title="Hapus Kategori"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) 
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8 animate-fade-in relative">
      <PageHeader 
        title="Kategori Masalah" 
        subtitle="Kelola daftar kategori untuk klasifikasi tiket layanan dengan rapi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Form and Info Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Tambah Kategori" className="border-t-4 border-t-amber-500 bg-gradient-to-br from-white/90 to-amber-50/30 relative overflow-hidden shadow-md animate-slide-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <Input 
                label="Nama Kategori" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Misal: Jaringan, Hardware..." 
                required 
              />
              <Button type="submit" className="w-full shadow-amber-500/20 shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none text-white">
                Simpan Kategori Baru
              </Button>
            </form>
          </Card>

          <Card title={<span className="flex items-center text-blue-700"><Info className="w-4 h-4 mr-2" /> Informasi Kategori</span>} className="animate-slide-up delay-100 bg-blue-50/40 border-blue-100/50">
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-3 text-blue-600">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kategori</p>
                  <p className="text-xl font-black text-slate-800">{categories.length}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mr-3 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Kategori</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">Aktif dan siap digunakan oleh pengguna sistem.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mr-3 text-amber-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tips Penggunaan</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Buat kategori yang jelas dan tidak tumpang tindih agar AI dapat mengklasifikasikan tiket dengan lebih akurat.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Table Section */}
        <div className="lg:col-span-2">
          <Card noPadding className="overflow-hidden h-full min-h-[400px] animate-slide-up delay-200">
            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <span className="font-semibold tracking-wide">Memuat daftar kategori...</span>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-500 font-medium h-full flex items-center justify-center">{error}</div>
            ) : categories.length > 0 ? (
              <Table columns={columns} data={categories} />
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <EmptyState icon={Folders} title="Belum ada kategori" subtitle="Tambahkan kategori masalah pertama Anda di form sebelah kiri." />
              </div>
            )}
          </Card>
        </div>
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Kategori?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-slate-700">{categoryToDelete?.name}</span>? 
                Jika kategori ini digunakan oleh tiket yang ada, penghapusan mungkin gagal.
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

export default Categories;
