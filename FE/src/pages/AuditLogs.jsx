import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/reportService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { History } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  const loadData = async () => {
    try {
      const res = await getAuditLogs();
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatHash = (hash) => {
    if (!hash) return '-';
    if (hash.length <= 24) return hash;
    return `${hash.slice(0, 12)}...${hash.slice(-12)}`;
  };

  const columns = [
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleString('id-ID') },
    { header: 'User', render: (row) => row.user?.name || `User ID ${row.user_id}` },
    { header: 'Activity', render: (row) => <span className="font-semibold text-blue-600">{row.activity}</span> },
    { header: 'Table', accessor: 'table_name' },
    { header: 'Record ID', accessor: 'record_id' },
    { header: 'Signature', render: (row) => (
      <div className="group relative inline-block">
        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md" title={row.hash_signature}>
          {formatHash(row.hash_signature)}
        </span>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8">
      <PageHeader 
        title="Audit Logs" 
        subtitle="Rekaman jejak aktivitas pengguna, manipulasi data, dan kejadian sistem untuk keamanan."
      />
      <Card noPadding className="overflow-hidden">
        {logs.length > 0 ? (
          <Table columns={columns} data={logs} />
        ) : (
          <EmptyState icon={History} title="Tidak ada catatan audit" subtitle="Sistem belum mencatat aktivitas apapun." />
        )}
      </Card>
    </div>
  );
};

export default AuditLogs;
