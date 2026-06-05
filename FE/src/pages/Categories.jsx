import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title="Add Category">
            <form onSubmit={handleSubmit}>
              <Input label="Category Name" value={name} onChange={e => setName(e.target.value)} required />
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <Table columns={columns} data={categories} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Categories;
