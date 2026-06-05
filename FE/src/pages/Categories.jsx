import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Folders } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ name });
      setName('');
      loadCategories();
    } catch (e) {
      alert("Failed to create category");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (e) {
        alert("Failed to delete category");
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Actions', 
      render: (row) => (
        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">Delete</button>
      ) 
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      <PageHeader 
        title="Kategori Masalah" 
        subtitle="Kelola daftar kategori untuk klasifikasi tiket layanan."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title="Tambah Kategori" className="border-t-4 border-t-amber-500">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nama Kategori" value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Jaringan, Hardware..." required />
              <Button type="submit" className="w-full">Simpan Kategori</Button>
            </form>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card noPadding className="overflow-hidden h-fit">
            {categories.length > 0 ? (
              <Table columns={columns} data={categories} />
            ) : (
              <EmptyState icon={Folders} title="Belum ada kategori" subtitle="Tambahkan kategori masalah pertama Anda." />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Categories;
