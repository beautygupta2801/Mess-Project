import React, { useState, useEffect } from "react";
import { clerkApi } from "./api";
import { 
  LogOut, 
  Download, 
  Users, 
  FileText, 
  Plus, 
  BarChart3, 
  Trash2, 
  Menu, 
  X, 
  Check,
  RotateCw,
  ChevronRight, 
  User, 
  Home,
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  Image as ImageIcon,
  Upload
} from "lucide-react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";

// ==================== UI COMPONENTS ====================
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled,
}) => {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30",
    secondary:
      "bg-white text-slate-700 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && (
        <Icon
          size={20}
          className={
            variant === "primary" || variant === "success" ? "stroke-[2.5]" : ""
          }
        />
      )}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "info" }) => {
  const variants = {
    info: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-orange-50 text-orange-700 border-orange-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default function ClerkDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL, default to 'bill'
  const currentPath = location.pathname.split("/").pop();
  const activeTab = ["students", "menu", "extras", "reports", "bill"].includes(currentPath) ? currentPath : "bill";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${m}`;
  });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [billHistory, setBillHistory] = useState([]);  // NEW: Bill generation history
  const [studentVerificationSearch, setStudentVerificationSearch] = useState('');  // NEW: Search for student verification
  const [downloadingBillId, setDownloadingBillId] = useState(null); // NEW: Track which bill is downloading

  // Fetch bill history when Reports tab is active
  useEffect(() => {
    if (activeTab === "reports") {
      fetchBillHistory();
    }
  }, [activeTab]);

  const fetchBillHistory = async () => {
    setLoading(true);
    try {
      const data = await clerkApi.getBillHistory();
      setBillHistory(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId) => {
  if (!window.confirm("Are you sure you want to delete this bill record? This action cannot be undone.")) return;

  try {
    await clerkApi.deleteBillRecord(billId);  
    setSuccessMessage("Bill record deleted successfully");

    setTimeout(() => setSuccessMessage(""), 3000);

    fetchBillHistory(); // Refresh the list
  } catch (err) {
    setError(err.message);
  }
};

  const handleDownloadHistoricalBill = async (bill) => {
  setDownloadingBillId(bill._id);
  setError(null);

  try {
    let blob, filename;

    if (bill.type === 'monthly') {
      blob = await clerkApi.generateBill(
        bill.month,
        Number(bill.mealRate),
        bill.billItems
      );
      filename = `${hostel}_${bill.month}_Bill.xlsx`;
    } else {
      const fd = bill.fromDate.split('T')[0];
      const td = bill.toDate.split('T')[0];

      blob = await clerkApi.generateBillForDateRange(
        fd,
        td,
        Number(bill.mealRate),
        bill.billItems
      );
      filename = `${hostel}_${fd}_to_${td}_Bill.xlsx`;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    setSuccessMessage("Bill downloaded successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);

  } catch (err) {
    setError("Failed to download bill: " + err.message);
  } finally {
    setDownloadingBillId(null);
  }
};

  // Fetch Extras when tab active
  useEffect(() => {
    if (activeTab === "extras") {
        fetchExtraItems();
    }
  }, [activeTab]);

  const fetchExtraItems = async () => {
    try {
        setLoading(true);
        const items = await clerkApi.getExtraItems();
        setExtraItems(items);
    } catch(err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

 const handleAddExtra = async () => {
  if (!newExtraName || !newExtraPrice) {
    setError("Please enter name and price for the extra item");
    return;
  }

  setLoading(true);
  try {
    await clerkApi.addExtraItem(newExtraName, newExtraPrice);

    setSuccessMessage("Extra item added successfully!");
    setNewExtraName("");
    setNewExtraPrice("");
    setNewExtraCategory("Snacks");
    setNewExtraImageFile(null);
    setNewExtraImagePreview("");

    fetchExtraItems();
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleExtraImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewExtraImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewExtraImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleDeleteExtra = async (id) => {
      if(!window.confirm("Are you sure?")) return;
      try {
          await clerkApi.deleteExtraItem(id);
          setSuccessMessage("Item deleted");
          fetchExtraItems();
          setTimeout(() => setSuccessMessage(""), 3000);
      } catch(err) {
          setError(err.message);
      }
  };


    const fetchAllStudents = async () => {
      try {
        setLoading(true);

        const students = await clerkApi.getAllStudents();

        console.log("Students:", students); // debug

        setAllStudents(students); // ✅ FIX

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  const handleVerifyStudent = async (studentId, action) => {
    try {
        setLoading(true);
        const res = await clerkApi.verifyStudent(studentId, action);
        if (res.success) {
            setSuccessMessage(res.message);
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchAllStudents(); // Refresh list
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };
  const [hostel, setHostel] = useState("");
  const [clerkName, setClerkName] = useState("");
  const [mealRate, setMealRate] = useState("");
  const [billItems, setBillItems] = useState([]);
  const [currentBillName, setCurrentBillName] = useState("");
  const [currentBillAmount, setCurrentBillAmount] = useState("");
  const [selectedStudentsForItem, setSelectedStudentsForItem] = useState([]);  // NEW: Track selected students for current item
  const [showStudentSelector, setShowStudentSelector] = useState(false);  // NEW: Toggle student selector
  const [studentSearchTerm, setStudentSearchTerm] = useState('');  // NEW: Toggle student selector
  
  // Menu State
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const [weeklyMenu, setWeeklyMenu] = useState({}); // { Day: { MealType: [{ name, price, image }] } }
  const [menuImages, setMenuImages] = useState({}); // { "Day-MealType-Index": File }
  
  // Extra Items State
  const [extraItems, setExtraItems] = useState([]);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newExtraCategory, setNewExtraCategory] = useState("Snacks");
  // const [newExtraImage, setNewExtraImage] = useState(""); // Deprecated in favor of file upload
  const [newExtraImageFile, setNewExtraImageFile] = useState(null);
  const [newExtraImagePreview, setNewExtraImagePreview] = useState("");

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("authUser")) || {};
    const storedHostel = localStorage.getItem("hostel");
    const clerk = auth.clerk || {};

    setHostel(storedHostel || clerk.hostel || "Unknown");
    setClerkName(clerk.name || "Clerk");

    if (auth.role !== "clerk") {
      window.location.href = "/login";
      return;
    }
    
    // Initialize menu structure
    const initialMenu = {};
    days.forEach(day => {
        initialMenu[day] = {};
        mealTypes.forEach(type => {
            initialMenu[day][type] = [{ name: "", price: 0, image: "", isAvailable: true }];
        });
    });
    setWeeklyMenu(initialMenu);

    // Fetch existing menu to populate
    fetchCurrentMenu(initialMenu);
    fetchMealRate();

  }, []);

  const fetchCurrentMenu = async (defaultMenu) => {
    try {
      const res = await clerkApi.getMenu();

      const payload = res?.data || res;
      const weeklyMenuFromApi = payload?.weeklyMenu || [];

      const newMenu = JSON.parse(JSON.stringify(defaultMenu));

      weeklyMenuFromApi.forEach((dayEntry) => {
        if (!dayEntry?.day || !newMenu[dayEntry.day]) return;

        mealTypes.forEach((mealType) => {
          const items = Array.isArray(dayEntry[mealType]) ? dayEntry[mealType] : [];

          if (items.length > 0) {
            newMenu[dayEntry.day][mealType] = items.map((item) => ({
              name: item.name || "",
              price: item.price || 0,
              image: item.image || "",
              isAvailable: item.isAvailable !== false,
              existingImage: item.image || "",
            }));
          } else {
            newMenu[dayEntry.day][mealType] = [
              { name: "", price: 0, image: "", isAvailable: true },
            ];
          }
        });
      });

      setWeeklyMenu(newMenu);
    } catch (err) {
      console.error("Failed to load menu", err);
    }
  };

  const handleMenuChange = (day, mealType, field, value) => {
      setWeeklyMenu(prev => ({
          ...prev,
          [day]: {
              ...prev[day],
              [mealType]: [{
                  ...prev[day][mealType][0],
                  [field]: value
              }]
          }
      }));
  };

  const handleImageUpload = (day, mealType, file) => {
      if (file) {
        const key = `${day}-${mealType}-0`;
        setMenuImages(prev => ({ ...prev, [key]: file }));
        
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            handleMenuChange(day, mealType, 'preview', reader.result);
        };
        reader.readAsDataURL(file);
      }
  };

  const saveMenu = async () => {
    setLoading(true);
    try {
      await clerkApi.saveWeeklyMenu(weeklyMenu);
      setSuccessMessage("Weekly menu saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const saveCharges = async () => {
    try {
      setLoading(true);
      await clerkApi.saveMealRate(Number(mealRate));
      setSuccessMessage("Meal rate saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save meal rate");
    } finally {
      setLoading(false);
    }
  };
  const fetchMealRate = async () => {
    try {
      const data = await clerkApi.getMealRate();
      setMealRate(data?.rate || "");
    } catch (err) {
      console.error("Failed to fetch meal rate", err);
    }
  };


  const fetchStudents = async () => {
    setError(null);
    
    // Check if using month or date range
    if (month) {
      // Use month-based API
      setLoading(true);
      try {
        const data = await clerkApi.getStudentsForBill(month);
        setStudents(data);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    } else if (fromDate && toDate) {
      // Use date range API
      if (new Date(fromDate) > new Date(toDate)) return setError("From date must be before to date");
      
      setLoading(true);
      try {
        const data = await clerkApi.getStudentsForDateRange(fromDate, toDate);
        setStudents(data);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Select either a month or a date range");
    }
  };

  const generateBill = async () => {
    setError(null);
    if (!mealRate) return setError("Set meal rate first");
    if (students.length === 0) return setError("Fetch students first");
    
    setLoading(true);
    try {
      let blob, filename;
      
      if (month) {
        // Use month-based API
        blob = await clerkApi.generateBill(month, Number(mealRate), billItems);
        filename = `${hostel}_${month}_Bill.xlsx`;
      } else if (fromDate && toDate) {
        // Use date range API
        blob = await clerkApi.generateBillForDateRange(fromDate, toDate, Number(mealRate), billItems);
        filename = `${hostel}_${fromDate}_to_${toDate}_Bill.xlsx`;
      } else {
        return setError("Select either a month or a date range");
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage("Bill downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addBillItem = () => {
      if (!currentBillName || !currentBillAmount) return setError("Enter bill item name and amount");
      
      const newItem = { 
        id: Date.now(), 
        name: currentBillName, 
        amount: Number(currentBillAmount),
        selectedStudents: selectedStudentsForItem.length > 0 ? selectedStudentsForItem : null  // null means all students
      };
      
      setBillItems([...billItems, newItem]);
      setCurrentBillName("");
      setCurrentBillAmount("");
      setSelectedStudentsForItem([]);
      setShowStudentSelector(false);
      setStudentSearchTerm('');  // Clear search term
  };

  const removeBillItem = (id) => {
      setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const calculateDietTotal = (diet) => Number(diet) * (Number(mealRate) || 0);
  const calculateTotal = (diet, extra, studentId) => {
    let total = calculateDietTotal(diet) + Number(extra || 0);
    billItems.forEach(item => {
      // Only add item amount if student is selected for this item (or no students selected = all students)
      if (!item.selectedStudents || item.selectedStudents.includes(studentId)) {
        total += item.amount;
      }
    });
    return total;
  };

  const grandTotal = students.reduce((sum, s) => sum + calculateTotal(s.diet, s.extra, s.studentId), 0);

  const tabs = [
    { key: "students", label: "Students", icon: Users, path: "/clerk/dashboard/students" },
    { key: "menu", label: "Weekly Menu", icon: UtensilsCrossed, path: "/clerk/dashboard/menu" },
    { key: "extras", label: "Manage Extras", icon: Plus, path: "/clerk/dashboard/extras" },
    { key: "reports", label: "Reports", icon: BarChart3, path: "/clerk/dashboard/reports" },
    { key: "bill", label: "Generate Bill", icon: FileText, path: "/clerk/dashboard/bill" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
       {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <FileText size={20} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Clerk<span className="text-indigo-600">Dash</span>
                </h1>
            </div>
            <button 
                onClick={() => {
                    setSidebarOpen(false);
                    setMobileMenuOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
                <X size={20} />
            </button>
          </div>

          <div className="px-2 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {clerkName ? clerkName.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                  Clerk Profile
                </p>
                <h4 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {clerkName}
                </h4>
                 <div className="flex items-center gap-1.5 mt-1">
                  <Home size={10} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-500 truncate">
                    {hostel || "Hostel"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    navigate(tab.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm relative overflow-hidden group ${isActive ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}
                >
                  <Icon
                    size={20}
                    className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? "stroke-[2.5]" : ""}`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-h-screen relative transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>
         {/* Header */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-5 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:block p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
                <Menu size={24} />
            </button>
            <div className="md:hidden">
                <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
                >
                <Menu size={24} />
                </button>
            </div>
          </div>

          <div className="">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Manage hostel billing and reports
            </p>
          </div>
        </header>

        <div className="p-6 md:p-8 pt-4 pb-24 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center gap-3 font-bold border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          {successMessage && (
             <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center gap-3 font-bold border border-emerald-100 animate-in slide-in-from-top-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          {activeTab === "extras" && (
             <div className="space-y-8">
                {/* Add New Item Card */}
                <Card className="p-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                             <Plus className="w-6 h-6 text-indigo-600"/>
                        </div>
                         <div>
                            <h2 className="text-xl font-bold text-slate-800">
                              Add New Extra Item
                            </h2>
                            <p className="text-slate-500 text-sm">
                              Create items available for purchase
                            </p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
                            <input 
                                type="text" 
                                value={newExtraName} 
                                onChange={(e) => setNewExtraName(e.target.value)}
                                placeholder="e.g. Cold Drink" 
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all font-bold outline-none text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (₹)</label>
                            <input 
                                type="number" 
                                value={newExtraPrice} 
                                onChange={(e) => setNewExtraPrice(e.target.value)}
                                placeholder="0" 
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all font-bold outline-none text-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image</label>
                            <label className="flex items-center gap-2 w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleExtraImageChange}
                                    className="hidden" 
                                />
                                {newExtraImagePreview ? (
                                    <>
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                                            <img src={newExtraImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 truncate flex-1">
                                            {newExtraImageFile ? newExtraImageFile.name : "Image Selected"}
                                        </span>
                                        <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <Check size={16} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors"/>
                                        <span className="text-slate-400 font-bold group-hover:text-indigo-600 transition-colors">Upload Image</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleAddExtra} disabled={loading} variant="primary">
                            <Plus size={18} /> Add Item
                        </Button>
                    </div>
                </Card>

                {/* List of Extras */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Active Extra Items</h3>
                    
                    {extraItems.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                            No extra items added yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {extraItems.map((item) => (
                                <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 relative">
                                        {item.image ? (
                                            <img 
                                                src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                                    e.target.parentElement.innerHTML = '<span class="text-2xl">🍔</span>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-0.5">{item.category}</p>
                                        <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                                        <p className="font-black text-slate-900">₹{item.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteExtra(item._id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === "bill" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                             <FileText className="w-6 h-6 text-indigo-600"/>
                        </div>
                         <div>
                            <h2 className="text-xl font-bold text-slate-800">
                              Bill Settings
                            </h2>
                            <p className="text-slate-500 text-sm">
                              Set rates and select month
                            </p>
                         </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meal Rate (₹)</label>
                            <div className="flex gap-4">
                                <input 
                                    type="number" 
                                    value={mealRate} 
                                    onChange={(e) => setMealRate(e.target.value)} 
                                    placeholder="" 
                                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                                <Button onClick={saveCharges} disabled={loading}>
                                    Save
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
                            <input 
                                type="month" 
                                value={month} 
                                onChange={(e) => {
                                    setMonth(e.target.value);
                                    setFromDate("");
                                    setToDate("");
                                }} 
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                            />
                        </div>

                        <div className="flex items-center gap-3 my-2">
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">OR</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
                                <input 
                                    type="date" 
                                    value={fromDate} 
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setMonth("");
                                    }} 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
                                <input 
                                    type="date" 
                                    value={toDate} 
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setMonth("");
                                    }} 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <Button 
                                onClick={fetchStudents} 
                                disabled={loading || (!month && (!fromDate || !toDate))}
                                variant="primary"
                                className="w-full py-3"
                            >
                                {loading ? "Fetching..." : "Fetch Students"}
                            </Button>
                        </div>
                    </div>
                 </Card>

                 <Card className="p-8 flex flex-col justify-center">
                    <div className="w-full space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                             <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                <Plus size={20} />
                             </div>
                             <h3 className="text-lg font-bold text-slate-800">Add Bill Item</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
                                <input 
                                    type="text" 
                                    value={currentBillName} 
                                    onChange={(e) => setCurrentBillName(e.target.value)} 
                                    placeholder="e.g. Electricity" 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={currentBillAmount} 
                                    onChange={(e) => setCurrentBillAmount(e.target.value)} 
                                    placeholder="0" 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Student Selection Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Apply To</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStudentSelector(false);
                                        setSelectedStudentsForItem([]);
                                    }}
                                    className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                        !showStudentSelector
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    All Students
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowStudentSelector(true)}
                                    className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
                                        showStudentSelector
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Select Students ({selectedStudentsForItem.length})
                                </button>
                            </div>
                        </div>

                        {/* Student Selection List */}
                        {showStudentSelector && (
                            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-100">
                                {students.length === 0 ? (
                                    <div className="text-center py-6">
                                        <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
                                        <p className="text-sm font-bold text-slate-700 mb-1">No Students Loaded</p>
                                        <p className="text-xs text-slate-500">Please fetch students first by selecting a month and clicking "Fetch Students"</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Input */}
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                placeholder="Search by name or room number..."
                                                value={studentSearchTerm}
                                                onChange={(e) => setStudentSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                            />
                                        </div>
                                        
                                        {/* Student List */}
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {students
                                                .filter(student => {
                                                    const searchLower = studentSearchTerm.toLowerCase();
                                                    return (
                                                        student.name.toLowerCase().includes(searchLower) ||
                                                        student.roomNo.toString().includes(searchLower) ||
                                                        student.rollNo.toLowerCase().includes(searchLower)
                                                    );
                                                })
                                                .map((student) => (
                                                    <label
                                                        key={student.studentId}
                                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                                            selectedStudentsForItem.includes(student.studentId)
                                                                ? 'bg-indigo-50 border-2 border-indigo-200'
                                                                : 'bg-white border-2 border-transparent hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentsForItem.includes(student.studentId)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedStudentsForItem([...selectedStudentsForItem, student.studentId]);
                                                                } else {
                                                                    setSelectedStudentsForItem(selectedStudentsForItem.filter(id => id !== student.studentId));
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                                                            <p className="text-xs text-slate-500">Room {student.roomNo} • {student.rollNo}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                        </div>
                                        
                                        {/* No Results Message */}
                                        {students.filter(student => {
                                            const searchLower = studentSearchTerm.toLowerCase();
                                            return (
                                                student.name.toLowerCase().includes(searchLower) ||
                                                student.roomNo.toString().includes(searchLower) ||
                                                student.rollNo.toLowerCase().includes(searchLower)
                                            );
                                        }).length === 0 && studentSearchTerm && (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-slate-500">No students found matching "{studentSearchTerm}"</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <Button 
                            onClick={addBillItem} 
                            disabled={
                                loading || 
                                !currentBillName || 
                                !currentBillAmount || 
                                (showStudentSelector && (students.length === 0 || selectedStudentsForItem.length === 0))
                            }
                            variant="primary"
                            className="w-full py-3"
                        >
                            Add Item
                        </Button>
                        
                        {billItems.length > 0 && (
                            <div className="space-y-3 mt-4 max-h-40 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Added Items</h4>
                                {billItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm font-medium">
                                        <div className="flex-1">
                                            <span className="text-slate-800 font-bold">{item.name}</span>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {item.selectedStudents ? `${item.selectedStudents.length} student(s)` : 'All students'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-indigo-600">₹{item.amount}</span>
                                            <button onClick={() => removeBillItem(item.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}

                         <div className="pt-4 border-t border-slate-100 mt-2">
                             <Button 
                                onClick={generateBill} 
                                disabled={loading || students.length === 0}
                                variant="success"
                                className="w-full py-4 text-base"
                                icon={Download}
                             >
                                {loading ? "Generating..." : "Generate & Download Bill"}
                             </Button>
                         </div>
                    </div>
                 </Card>
              </div>

              {students.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 text-lg">Bill Preview</h2>
                    <Badge variant="info">{students.length} Students</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4 text-center">#</th>
                          <th className="px-6 py-4 text-center">Room</th>
                          <th className="px-6 py-4 text-left">Student Name</th>
                          <th className="px-6 py-4 text-center">Roll No</th>
                          <th className="px-6 py-4 text-center">Diet</th>
                          <th className="px-6 py-4 text-center">Diet Rate</th>
                          <th className="px-6 py-4 text-right">D* Rate</th>
                          <th className="px-6 py-4 text-right">Extra</th>
                          {billItems.map(item => (
                             <th key={item.id} className="px-6 py-4 text-right bg-orange-50 text-orange-600 whitespace-nowrap">{item.name}</th>
                          ))}
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {students.map((s, idx) => {
                          const dt = calculateDietTotal(s.diet);
                          const t = calculateTotal(s.diet, s.extra, s.studentId);
                          return (
                            <tr key={s.studentId} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4 text-center text-slate-400">{idx + 1}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-800">{s.roomNo}</td>
                              <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                              <td className="px-6 py-4 text-center text-slate-500">{s.rollNo}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{s.diet}</span>
                              </td>
                              <td className="px-6 py-4 text-center text-slate-500">{mealRate}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{dt}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{Number(s.extra || 0)}</td>
                              {billItems.map(item => {
                                // Check if this student is selected for this item
                                const isSelected = !item.selectedStudents || item.selectedStudents.includes(s.studentId);
                                const amount = isSelected ? Number(item.amount) : 0;
                                return (
                                  <td key={item.id} className={`px-6 py-4 text-right font-bold ${isSelected ? 'text-orange-600 bg-orange-50/30' : 'text-slate-300 bg-slate-50/30'}`}>
                                    {amount}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 text-right font-black text-slate-800 bg-slate-50/50">{t}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-900 text-white">
                          <td colSpan={8 + billItems.length} className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">Grand Total</td>
                          <td className="px-6 py-4 text-right font-black text-lg">₹{grandTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Student Verification</h2>
                        <p className="text-slate-500">Manage student access and verifications</p>
                    </div>
                    <Button onClick={fetchAllStudents} disabled={loading} variant="secondary" icon={RotateCw}>
                        Refresh List
                    </Button>
               </div>

               {/* Search Input */}
               <div className="mb-4 flex gap-3 items-center max-w-2xl">
                   <input
                       type="text"
                       placeholder="Search by room number..."
                       value={studentVerificationSearch}
                       onChange={(e) => setStudentVerificationSearch(e.target.value)}
                       className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800"
                   />
                   <Button 
                       onClick={() => {}} 
                       variant="primary"
                       className="px-6 py-3"
                   >
                       Search
                   </Button>
               </div>

               {loading ? (
                   <div className="text-center py-20">
                       <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                       <p className="text-slate-500">Loading students...</p>
                   </div>
               ) : allStudents.length > 0 ? (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student Name</th>
                                    <th className="px-6 py-4 text-left">Roll No</th>
                                    <th className="px-6 py-4 text-left">Mobile No</th>
                                    <th className="px-6 py-4 text-left">Room</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium">
                                {allStudents
                                    .filter(s => {
                                        if (!studentVerificationSearch) return true;
                                        return s.roomNo?.toString().includes(studentVerificationSearch);
                                    })
                                    .map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{s.name}</div>
                                            <div className="text-xs text-slate-400">{s.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-left text-slate-600">{s.rollNo}</td>
                                        <td className="px-6 py-4 text-left text-slate-600">{s.phoneNo || 'N/A'}</td>
                                        <td className="px-6 py-4 text-left font-bold text-slate-800">{s.roomNo}</td>
                                        <td className="px-6 py-4 text-center">
                                            {s.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!s.isVerified && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleVerifyStudent(s._id, 'approve')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerifyStudent(s._id, 'reject')}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
               ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Students Found</h3>
                    <p className="text-slate-400">There are no students registered in your hostel yet.</p>
                </div>
               )}
            </div>
          )}

          {activeTab === "menu" && (
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Weekly Menu</h2>
                        <p className="text-slate-500">Plan and manage the hostel menu for the week</p>
                    </div>
                    <Button onClick={saveMenu} disabled={loading} variant="success" icon={Check}>
                        {loading ? "Saving..." : "Save Menu"}
                    </Button>
                </div>
                
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 text-left font-bold text-slate-600 border-b border-r border-slate-200 w-32 sticky left-0 bg-slate-50 z-10">Days</th>
                                {mealTypes.map(type => (
                                    <th key={type} className="p-4 text-center font-bold text-slate-600 border-b border-slate-200 capitalize">
                                        {type}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {days.map(day => (
                                <tr key={day} className="bg-white hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700 border-r border-slate-200 sticky left-0 bg-white z-10">
                                        {day}
                                    </td>
                                    {mealTypes.map(mealType => {
                                        const item = weeklyMenu[day] && weeklyMenu[day][mealType] ? weeklyMenu[day][mealType][0] : { name: "", price: 0, image: "" };
                                        return (
                                            <td key={`${day}-${mealType}`} className="p-3 border-l border-slate-100 min-w-[200px] align-top">
                                                <div className="space-y-2">
                                                    <textarea 
                                                        className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-300" 
                                                        rows="3"
                                                        placeholder={`Enter ${mealType} menu...`}
                                                        value={item.name}
                                                        onChange={(e) => handleMenuChange(day, mealType, 'name', e.target.value)}
                                                    ></textarea>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 relative">
                                                            <input 
                                                                type="text" 
                                                                className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-400 outline-none font-medium"
                                                                placeholder="Price"
                                                                value={item.price}
                                                                onChange={(e) => handleMenuChange(day, mealType, 'price', e.target.value)}
                                                            />
                                                            <span className="absolute left-2 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                                                        </div>
                                                        <label className="cursor-pointer p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors relative group">
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(day, mealType, e.target.files[0])}
                                                            />
                                                            <ImageIcon size={18} />
                                                            {(item.image || item.preview) ? (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                                                            ) : null}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                Upload Image
                                                            </div>
                                                        </label>
                                                    </div>
                                                    
                                                    {/* Image Preview */}
                                                    {(item.preview || item.image) && (
                                                        <div className="mt-1 relative h-16 w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group">
                                                            <img 
                                                                src={item.preview || (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`)} 
                                                                alt="Menu preview" 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
          )}

          {activeTab === "reports" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Bill Generation History</h2>
                  <p className="text-slate-500 text-sm mt-1">View all generated bills for your hostel</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-slate-500 mt-4">Loading bill history...</p>
                </div>
              ) : billHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No bills generated yet</p>
                  <p className="text-slate-400 text-sm mt-2">Generate your first bill from the "Generate Bill" tab</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">#</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Period</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Type</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Meal Rate</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Bill Items</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Students</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Total Amount</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-600 text-sm">Generated</th>
                        <th className="text-right py-3 px-4 font-bold text-slate-600 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billHistory.map((bill, idx) => (
                        <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-slate-600">{idx + 1}</td>
                          <td className="py-4 px-4 font-medium text-slate-800">{bill.period}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              bill.type === 'monthly' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {bill.type === 'monthly' ? 'Monthly' : 'Date Range'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600">₹{bill.mealRate}</td>
                          <td className="py-4 px-4 text-slate-600">
                            {bill.billItems.length > 0 ? (
                              <div className="text-sm">
                                {bill.billItems.slice(0, 2).map((item, i) => (
                                  <div key={i} className="text-slate-600">
                                    {item.name}: ₹{item.amount}
                                  </div>
                                ))}
                                {bill.billItems.length > 2 && (
                                  <div className="text-slate-400 text-xs">+{bill.billItems.length - 2} more</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-600">{bill.studentCount}</td>
                          <td className="py-4 px-4 font-bold text-green-600">₹{bill.totalAmount}</td>
                          <td className="py-4 px-4 text-slate-500 text-sm">
                            {new Date(bill.generatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                  <button 
                                      onClick={() => handleDownloadHistoricalBill(bill)}
                                      disabled={downloadingBillId === bill._id}
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Download Bill Excel"
                                  >
                                      {downloadingBillId === bill._id ? (
                                         <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                          <Download size={18} />
                                      )}
                                  </button>
                                  <button 
                                      onClick={() => handleDeleteBill(bill._id)}
                                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Delete Bill Record"
                                  >
                                      <Trash2 size={18} />
                                  </button>
                              </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
