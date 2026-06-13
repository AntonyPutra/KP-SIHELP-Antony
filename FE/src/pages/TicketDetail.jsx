import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicket, getComments, createComment, updateTicketStatus, assignTicket } from '../services/ticketService';
import { getUsers } from '../services/userService';
import { generateTicketSummary, generateReplySuggestion } from '../services/aiService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const TicketDetail = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');

  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState(null);
  const [aiSummaryError, setAiSummaryError] = useState(null);
  
  const [aiReplyLoading, setAiReplyLoading] = useState(false);
  const [aiReplyResult, setAiReplyResult] = useState(null);
  const [aiReplyError, setAiReplyError] = useState(null);
  const [aiTone, setAiTone] = useState('professional');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTicket(id);
      setTicket(res.data);
      const cRes = await getComments(id);
      setComments(cRes.data);
    } catch (e) {
      console.error(e);
      setError("Gagal memuat detail tiket");
    } finally {
      setLoading(false);
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

  const handleSummarize = async () => {
    try {
      setAiSummaryLoading(true);
      setAiSummaryResult(null);
      setAiSummaryError(null);
      const res = await generateTicketSummary(id);
      if (res.success) setAiSummaryResult(res.data);
      else setAiSummaryError(res.message || "AI Assistant belum dapat digunakan. Kuota API habis atau konfigurasi belum tersedia.");
    } catch (e) {
      setAiSummaryError("AI Assistant tidak tersedia atau terjadi kesalahan jaringan.");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleSuggestReply = async () => {
    try {
      setAiReplyLoading(true);
      setAiReplyResult(null);
      setAiReplyError(null);
      const res = await generateReplySuggestion(id, aiTone);
      if (res.success) setAiReplyResult(res.data);
      else setAiReplyError(res.message || "AI Assistant belum dapat digunakan. Kuota API habis atau konfigurasi belum tersedia.");
    } catch (e) {
      setAiReplyError("AI Assistant tidak tersedia atau terjadi kesalahan jaringan.");
    } finally {
      setAiReplyLoading(false);
    }
  };

  const applyReply = () => {
    if (aiReplyResult?.reply) {
      setNewComment(aiReplyResult.reply);
      alert("Saran balasan diterapkan.");
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Memuat detail tiket...</div>;
  if (error) return <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">{error}</div>;
  if (!ticket) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Tiket tidak ditemukan</div>;

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
          <Card title="✨ AI Assistant" className="border-t-4 border-t-indigo-500 bg-indigo-50/30">
            <div className="space-y-4">
              <div>
                <Button onClick={handleSummarize} disabled={aiSummaryLoading} className="w-full" variant="secondary">
                  {aiSummaryLoading ? 'Meringkas...' : 'Ringkas Tiket'}
                </Button>
                {aiSummaryError && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-800">
                    <span className="font-semibold mb-1 block">⚠️ Peringatan AI</span>
                    {aiSummaryError}
                  </div>
                )}
                {aiSummaryResult && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 text-sm space-y-2">
                    <p><strong>Ringkasan:</strong> {aiSummaryResult.summary}</p>
                    <p><strong>Prediksi Akar Masalah:</strong> {aiSummaryResult.root_cause_prediction}</p>
                    <p><strong>Rekomendasi Tindakan:</strong> {aiSummaryResult.recommended_next_action}</p>
                    <p><strong>Tingkat Risiko:</strong> <Badge color="amber">{aiSummaryResult.risk_level}</Badge></p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-indigo-100">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tone Balasan</label>
                <select 
                  className="w-full mb-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value)}
                >
                  <option value="professional">Profesional</option>
                  <option value="friendly">Ramah</option>
                  <option value="apologetic">Meminta Maaf</option>
                </select>
                <Button onClick={handleSuggestReply} disabled={aiReplyLoading} className="w-full" variant="secondary">
                  {aiReplyLoading ? 'Membuat Saran...' : 'Rekomendasi Balasan'}
                </Button>
                {aiReplyError && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-800">
                    <span className="font-semibold mb-1 block">⚠️ Peringatan AI</span>
                    {aiReplyError}
                  </div>
                )}
                {aiReplyResult && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 text-sm">
                    <p className="mb-2 text-slate-700 whitespace-pre-wrap">{aiReplyResult.reply}</p>
                    <Button onClick={applyReply} size="sm" className="w-full">Gunakan Draft Ini</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

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
