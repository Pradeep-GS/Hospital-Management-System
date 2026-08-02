import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, KeyRound, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [gender, setGender] = useState('MALE');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  const [newPassword, setNewPassword] = useState('12345');
  const [resetMsg, setResetMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await api.get('/hospitals/staff');
      setStaff(res.data.staff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('DOCTOR');
    setDepartment('General Practice');
    setDesignation('Resident Doctor');
    setGender('MALE');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (member) => {
    setSelectedStaff(member);
    setFullName(member.fullName);
    setEmail(member.email);
    setPhone(member.phone || '');
    setRole(member.role);
    setDepartment(member.department || '');
    setDesignation(member.designation || '');
    setGender(member.gender || 'MALE');
    setJoiningDate(member.joiningDate ? new Date(member.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleSubmitEmployee = async (e) => {
    e.preventDefault();
    setActionMsg('');

    try {
      if (selectedStaff) {
        // Edit existing staff
        await api.put(`/hospitals/staff/${selectedStaff._id}`, {
          fullName, phone, department, designation
        });
        setActionMsg('✅ Employee profile updated successfully.');
      } else {
        // Add new staff
        await api.post('/hospitals/staff/add', {
          fullName, email, phone, role, department, designation, gender, joiningDate
        });
        setActionMsg('🎉 New Employee created! Default password assigned: 12345.');
      }

      setTimeout(() => {
        setShowAddModal(false);
        setActionMsg('');
        fetchStaff();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save employee.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedStaff || !newPassword) return;

    try {
      await api.post(`/hospitals/staff/${selectedStaff._id}/reset-password`, { newPassword });
      setResetMsg(`✅ Password reset to "${newPassword}". User must change it on next login.`);
      setTimeout(() => {
        setShowResetModal(false);
        setResetMsg('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Password reset failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;
    try {
      await api.delete(`/hospitals/staff/${id}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Deletion failed.');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/hospitals/staff/${id}`, { isActive: !currentStatus });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Status change failed.');
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || (s.employeeId && s.employeeId.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = filterRole ? s.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Staff Directory...</div>;

  return (
    <div className="space-y-6 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header Bar */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Hospital Staff Management Portal
          </h3>
          <p className="text-xs text-slate-400">Register, manage, and audit employee accounts belonging strictly to your facility</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Name or Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-semibold">Filter Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
          >
            <option value="">All Employee Roles</option>
            <option value="DOCTOR">Doctors</option>
            <option value="NURSE">Nurses</option>
            <option value="RECEPTIONIST">Receptionists</option>
            <option value="PHARMACY">Pharmacists</option>
            <option value="LAB_TECH">Lab Technicians</option>
            <option value="STAFF">Cleaners / Drivers / Security / Staff</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-panel p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3">Employee ID</th>
                <th className="pb-3">Full Name</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Joining Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member._id} className="border-b border-slate-900/60 hover:bg-slate-900/20 text-slate-300">
                  <td className="py-4 font-mono font-bold text-teal-400">{member.employeeId || 'EMP-STAFF'}</td>
                  <td className="py-4 font-bold text-white">{member.fullName}</td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-extrabold text-[10px]">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400">{member.department || 'General'}</td>
                  <td className="py-4 font-mono text-slate-400">
                    {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      member.isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-900' : 'bg-rose-950 text-rose-300 border border-rose-900'
                    }`}>
                      {member.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedStaff(member);
                        setShowViewModal(true);
                      }}
                      className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 bg-slate-850 hover:bg-slate-800 text-blue-400 rounded"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleStatus(member._id, member.isActive)}
                      className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded font-semibold text-[10px]"
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStaff(member);
                        setNewPassword('12345');
                        setShowResetModal(true);
                      }}
                      className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-teal-400 rounded font-semibold text-[10px] inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Reset
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="p-1.5 bg-slate-850 hover:bg-slate-800 text-rose-400 rounded"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No employee records match the selected filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {selectedStaff ? `Edit Employee (${selectedStaff.employeeId || 'ID'})` : 'Register New Facility Employee'}
            </h3>

            {actionMsg && (
              <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{actionMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEmployee} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" required placeholder="Dr. Alice Smith" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Email (Login ID)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!selectedStaff} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white disabled:opacity-50" required placeholder="alice@hospital.org" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} disabled={!!selectedStaff} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white disabled:opacity-50">
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACY">Pharmacist</option>
                    <option value="LAB_TECH">Lab Technician</option>
                    <option value="STAFF">Cleaner / Security / Driver / Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Department</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="Cardiology / Pharmacy / Ward" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white" placeholder="+1-555-0100" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Date of Joining</label>
                  <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono" />
                </div>
              </div>

              {!selectedStaff && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
                  <span className="font-bold block">Security Note:</span>
                  Default login password set to <strong className="font-mono text-amber-300">12345</strong>. The employee will be prompted to change password on first login.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold">{selectedStaff ? 'Save Changes' : 'Register Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Profile Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Employee Detail View</h3>
            <div className="space-y-2 text-xs">
              <div><span className="text-slate-500 block">Full Name</span><span className="text-white font-bold">{selectedStaff.fullName}</span></div>
              <div><span className="text-slate-500 block">Employee ID</span><span className="text-teal-400 font-mono font-bold">{selectedStaff.employeeId || 'N/A'}</span></div>
              <div><span className="text-slate-500 block">Role & Department</span><span className="text-slate-300">{selectedStaff.role} ({selectedStaff.department || 'General'})</span></div>
              <div><span className="text-slate-500 block">Email Address</span><span className="text-slate-300 font-mono">{selectedStaff.email}</span></div>
              <div><span className="text-slate-500 block">Phone</span><span className="text-slate-300 font-mono">{selectedStaff.phone || 'N/A'}</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">Close View</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reset Credentials for {selectedStaff.fullName}</h3>
            
            {resetMsg && (
              <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 p-2.5 rounded-xl">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">Set Password (Default: 12345)</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowResetModal(false)} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold">Set & Force Reset</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffManagement;
