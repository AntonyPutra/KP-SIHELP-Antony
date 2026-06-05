import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket, getComments, createComment, updateTicketStatus, assignTicket } from '../services/ticketService';
import { getUsers } from '../services/userService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');

  const loadData = async () => {
    try {
      const res = await getTicket(id);
      setTicket(res.data);
      const cRes = await getComments(id);
      setComments(cRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.filter(u => u.role_id === 1 || u.role_id === 2)); // Admin or Petugas
    } catch(e) {}
  };

  useEffect(() => {
    loadData();
    loadUsers();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment(id, newComment);
      setNewComment('');
      loadData();
    } catch (e) {
      alert("Failed to add comment");
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateTicketStatus(id, status);
      loadData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleAssign = async () => {
    if (!assigneeId) return;
    try {
      await assignTicket(id, Number(assigneeId));
      loadData();
      alert("Assigned successfully");
    } catch (e) {
      alert("Failed to assign");
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Detail Tiket #{ticket.id}</h1>
          <p className="text-sm text-slate-500 mt-1">Lihat dan tanggapi tiket layanan.</p>
        </div>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card title={ticket.title} className="border-t-4 border-t-indigo-500">
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge color="slate">{ticket.category?.name}</Badge>
              <Badge color="blue">{ticket.priority}</Badge>
              <Badge color={ticket.status === 'Open' ? 'blue' : ticket.status === 'Selesai' ? 'green' : ticket.status === 'Ditolak' ? 'red' : 'yellow'}>
                {ticket.status}
              </Badge>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl text-slate-700 whitespace-pre-wrap border border-slate-100 text-sm leading-relaxed">
              {ticket.description}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center text-sm text-slate-500">
                <span className="font-medium text-slate-700 mr-1">Dilaporkan oleh:</span> {ticket.user?.name}
              </div>
              <div className="text-sm text-slate-500">
                {new Date(ticket.created_at).toLocaleString('id-ID')}
              </div>
            </div>
          </Card>

          <Card title="Diskusi & Tanggapan">
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map(c => (
                <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-slate-800">{c.user?.name}</span>
                    <span className="text-xs text-slate-400 font-medium">{new Date(c.created_at).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{c.comment}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <span className="text-2xl mb-2 block">💬</span>
                  <p className="text-sm">Belum ada diskusi.</p>
                </div>
              )}
            </div>
            <form onSubmit={handleComment} className="flex gap-3 items-start border-t border-slate-100 pt-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Ketik balasan..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={!newComment.trim()}>Kirim</Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <Card title="Tindakan">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ubah Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Open')}>Buka</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Diproses')}>Proses</Button>
                  <Button variant="success" size="sm" onClick={() => handleStatusChange('Selesai')}>Selesai</Button>
                  <Button variant="danger" size="sm" onClick={() => handleStatusChange('Ditolak')}>Tolak</Button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Tugaskan Kepada</label>
                <div className="flex flex-col gap-3">
                  <select 
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                  >
                    <option value="">Pilih Petugas...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleAssign} className="w-full" disabled={!assigneeId}>Tugaskan</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
