import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Check, 
  Trash2, 
  Smartphone, 
  Layers, 
  RefreshCw, 
  DollarSign, 
  Send 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';
import { UpiQrModal } from '../components/Groups/UpiQrModal';
import { AddGroupExpenseModal } from '../components/Groups/AddGroupExpenseModal';
import { CountUp } from '../components/UI/CountUp';
import { FlowingSparkline } from '../components/UI/FlowingSparkline';

export const GroupSplitPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'settlements'

  // Modals
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [upiQrModalOpen, setUpiQrModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newMembers, setNewMembers] = useState([
    { name: 'Me', email: '', upiId: '' },
    { name: '', email: '', upiId: '' },
  ]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/groups');
      const groupList = res.groups || [];
      setGroups(groupList);
      if (groupList.length > 0 && !selectedGroup) {
        setSelectedGroup(groupList[0]._id);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (id) => {
    if (!id) return;
    try {
      const res = await apiFetch(`/groups/${id}`);
      setGroupDetails(res);
    } catch (err) {
      console.error('Failed to load group details:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails(selectedGroup);
    }
  }, [selectedGroup]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const validMembers = newMembers.filter((m) => m.name.trim().length > 0);
    if (validMembers.length < 2) {
      alert('Please provide at least 2 members for the group.');
      return;
    }

    try {
      setCreatingGroup(true);
      const res = await apiFetch('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          members: validMembers,
        }),
      });

      setCreateGroupModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewMembers([
        { name: 'Me', email: '', upiId: '' },
        { name: '', email: '', upiId: '' },
      ]);
      await fetchGroups();
      setSelectedGroup(res.group._id);
    } catch (err) {
      console.error('Group creation failed:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAddMemberRow = () => {
    setNewMembers([...newMembers, { name: '', email: '', upiId: '' }]);
  };

  const handleMemberChange = (idx, field, val) => {
    const updated = [...newMembers];
    updated[idx][field] = val;
    setNewMembers(updated);
  };

  const handleSaveGroupExpense = async (expenseData) => {
    if (!selectedGroup) return;
    await apiFetch(`/groups/${selectedGroup}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    await fetchGroupDetails(selectedGroup);
    await fetchGroups();
  };

  const handleDeleteGroupExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this group expense?')) return;
    await apiFetch(`/groups/${selectedGroup}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    await fetchGroupDetails(selectedGroup);
    await fetchGroups();
  };

  const handleRecordSettlement = async (settlementData) => {
    if (!selectedGroup) return;
    await apiFetch(`/groups/${selectedGroup}/settle`, {
      method: 'POST',
      body: JSON.stringify(settlementData),
    });
    await fetchGroupDetails(selectedGroup);
    await fetchGroups();
  };

  const currentGroupData = groupDetails?.group;
  const memberBalances = groupDetails?.memberBalances || [];
  const simplifiedTransfers = groupDetails?.simplifiedTransfers || [];
  const totalGroupSpend = groupDetails?.totalGroupSpend || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Group Selector Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
              <Users size={12} /> Social Ledgers
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>• Minimum Cash Flow Engine</span>
          </div>
          <h1 className="display-xl">Group Bill Splitting & UPI</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
            Split trip and household bills with equal, exact, or percent splits and settle instantly with QR codes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {groups.length > 0 && (
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#0F1420',
                border: '1px solid rgba(0, 255, 135, 0.35)',
                color: '#00FF87',
                fontSize: '13.5px',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.memberCount} members)
                </option>
              ))}
            </select>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCreateGroupModalOpen(true)}
            className="btn-glass-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <Plus size={15} /> + New Group
          </motion.button>

          {selectedGroup && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAddExpenseModalOpen(true)}
              className="btn-primary-mint"
              style={{ padding: '10px 18px', fontSize: '13.5px' }}
            >
              <Plus size={16} /> Add Group Expense
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00FF87' }} />
          <div>Loading group ledgers & debt matrix...</div>
        </div>
      ) : groups.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: '24px',
            border: '1px dashed rgba(0, 255, 135, 0.3)',
          }}
        >
          <Users size={48} color="#00FF87" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 className="heading-lg" style={{ color: '#F1F5F9' }}>
            No Expense Groups Yet
          </h3>
          <p style={{ color: '#94A3B8', maxWidth: '440px', margin: '8px auto 20px', fontSize: '14px' }}>
            Create a group for your flatmates, vacation trips, or team lunches to split expenses automatically with UPI settlements.
          </p>
          <button
            onClick={() => setCreateGroupModalOpen(true)}
            className="btn-primary-mint"
            style={{ padding: '12px 24px' }}
          >
            <Plus size={16} /> Create Your First Group
          </button>
        </div>
      ) : (
        <>
          {/* 1. Group Top Summary Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '20px' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Total Group Spend</div>
              <div
                className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                style={{ fontSize: '28px', fontWeight: 800, color: '#F1F5F9', marginTop: '4px' }}
              >
                <CountUp value={totalGroupSpend} prefix="₹" />
              </div>
              <div style={{ marginTop: '8px' }}>
                <FlowingSparkline data={[15, 18, 22, 26, 25, 30, 28, 34]} color="#F1F5F9" height={24} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                {currentGroupData?.expenses?.length || 0} total transactions logged
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '20px' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Group Members</div>
              <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#00FF87', marginTop: '4px' }}>
                <CountUp value={currentGroupData?.members?.length || 0} suffix=" People" />
              </div>
              <div style={{ marginTop: '8px' }}>
                <FlowingSparkline data={[10, 14, 18, 20, 24, 28, 30, 32]} color="#00FF87" height={24} />
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                {currentGroupData?.members?.map(m => m.name).join(', ')}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-card glass-card-hover-border"
              style={{ padding: '20px' }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Simplified Settlements</div>
              <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: simplifiedTransfers.length > 0 ? '#FFD700' : '#00FF87', marginTop: '4px' }}>
                {simplifiedTransfers.length === 0 ? 'All Settled Up ✓' : `${simplifiedTransfers.length} Pending`}
              </div>
              <div style={{ marginTop: '8px' }}>
                <FlowingSparkline data={[24, 20, 16, 12, 8, 4, 2, 0]} color={simplifiedTransfers.length > 0 ? '#FFD700' : '#00FF87'} height={24} />
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                Reduced to minimum {simplifiedTransfers.length} transactions
              </div>
            </motion.div>
          </div>

          {/* 2. Minimum Cash Flow Graph Simplification Cards */}
          {simplifiedTransfers.length > 0 && (
            <div
              className="glass-card"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(16, 26, 46, 0.9) 0%, rgba(10, 14, 24, 0.95) 100%)',
                border: '1.5px solid rgba(0, 255, 135, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={18} color="#00FF87" />
                  <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
                    Minimum Cash Flow Settlements (1-Click UPI QR)
                  </h3>
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Optimized Graph Reduction
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {simplifiedTransfers.map((t, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', color: '#F1F5F9' }}>
                        <strong style={{ color: '#FF7D7D' }}>{t.from}</strong> owes <strong style={{ color: '#00FF87' }}>{t.to}</strong>
                      </div>
                      <div
                        className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                        style={{ fontSize: '20px', fontWeight: 800, color: '#00FF87', marginTop: '2px' }}
                      >
                        ₹{t.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTransfer(t);
                        setUpiQrModalOpen(true);
                      }}
                      className="btn-primary-mint"
                      style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <QrCode size={14} />
                      <span>Pay UPI</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Group Expenses & Settlements Ledger */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('expenses')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'expenses' ? 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)' : 'rgba(255, 255, 255, 0.04)',
                    color: activeTab === 'expenses' ? '#050810' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Expenses ({currentGroupData?.expenses?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('settlements')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'settlements' ? 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)' : 'rgba(255, 255, 255, 0.04)',
                    color: activeTab === 'settlements' ? '#050810' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Settlement History ({currentGroupData?.settlements?.length || 0})
                </button>
              </div>

              <button
                onClick={() => setAddExpenseModalOpen(true)}
                className="btn-glass-secondary"
                style={{ fontSize: '12.5px', padding: '7px 14px' }}
              >
                <Plus size={14} /> Add Expense
              </button>
            </div>

            {activeTab === 'expenses' ? (
              (!currentGroupData?.expenses || currentGroupData.expenses.length === 0) ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                  No expenses recorded in this group yet. Click <strong>+ Add Expense</strong> to start splitting!
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '12px' }}>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Description</th>
                        <th style={{ padding: '10px' }}>Paid By</th>
                        <th style={{ padding: '10px' }}>Split Details</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGroupData.expenses.map((exp) => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 10px', color: '#94A3B8' }}>
                            {new Date(exp.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: 600, color: '#F1F5F9' }}>
                            {exp.description}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#00FF87', fontWeight: 600 }}>
                            {exp.paidBy}
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {(exp.splits || []).map((s) => (
                                <span
                                  key={s.memberName}
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#94A3B8',
                                  }}
                                >
                                  {s.memberName}: ₹{s.amount}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td
                            className={isPrivacyMaskActive ? 'privacy-masked' : ''}
                            style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-display)' }}
                          >
                            ₹{exp.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteGroupExpense(exp._id)}
                              style={{ color: '#FF7D7D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                              title="Delete expense"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Settlements Tab */
              (!currentGroupData?.settlements || currentGroupData.settlements.length === 0) ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                  No payments settled in this group yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '12px' }}>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>From</th>
                        <th style={{ padding: '10px' }}>To</th>
                        <th style={{ padding: '10px' }}>Method</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGroupData.settlements.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 10px', color: '#94A3B8' }}>
                            {new Date(s.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 10px', color: '#FF7D7D', fontWeight: 600 }}>{s.fromMember}</td>
                          <td style={{ padding: '12px 10px', color: '#00FF87', fontWeight: 600 }}>{s.toMember}</td>
                          <td style={{ padding: '12px 10px', color: '#94A3B8' }}>{s.method}</td>
                          <td
                            className={isPrivacyMaskActive ? 'privacy-masked' : ''}
                            style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 800, color: '#00FF87', fontFamily: 'var(--font-display)' }}
                          >
                            ₹{s.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <UpiQrModal
        isOpen={upiQrModalOpen}
        onClose={() => setUpiQrModalOpen(false)}
        transfer={selectedTransfer}
        onSettleConfirm={handleRecordSettlement}
      />

      <AddGroupExpenseModal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        group={currentGroupData}
        onSaveExpense={handleSaveGroupExpense}
      />

      {/* Create New Group Modal */}
      {createGroupModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#0F1420',
              border: '1.5px solid rgba(0, 255, 135, 0.3)',
              borderRadius: '24px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
              Create New Expense Group
            </h3>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Group Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Goa Trip 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Group Members (Name & Optional UPI ID)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {newMembers.map((m, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder={`Member ${idx + 1} Name`}
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        required={idx < 2}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '13px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="UPI ID (e.g. name@upi)"
                        value={m.upiId}
                        onChange={(e) => handleMemberChange(idx, 'upiId', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#00FF87',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddMemberRow}
                  style={{
                    color: '#00FF87',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginTop: '6px',
                  }}
                >
                  + Add Another Member
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateGroupModalOpen(false)}
                  className="btn-glass-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="btn-primary-mint"
                  style={{ padding: '8px 20px' }}
                >
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
