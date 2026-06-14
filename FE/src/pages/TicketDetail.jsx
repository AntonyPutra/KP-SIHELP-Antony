import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, getComments, createComment, updateTicketStatus, assignTicket } from '../services/ticketService';
import { getUsers } from '../services/userService';
import { generateTicketSummary, generateReplySuggestion } from '../services/aiService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { Sparkles, MessageSquare, Send, ArrowLeft, Clock, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      alert("Saran balasan diterapkan ke kolom komentar.");
    }
  };

  if (loading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center text-blue-600 font-medium">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <span className="tracking-wide">Memuat detail tiket...</span>
    </div>
  );
  if (error) return <div className="flex h-[50vh] items-center justify-center text-rose-500 font-medium">{error}</div>;
  if (!ticket) return <div className="flex h-[50vh] items-center justify-center text-slate-500 font-medium">Tiket tidak ditemukan</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 p-4 rounded-3xl backdrop-blur-md border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white/60 hover:bg-white rounded-2xl shadow-sm text-slate-600 transition-all border border-white/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
              Detail Tiket <span className="text-blue-500 ml-2">#{ticket.id}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Lihat dan tanggapi tiket layanan pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* TICKET DETAILS CARD */}
          <Card className="animate-slide-up border-t-4 border-t-blue-500 overflow-hidden relative" noPadding>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-[80px] pointer-events-none -z-10"></div>
            
            <div className="p-6 sm:p-8 border-b border-white/40">
              <div className="mb-6 flex flex-wrap gap-2">
                <Badge color="slate">{ticket.category?.name}</Badge>
                <Badge color={ticket.priority === 'High' ? 'orange' : ticket.priority === 'Critical' ? 'rose' : ticket.priority === 'Medium' ? 'blue' : 'slate'}>{ticket.priority}</Badge>
                <Badge color={ticket.status === 'Open' ? 'blue' : ticket.status === 'Selesai' ? 'emerald' : ticket.status === 'Ditolak' ? 'rose' : 'amber'}>
                  {ticket.status}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">{ticket.title}</h2>
              <div className="bg-white/50 backdrop-blur p-6 rounded-2xl text-slate-700 whitespace-pre-wrap border border-white/60 shadow-inner text-sm leading-relaxed">
                {ticket.description}
              </div>
            </div>
            
            <div className="bg-slate-50/50 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-slate-700 mr-1">Pelapor:</span> {ticket.user?.name}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                {new Date(ticket.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
            </div>
          </Card>

          {/* DISCUSSION CARD */}
          <Card title={<span className="flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Diskusi & Tanggapan</span>} className="animate-slide-up delay-100">
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map(c => {
                const isStaff = c.user?.role_id === 1 || c.user?.role_id === 2;
                return (
                  <div key={c.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm border ${
                      isStaff 
                        ? 'bg-blue-50/80 border-blue-100 rounded-tr-sm' 
                        : 'bg-white/80 border-slate-100 rounded-tl-sm'
                    }`}>
                      <div className="flex justify-between items-center mb-2 gap-4">
                        <span className={`font-bold text-sm ${isStaff ? 'text-blue-900' : 'text-slate-800'}`}>
                          {c.user?.name} {isStaff && <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1">Staff</span>}
                        </span>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{new Date(c.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                      </div>
                        <p className={`text-sm leading-relaxed ${isStaff ? 'text-blue-900/80' : 'text-slate-600'}`}>{c.comment}</p>
                    </div>
                  </div>
                );
              })}
              {comments.length === 0 && (
                <div className="text-center py-10 text-slate-400 bg-white/40 rounded-2xl border border-white/60 shadow-inner">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Belum ada diskusi.</p>
                  <p className="text-xs mt-1">Kirim pesan pertama untuk memulai percakapan.</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleComment} className="relative mt-2">
              <textarea 
                className="glass-input w-full rounded-2xl pl-4 pr-14 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none min-h-[100px]"
                placeholder="Ketik tanggapan Anda di sini..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <div className="absolute bottom-3 right-3">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim()} 
                  className={`!rounded-xl !p-2 transition-all ${newComment.trim() ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* SIDEBAR ACTIONS */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          
          {/* AI ASSISTANT CARD */}
          <Card 
            title={<span className="flex items-center font-bold text-slate-800"><Sparkles className="w-5 h-5 mr-2 text-cyan-500" /> AI Assistant</span>} 
            className="animate-slide-up delay-200 border-t-4 border-t-cyan-500 bg-gradient-to-br from-blue-50/40 to-cyan-50/30"
          >
            <div className="space-y-6">
              
              {/* Summary Section */}
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-xl pointer-events-none"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Analisis Cerdas
                </h3>
                <Button onClick={handleSummarize} disabled={aiSummaryLoading} className="w-full bg-white text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all shadow-sm">
                  {aiSummaryLoading ? <span className="flex items-center"><div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mr-2"></div> Menganalisis...</span> : 'Ringkas & Analisis Tiket'}
                </Button>
                
                {aiSummaryError && (
                  <div className="mt-4 p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-sm text-rose-700 animate-fade-in flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <span className="leading-tight">{aiSummaryError}</span>
                  </div>
                )}
                
                {aiSummaryResult && (
                  <div className="mt-4 p-4 bg-white/80 rounded-xl border border-blue-100 text-sm space-y-3 shadow-inner animate-slide-down">
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">Ringkasan</span>
                      <p className="text-slate-700 leading-snug">{aiSummaryResult.summary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">Prediksi Akar Masalah</span>
                      <p className="text-slate-700 leading-snug">{aiSummaryResult.root_cause_prediction}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-0.5">Rekomendasi Tindakan</span>
                      <p className="text-slate-700 leading-snug">{aiSummaryResult.recommended_next_action}</p>
                    </div>
                    <div className="pt-1">
                      <Badge color={aiSummaryResult.risk_level === 'Tinggi' ? 'red' : aiSummaryResult.risk_level === 'Sedang' ? 'amber' : 'blue'}>
                        Risiko {aiSummaryResult.risk_level}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reply Section */}
              <div className="bg-white/70 p-4 rounded-2xl border border-blue-100 shadow-sm relative overflow-visible z-10">
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-3 flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" /> Balasan Otomatis
                </h3>
                <div className="mb-3 relative">
                  <Select
                    options={[
                      { value: 'professional', label: 'Gaya Bahasa: Profesional' },
                      { value: 'friendly', label: 'Gaya Bahasa: Ramah' },
                      { value: 'apologetic', label: 'Gaya Bahasa: Meminta Maaf' }
                    ]}
                    value={aiTone}
                    onChange={e => setAiTone(e.target.value)}
                  />
                </div>
                <Button onClick={handleSuggestReply} disabled={aiReplyLoading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20 border-none hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {aiReplyLoading ? <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Menyusun...</span> : 'Buat Draft Balasan'}
                </Button>
                
                {aiReplyError && (
                  <div className="mt-4 p-3 bg-rose-50/80 rounded-xl border border-rose-200 text-sm text-rose-700 animate-fade-in flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    <span className="leading-tight">{aiReplyError}</span>
                  </div>
                )}
                
                {aiReplyResult && (
                  <div className="mt-4 p-4 bg-white/90 rounded-xl border border-blue-100 shadow-inner animate-slide-down">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-blue-200 text-2xl">"</div>
                      <p className="mb-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed relative z-10 pl-2">{aiReplyResult.reply}</p>
                    </div>
                    <Button onClick={applyReply} size="sm" className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-none font-bold">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Gunakan Draft Ini
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ACTION CARD */}
          <Card title="Tindakan Administratif" className="animate-slide-up delay-300">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ubah Status Tiket</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Open')} className="!justify-start text-blue-600 border-blue-200 hover:bg-blue-50">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Open
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Diproses')} className="!justify-start text-amber-600 border-amber-200 hover:bg-amber-50">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div> Proses
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Selesai')} className="!justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Selesai
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleStatusChange('Ditolak')} className="!justify-start text-rose-600 border-rose-200 hover:bg-rose-50">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div> Tolak
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-white/50">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Penugasan Petugas</label>
                <div className="flex flex-col gap-3">
                  <Select
                    placeholder="Pilih Petugas yang Bertanggungjawab..."
                    options={users.map(u => ({ value: u.id, label: `${u.name} — ${u.role_id === 1 ? 'Admin' : 'Petugas'}` }))}
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                  />
                  <Button onClick={handleAssign} className="w-full" disabled={!assigneeId}>Tugaskan Sekarang</Button>
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
