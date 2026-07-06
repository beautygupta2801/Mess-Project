import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  User,
  Search,
  X,
} from "lucide-react";

const AddBillPage = () => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    chargeType: "extras",
    amount: "",
    description: "",
    applyToAll: true,
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch students when switching to individual mode
  useEffect(() => {
    if (!formData.applyToAll && students.length === 0) {
      fetchStudents();
    }
  }, [formData.applyToAll]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "http://localhost:5000/api/munshi/all-students",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.message || "Failed to load students");
      }
    } catch (err) {
      setError("Failed to load students");
      console.error("Error fetching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roomNo.toString().includes(searchTerm),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid price greater than 0");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      setError("Please enter an item name");
      return;
    }

    if (!formData.applyToAll && selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        chargeType: formData.chargeType,
        amount: parseFloat(formData.amount),
        description: formData.description,
      };

      if (!formData.applyToAll) {
        payload.studentIds = selectedStudents;
      }

      const response = await fetch(
        "http://localhost:5000/api/munshi/bill/add-charge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add bill charge");
      }

      setSuccess(
        `Successfully added ${formData.chargeType} charge of ₹${formData.amount} to ${data.data.studentsAffected} student(s)`,
      );

      // Reset form
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        chargeType: "extras",
        amount: "",
        description: "",
        applyToAll: true,
      });
      setSelectedStudents([]);
      setSearchTerm("");
    } catch (err) {
      setError(err.message || "Failed to add bill charge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <DollarSign size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Add Bill Charge
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Add fines or extra charges to students in your hostel
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle
              className="text-rose-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-rose-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle
              className="text-emerald-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <p className="text-emerald-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Apply To Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Users size={16} className="inline mr-2" />
              Apply To
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, applyToAll: true }))
                }
                className={`px-6 py-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                  formData.applyToAll
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <Users size={20} />
                All Students
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, applyToAll: false }))
                }
                className={`px-6 py-4 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                  !formData.applyToAll
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <User size={20} />
                Select Students
              </button>
            </div>
          </div>

          {/* Student Selection (only show if not applying to all) */}
          {!formData.applyToAll && (
            <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700">
                  Select Students ({selectedStudents.length} selected)
                </h3>
                {selectedStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudents([])}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, roll no, or room..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-slate-700"
                />
              </div>

              {/* Student List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loadingStudents ? (
                  <div className="text-center py-8 text-slate-500">
                    Loading students...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No students found
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <label
                      key={student._id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selectedStudents.includes(student._id)
                          ? "bg-indigo-50 border-2 border-indigo-200"
                          : "bg-white border-2 border-slate-100 hover:border-indigo-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudent(student._id)}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.rollNo} • Room {student.roomNo}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Month and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Month
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-slate-700"
                required
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2020"
                max="2099"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-slate-700"
                required
              />
            </div>
          </div>

          {/* Charge Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Charge Type
            </label>
            <div className="grid grid-cols-2 gap-4">
               <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, chargeType: 'extras' }))}
                className={`px-4 py-3 rounded-xl font-bold border-2 transition-all ${
                  formData.chargeType === 'extras'
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                Extras
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, chargeType: 'fines' }))}
                className={`px-4 py-3 rounded-xl font-bold border-2 transition-all ${
                  formData.chargeType === 'fines'
                    ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200"
                    : "bg-white text-slate-600 border-slate-200 hover:border-rose-200 hover:bg-rose-50"
                }`}
              >
                Fine
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <DollarSign size={16} className="inline mr-2" />
              Price (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter price"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-slate-700"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Item Name
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter item name "
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-slate-700 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding Charge...
              </>
            ) : (
              <>
                <DollarSign size={20} className="stroke-[2.5]" />
                {formData.applyToAll
                  ? "Add Charge to All Students"
                  : `Add Charge to ${selectedStudents.length} Student(s)`}
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <p className="text-blue-700 text-sm font-medium">
            <strong>Note:</strong>{" "}
            {formData.applyToAll
              ? "This charge will be applied to all active students in your hostel for the selected month."
              : "This charge will be applied only to the selected students for the selected month."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddBillPage;
