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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ticket #{ticket.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title={ticket.title}>
            <div className="mb-4">
              <Badge color="gray" className="mr-2">{ticket.category?.name}</Badge>
              <Badge color="blue" className="mr-2">{ticket.priority}</Badge>
              <Badge color={ticket.status === 'Open' ? 'blue' : ticket.status === 'Selesai' ? 'green' : 'yellow'}>
                {ticket.status}
              </Badge>
            </div>
            <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Reported by: {ticket.user?.name} on {new Date(ticket.created_at).toLocaleString()}
            </div>
          </Card>

          <Card title="Comments">
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-sm">{c.user?.name}</span>
                    <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{c.comment}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
            </div>
            <form onSubmit={handleComment} className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 shadow border rounded py-2 px-3 text-gray-700 focus:outline-none"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <Button type="submit">Post</Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card title="Actions">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => handleStatusChange('Open')}>Open</Button>
                  <Button variant="secondary" onClick={() => handleStatusChange('Diproses')}>Process</Button>
                  <Button variant="success" onClick={() => handleStatusChange('Selesai')}>Done</Button>
                  <Button variant="danger" onClick={() => handleStatusChange('Ditolak')}>Reject</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign To</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 shadow border rounded py-2 px-3 focus:outline-none"
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                  >
                    <option value="">Select Petugas...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleAssign}>Assign</Button>
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
