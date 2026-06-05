import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/reportService';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';

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

  const columns = [
    { header: 'Date', render: (row) => new Date(row.created_at).toLocaleString() },
    { header: 'User', render: (row) => row.user?.name || `User ID ${row.user_id}` },
    { header: 'Activity', render: (row) => <span className="font-semibold text-blue-600">{row.activity}</span> },
    { header: 'Table', accessor: 'table_name' },
    { header: 'Record ID', accessor: 'record_id' },
    { header: 'Signature', render: (row) => <span className="text-xs text-gray-400 font-mono" title={row.hash_signature}>{row.hash_signature.substring(0, 16)}...</span> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
      <Card>
        <Table columns={columns} data={logs} />
      </Card>
    </div>
  );
};

export default AuditLogs;
