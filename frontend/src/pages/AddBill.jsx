import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { addBillApi } from '../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Electricity', 'Internet', 'Mobile', 'OTT', 'Rent', 'EMI', 'Insurance', 'Other'];
const FREQUENCIES = ['Monthly', 'Weekly', 'Yearly', 'One-time'];

const AddBill = () => {
  const [billName, setBillName] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Validations
    if (!billName.trim()) {
      setError('Please enter a Bill Name.');
      return;
    }

    if (!category) {
      setError('Please select a Category.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number greater than 0.');
      return;
    }

    if (!dueDate) {
      setError('Please select a Due Date.');
      return;
    }

    if (!frequency) {
      setError('Please select a Frequency.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addBillApi({
        bill_name: billName.trim(),
        category,
        amount: numAmount,
        due_date: dueDate,
        frequency,
        description: description.trim()
      });

      setSuccessMsg(response.data.message || 'Bill added successfully!');
      setTimeout(() => {
        navigate('/bills');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeItem="Add Bill" />

        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 840, margin: '0 auto', width: '100%' }}>
          
          {/* Header & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Add New Bill
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Enter bill details to automatically track upcoming payments and due dates.
              </p>
            </div>

            <button
              onClick={() => navigate('/bills')}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#0284c7',
                backgroundColor: '#e0f2fe',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Bills</span>
            </button>
          </div>

          {/* Form Container Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 32,
            border: '1px solid #bae6fd',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)'
          }}>

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 24 }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: 24 }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                
                {/* Bill Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bill-name">Bill Name *</label>
                  <input
                    id="bill-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    placeholder="e.g. MSEB Electricity Bill"
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    required
                  />
                </div>

                {/* Category Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bill-category">Category *</label>
                  <select
                    id="bill-category"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bill-amount">Amount (₹) *</label>
                  <input
                    id="bill-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    placeholder="e.g. 1500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Due Date */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bill-due-date">Due Date *</label>
                  <input
                    id="bill-due-date"
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>

                {/* Frequency Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="bill-frequency">Frequency *</label>
                  <select
                    id="bill-frequency"
                    className="form-input"
                    style={{ paddingLeft: 14 }}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    required
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                {/* Description (Optional) */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="bill-desc">Description (Optional)</label>
                  <textarea
                    id="bill-desc"
                    className="form-input"
                    style={{ paddingLeft: 14, minHeight: 90, fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="Add notes or account details (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => navigate('/bills')}
                  style={{
                    padding: '12px 22px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '12px 28px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Saving Bill...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>Save Bill</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddBill;
