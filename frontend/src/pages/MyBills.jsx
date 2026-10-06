import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { fetchBillsApi, updateBillApi, deleteBillApi, payBillApi } from '../services/api';
import { Plus, Edit2, Trash2, CheckCircle2, Calendar, Tag, AlertCircle, X, ShieldAlert } from 'lucide-react';

const CATEGORIES = ['Electricity', 'Internet', 'Mobile', 'OTT', 'Rent', 'EMI', 'Insurance', 'Other'];
const FREQUENCIES = ['Monthly', 'Weekly', 'Yearly', 'One-time'];

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [editingBill, setEditingBill] = useState(null);
  const [deletingBillId, setDeletingBillId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadBills = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchBillsApi();
      setBills(response.data.bills || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt);
  };

  // Mark as Paid Action
  const handleMarkAsPaid = async (billId, billName) => {
    try {
      const response = await payBillApi(billId);
      setSuccessMsg(response.data.message || `Marked "${billName}" as Paid!`);
      loadBills();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process payment.');
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingBillId) return;
    setIsSubmitting(true);
    try {
      await deleteBillApi(deletingBillId);
      setSuccessMsg('Bill deleted successfully!');
      setDeletingBillId(null);
      loadBills();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edit Action
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBill) return;

    if (!editingBill.bill_name.trim() || !editingBill.amount || !editingBill.due_date) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBillApi(editingBill.bill_id, {
        bill_name: editingBill.bill_name.trim(),
        category: editingBill.category,
        amount: parseFloat(editingBill.amount),
        due_date: editingBill.due_date,
        frequency: editingBill.frequency,
        description: editingBill.description || ''
      });

      setSuccessMsg('Bill updated successfully!');
      setEditingBill(null);
      loadBills();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeItem="My Bills" />

        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          
          {/* Header & Add Bill Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                My Bills
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                View, edit, track and mark your recurring bills & subscriptions.
              </p>
            </div>

            <button
              onClick={() => navigate('/add-bill')}
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              <Plus size={18} />
              <span>+ Add New Bill</span>
            </button>
          </div>

          {/* Success / Error Banners */}
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: 24 }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Main Table Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #bae6fd',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)'
          }}>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#0284c7' }}>
                <div className="spinner" style={{ width: 36, height: 36, borderColor: 'rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7', margin: '0 auto 16px' }}></div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Fetching your bills...</p>
              </div>
            ) : bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Plus size={28} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>No Bills Found</h3>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>Start tracking your expenses by adding your first bill.</p>
                <button
                  onClick={() => navigate('/add-bill')}
                  className="btn-primary"
                  style={{ width: 'auto', margin: '0 auto' }}
                >
                  + Add Your First Bill
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px' }}>Bill Name</th>
                      <th style={{ padding: '14px' }}>Category</th>
                      <th style={{ padding: '14px' }}>Amount</th>
                      <th style={{ padding: '14px' }}>Due Date</th>
                      <th style={{ padding: '14px' }}>Frequency</th>
                      <th style={{ padding: '14px' }}>Status</th>
                      <th style={{ padding: '14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => {
                      const name = bill.bill_name || bill.title;
                      const status = bill.status;

                      return (
                        <tr key={bill.bill_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#0f172a' }}>
                          <td style={{ padding: '16px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{name}</div>
                            {bill.description && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{bill.description}</div>}
                          </td>
                          <td style={{ padding: '16px 14px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 500
                            }}>
                              <Tag size={12} color="#0284c7" />
                              {bill.category}
                            </span>
                          </td>
                          <td style={{ padding: '16px 14px', fontWeight: 700, color: '#0284c7' }}>
                            {formatCurrency(bill.amount)}
                          </td>
                          <td style={{ padding: '16px 14px', color: '#64748b', fontSize: 13 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={14} color="#94a3b8" />
                              {bill.due_date}
                            </span>
                          </td>
                          <td style={{ padding: '16px 14px', color: '#64748b', fontSize: 13 }}>
                            {bill.frequency || 'Monthly'}
                          </td>
                          <td style={{ padding: '16px 14px' }}>
                            {status === 'Paid' && (
                              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                                Paid
                              </span>
                            )}
                            {status === 'Pending' && (
                              <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #fde68a' }}>
                                Pending
                              </span>
                            )}
                            {status === 'Overdue' && (
                              <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: '1px solid #fecaca' }}>
                                Overdue
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                              
                              {/* Mark as Paid */}
                              {status !== 'Paid' && (
                                <button
                                  onClick={() => handleMarkAsPaid(bill.bill_id, name)}
                                  title="Mark as Paid"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    backgroundColor: '#16a34a',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Pay</span>
                                </button>
                              )}

                              {/* Edit Action */}
                              <button
                                onClick={() => setEditingBill({ ...bill, bill_name: name })}
                                title="Edit Bill"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#0284c7',
                                  backgroundColor: '#e0f2fe',
                                  border: '1px solid #bae6fd',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>

                              {/* Delete Action */}
                              <button
                                onClick={() => setDeletingBillId(bill.bill_id)}
                                title="Delete Bill"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#dc2626',
                                  backgroundColor: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* EDIT BILL MODAL */}
      {editingBill && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 540,
            padding: 28,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Edit Bill</h3>
              <button onClick={() => setEditingBill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Bill Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 14 }}
                  value={editingBill.bill_name || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, bill_name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={editingBill.category || 'Electricity'}
                    onChange={(e) => setEditingBill({ ...editingBill, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={editingBill.amount || ''}
                    onChange={(e) => setEditingBill({ ...editingBill, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={editingBill.due_date || ''}
                    onChange={(e) => setEditingBill({ ...editingBill, due_date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency *</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={editingBill.frequency || 'Monthly'}
                    onChange={(e) => setEditingBill({ ...editingBill, frequency: e.target.value })}
                  >
                    {FREQUENCIES.map((freq) => <option key={freq} value={freq}>{freq}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ paddingLeft: 14, minHeight: 70 }}
                  value={editingBill.description || ''}
                  onChange={(e) => setEditingBill({ ...editingBill, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '10px 24px' }}
                  disabled={isSubmitting}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingBillId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 420,
            padding: 28,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            border: '1px solid #fecaca',
            textAlign: 'center'
          }}>
            <div style={{
              width: 52,
              height: 52,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <ShieldAlert size={28} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Delete Bill?</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              Are you sure you want to delete this bill? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                onClick={() => setDeletingBillId(null)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', backgroundColor: '#dc2626', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBills;
