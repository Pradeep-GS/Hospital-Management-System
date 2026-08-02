import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit2, KeyRound, Trash2, Eye, CheckCircle2, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

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

  const fetchStaff = async () => {
    try {
      const res = await api.get('/hospitals/staff');
      setStaff(res.data.staff || []);
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
    setDepartment('General Medicine');
    setDesignation('Senior Resident');
    setGender('MALE');
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedStaff(emp);
    setFullName(emp.fullName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setRole(emp.role || 'DOCTOR');
    setDepartment(emp.department || '');
    setDesignation(emp.designation || '');
    setGender(emp.gender || 'MALE');
    setShowAddModal(true);
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    try {
      if (selectedStaff) {
        await api.put(`/hospitals/staff/${selectedStaff._id}`, {
          fullName, email, phone, role, department, designation, gender
        });
        toast.success(`Employee ${fullName} updated successfully!`);
      } else {
        const res = await api.post('/hospitals/staff/add', {
          fullName, email, phone, role, department, designation, gender, joiningDate
        });
        toast.success(`Employee ${fullName} added! Emp ID: ${res.data.employeeId}`);
      }
      setShowAddModal(false);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Staff creation failed.');
      toast.error(err.response?.data?.error || 'Staff creation failed.');
    }
  };

  const handleToggleStatus = async (emp) => {
    try {
      const res = await api.patch(`/hospitals/staff/${emp._id}/status`);
      toast.success(res.data.message || 'Status updated');
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await api.post(`/hospitals/staff/${selectedStaff._id}/reset-password`, {
        newPassword
      });
      setResetMsg(`✅ Password reset successfully to "${newPassword}". Mandatory change on next login.`);
      toast.success(`Password reset to "${newPassword}"!`);
      setTimeout(() => {
        setShowResetModal(false);
        setResetMsg('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Password reset failed.');
    }
  };

  const filteredStaff = staff.filter((emp) => {
    const matchesSearch =
      emp.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole ? emp.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Hospital Staff Directory...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 font-['Inter',sans-serif]"
    >
      <Helmet>
        <title>Staff Management | AegisCare ERP</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Poppins',sans-serif]">
            <Users className="w-5 h-5 text-blue-600" /> Hospital Staff Management Module
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage internal hospital employees, roles, status, credentials & password resets</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Hospital Employee
        </button>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Employee ID, Name, or Email..."
            className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-slate-600 font-semibold text-xs whitespace-nowrap">Filter Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="">All Roles</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="RECEPTIONIST">Receptionist</option>
            <option value="PHARMACY">Pharmacist</option>
            <option value="LAB_TECHNICIAN">Lab Tech</option>
            <option value="CLEANER">Cleaner</option>
            <option value="SECURITY">Security</option>
            <option value="DRIVER">Driver</option>
            <option value="OTHER">Other Employee</option>
          </select>
        </div>
      </div>

      {/* Enterprise Staff Table with Sticky Header & Hover Effects */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-700 uppercase tracking-wider font-bold sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="p-4">Emp ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Email / Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((emp) => (
                <tr key={emp._id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">{emp.employeeId || 'EMP-000'}</td>
                  <td className="p-4 font-bold text-slate-900">{emp.fullName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{emp.department || 'General'}</td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{emp.email}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(emp)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        emp.isActive
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200'
                      }`}
                    >
                      {emp.isActive ? 'Active' : 'Deactivated'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setSelectedStaff(emp); setShowResetModal(true); }}
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-colors"
                        title="Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No employee records match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Poppins',sans-serif]">
              {selectedStaff ? `Edit Employee ${selectedStaff.employeeId}` : 'Add New Hospital Employee'}
            </h3>
            <form onSubmit={handleSubmitStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  required
                  placeholder="Dr. Gregory House"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address (Login ID)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    required
                    placeholder="house@metrohospital.org"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    required
                    placeholder="+1-555-0101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACY">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Tech</option>
                    <option value="CLEANER">Cleaner</option>
                    <option value="SECURITY">Security</option>
                    <option value="DRIVER">Driver</option>
                    <option value="OTHER">Other Employee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    placeholder="Internal Medicine"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                    placeholder="Chief Diagnostician"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {selectedStaff ? 'Save Changes' : 'Create Employee Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Poppins',sans-serif]">
              Reset Password for {selectedStaff.fullName}
            </h3>

            {resetMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowResetModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default StaffManagement;
