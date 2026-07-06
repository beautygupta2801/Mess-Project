import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  ShoppingBag,
  LogOut,
  Menu,
  Calendar,
  TrendingUp,
  Plus,
  User,
  FileText,
  ChevronRight,
  ChevronDown,
  Bell,
  UtensilsCrossed,
  Home,
  DollarSign,
  QrCode,
  Trash2,
  Edit2,
  Coffee,
  IceCream,
  Pizza,
  Zap,
  LayoutGrid
} from "lucide-react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import MessOffRequestsPage from "./MessOffRequest";
import ReportsPage from "./MunshiReport";
import AddMealPage from "./MunshiAddMeal";
import AddBillPage from "./AddBillPage";
import { munshiApi } from "./api";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

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
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// ==================== MEAL SELECTION PAGE ====================
const MealSelectionPage = ({ onSelectMeal, munshiName }) => {
  const mealTypes = [
    {
      id: "breakfast",
      label: "Breakfast",
      icon: "🌅",
      color: "from-orange-400 to-pink-500",
      time: "12:30 AM - 2:30 AM",
    },
    {
      id: "lunch",
      label: "Lunch",
      icon: "☀️",
      color: "from-yellow-400 to-orange-500",
      time: "12:30 PM - 2:30 PM",
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: "🍵",
      color: "from-green-400 to-teal-500",
      time: "5:30 PM - 6:10 PM",
    },
    {
      id: "dinner",
      label: "Dinner",
      icon: "🌙",
      color: "from-indigo-400 to-purple-500",
      time: "8:00 PM - 10:30 PM",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="w-full max-w-5xl p-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 shadow-xl shadow-indigo-100 animate-in zoom-in duration-700">
            <UtensilsCrossed className="w-10 h-10 text-indigo-600" />
          </div>
          
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                Welcome back 👋
            </span>
          </div>

          <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{munshiName || "Munshi"}</span>
          </h2>
          
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            Choose the current meal type to begin processing student orders for today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mealTypes.map((meal) => (
            <button
              key={meal.id}
              onClick={() => onSelectMeal(meal.id)}
              className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${meal.color} opacity-10 rounded-bl-[4rem] transition-opacity group-hover:opacity-20`}
              ></div>

              <div className="relative z-10">
                <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {meal.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {meal.label}
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {meal.time}
                </p>

                <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <span>Start Session</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== QR SCANNER COMPONENT ====================
const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = React.useRef(null);
  const scannedRef = React.useRef(false);

  useEffect(() => {
    // Clear any existing scanner if somehow we are re-initializing without unmounting?
    if (scannerRef.current) {
        scannerRef.current.clear().catch(console.warn);
    }
    
    scannedRef.current = false;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      showTorchButtonIfSupported: true,
    });
    scannerRef.current = scanner;

    const successCallback = (decodedText, result) => {
        if (scannedRef.current) return;
        scannedRef.current = true;
        
        // Pause creates a better UX than just unmounting immediately if we want to freeze the frame?
        // But we just want to stop callbacks.
        scanner.pause(true); 
        
        onScanSuccess(decodedText, result);
    };

    scanner.render(successCallback, onScanError);

    return () => {
      if (scannerRef.current) {
         try {
             // If we paused, we might need to resume before clear? or clear handles it.
             // clear() returns a promise. We should handle it.
             scannerRef.current.clear().catch((error) => {
               console.warn("Failed to clear html5QrcodeScanner. ", error);
             });
         } catch (e) {
             console.warn("Error clearing scanner", e);
         }
         scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50">
      <div id="reader" className="w-full"></div>
    </div>
  );
};

// ==================== ADD MEAL MODAL ====================
const SimpleAddMealModal = ({ isOpen, onClose, onAdd, sessionMeal }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("mealType", sessionMeal); // Use current session
      if (image) {
        formData.append("image", image);
      }

      await onAdd(sessionMeal, formData);
      onClose();
      setName("");
      setPrice("");
      setImage(null);
    } catch (error) {
      console.error(error);
      alert("Failed to add meal: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Add Meal Item</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
              placeholder="e.g. Masala Dosa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
              placeholder="e.g. 50"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Image</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 group-hover:border-indigo-500 group-hover:bg-indigo-50/50 transition-all flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                   {image ? <CheckCircle size={18} className="text-emerald-500" /> : <Plus size={18} className="text-slate-400" />}
                </div>
                <span className={`text-sm font-medium ${image ? "text-slate-800" : "text-slate-400"}`}>
                  {image ? image.name : "Click to upload image"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};


const EditExtraItemModal = ({ isOpen, onClose, onEdit, item }) => {
  const [name, setName] = useState(item?.name || "");
  const [price, setPrice] = useState(item?.price || "");
  const [category, setCategory] = useState(item?.category || "Snacks");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update state when item changes
  useEffect(() => {
    if (item) {
        setName(item.name);
        setPrice(item.price);
        setCategory(item.category || "Snacks");
        setImage(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      if (image) {
        formData.append("image", image);
      }

      await onEdit(item._id || item.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Edit Extra Item</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
              required
            />
          </div>

          <div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
                <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
                required
                min="0"
                />
            </div>

          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Update Image (Optional)</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 group-hover:border-indigo-500 group-hover:bg-indigo-50/50 transition-all flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                   {image ? <CheckCircle size={18} className="text-emerald-500" /> : <Plus size={18} className="text-slate-400" />}
                </div>
                <span className={`text-sm font-medium ${image ? "text-slate-800" : "text-slate-400"}`}>
                  {image ? image.name : "Click to replace image"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Updating..." : "Update Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddExtraItemModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Snacks");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      if (image) {
        formData.append("image", image);
      }
      // Default availability is true
      formData.append("isAvailable", "true");

      await onAdd(formData);
      onClose();
      setName("");
      setPrice("");
      setCategory("Snacks");
      setImage(null);
    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Add New Item</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
              placeholder="e.g. Lays Classic"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label>
                <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all"
                placeholder="20"
                required
                min="0"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Image (Optional)</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 group-hover:border-indigo-500 group-hover:bg-indigo-50/50 transition-all flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                   {image ? <CheckCircle size={18} className="text-emerald-500" /> : <Plus size={18} className="text-slate-400" />}
                </div>
                <span className={`text-sm font-medium ${image ? "text-slate-800" : "text-slate-400"}`}>
                  {image ? image.name : "Click to upload image"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==================== DASHBOARD VIEW ====================
const DashboardView = ({
  sessionMeal,
  onStudentScan,
  scannedStudent,
  clearScannedStudent,
  onAddExtraItems,
  meals,
  scanLoading,
  menuLoading,
  munshiName,
  munshiHostel,
  onDeleteMeal,
  onEditMeal,
  extraItemsList,
  categories,
  selectedCategory,
  setSelectedCategory,
  onNavigate, // Renamed from onAddMealClick
  onAddExtraClick, // New Prop
  onEditExtra,
  onDeleteExtra,
  sessionStats
}) => {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [error, setError] = useState("");
  const [extraItems, setExtraItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };
  const handleQRScanSuccess = React.useCallback(async (decodedText) => {
    try {
        const student = await onStudentScan(decodedText);
        setIsScanning(false);
        if (!student) {
            setError("Invalid QR Code: Student not found");
        } else {
            setError("");
        }
    } catch (e) {
        setIsScanning(false);
        setError("Error processing QR Code");
    }
  }, [onStudentScan]);

  const handleQRScanError = React.useCallback((err) => {
    console.warn(err);
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    const student = await onStudentScan(studentIdInput);
    if (!student) {
      setError("Student ID, Roll Number or Room Number not found.");
    }
  };

  const handleClear = () => {
    setStudentIdInput("");
    setError("");
    setExtraItems([]);
    clearScannedStudent();
    setShowDeleteId(null);
  };

  const toggleExtraItem = (item) => {
    setExtraItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const updateItemQty = (id, delta) => {
    setExtraItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const calculateItemPrice = (item) => {
    // Special pricing logic: if item price is 15 and qty is 2, total for that item is 25
    if (item.price === 15 && item.qty === 2) return 25;
    // General rule for multiples of 2 if we want to be proactive?
    // The user specifically mentioned 2 piece for 25.
    // Let's stick to the specific rule or maybe (Math.floor(item.qty/2)*25 + (item.qty%2)*15)
    // Actually, I'll stick to the user's specific example for now.
    if (item.price === 15 && item.qty > 1) {
      const bundles = Math.floor(item.qty / 2);
      const remaining = item.qty % 2;
      return bundles * 25 + remaining * 15;
    }
    return item.price * item.qty;
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'snacks': return <Pizza size={14} />;
      case 'beverages': return <Coffee size={14} />;
      case 'dessert': return <IceCream size={14} />;
      case 'daily specials': return <Zap size={14} />;
      default: return <LayoutGrid size={14} />;
    }
  };

  const handleSubmitExtras = async () => {
    if (!scannedStudent) return;
    try {
      // Logic Checks
      const isMessClosed = scannedStudent.isMessClosed;
      const isDietTaken = scannedStudent.takenMeals?.includes(sessionMeal);
      
      const shouldCountDiet = ["breakfast", "lunch", "dinner"].includes(
        (sessionMeal || "").toLowerCase(),
      );

      if (shouldCountDiet && isMessClosed) {
        showNotification("error", "Mess is CLOSED for this student. Process cannot be done.");
        return;
      }

      if (shouldCountDiet && isDietTaken && extraItems.length === 0) {
        showNotification("error", "Process cannot be done without extra items.");
        return;
      }

      if (!shouldCountDiet && extraItems.length === 0) {
        showNotification("error", "Diet can only be marked for Breakfast, Lunch, or Dinner.");
        return;
      }

      // If diet already taken or mess closed, we don't count another diet
      const dietCount = (shouldCountDiet && !isDietTaken && !isMessClosed) ? 1 : 0;

      await onAddExtraItems(scannedStudent.id, extraItems, dietCount);
      showNotification("success", `Marked ${extraItems.length > 0 ? extraItems.length + " item(s)" : "Diet"} for ${scannedStudent.name}`);
    } catch (err) {
      showNotification("error", err.message || "Failed to process order.");
    } finally {
      // Always clear the student card after any Process attempt
      handleClear();
    }
  };

  const totalAmount = extraItems.reduce(
    (sum, item) => sum + calculateItemPrice(item),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {notification && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-300 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <X size={24} />
          )}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Student Lookup */}
          <Card className="p-4 md:p-6 lg:p-8">
            <div className="hidden lg:flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Search className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Student Lookup
                </h2>
                <p className="text-slate-500 text-sm">
                  Scan QR or enter details to find student
                </p>
              </div>
            </div>

            {!scannedStudent ? (
              <div className="space-y-6">
                <div className="flex flex-row gap-2 md:gap-4">
                  <form onSubmit={handleScan} className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter Roll No or Room No..."
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 outline-none text-lg"
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        type="submit"
                        disabled={scanLoading}
                        className="py-2 px-4 text-sm rounded-xl"
                      >
                        {scanLoading ? "Wait..." : "Find"}
                      </Button>
                    </div>
                  </form>

                  <Button
                    variant={isScanning ? "danger" : "secondary"}
                    onClick={() => setIsScanning(!isScanning)}
                    className="sm:w-auto px-8"
                    icon={isScanning ? X : QrCode}
                  >
                    {isScanning ? "Close" : "Scan"}
                  </Button>
                </div>

                {isScanning && (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <QRScanner
                      onScanSuccess={handleQRScanSuccess}
                      onScanError={handleQRScanError}
                    />
                    <p className="text-center text-slate-400 text-xs mt-3 font-medium">
                      Point your camera at the student's QR code
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl text-sm font-medium inline-flex">
                    <X size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-4 md:p-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-row items-center justify-between gap-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 text-lg md:text-xl font-bold shrink-0">
                      {scannedStudent.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                        {scannedStudent.name}
                      </h3>
                      <div className="flex flex-wrap gap-1 md:gap-2 mt-0.5 md:mt-1">
                        <Badge variant="info">
                          {scannedStudent.rollNumber}
                        </Badge>
                        <Badge variant="warning">
                          {scannedStudent.roomNumber}
                        </Badge>
                        {scannedStudent.isMessClosed && (
                            <Badge variant="danger">Mess Closed</Badge>
                        )}
                        {!scannedStudent.isMessClosed && scannedStudent.takenMeals?.includes(sessionMeal) && (
                            <Badge variant="success">Diet Taken</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-4 md:bg-white/60 md:p-4 rounded-2xl backdrop-blur-sm shrink-0">
                    <div className="text-right">
                      <p className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Balance
                      </p>
                      <p
                        className={`text-base md:text-xl font-bold ${scannedStudent.balance > 0 ? "text-emerald-600" : "text-slate-800"}`}
                      >
                        ₹{scannedStudent.balance}
                      </p>
                    </div>
                    <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                    <Button 
                        onClick={handleSubmitExtras}
                        variant="success"
                        className="py-1.5 px-3 md:py-2 md:px-4 shadow-emerald-200 text-xs md:text-sm"
                        disabled={scannedStudent?.isMessClosed || (scannedStudent?.takenMeals?.includes(sessionMeal) && extraItems.length === 0)}
                    >
                        Process
                    </Button>
                    <div className="hidden md:block h-8 w-px bg-slate-200"></div>
                    <button
                      onClick={handleClear}
                      className="p-1.5 md:p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500"
                    >
                      <X size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Menu Items */}
          <Card className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-row items-center justify-between gap-4 mb-4 md:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <div className="p-2 md:p-3 bg-orange-50 rounded-xl md:rounded-2xl">
                  <UtensilsCrossed className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    Available Menu
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                    Session:{" "}
                    <span className="text-indigo-600">{sessionMeal}</span>
                  </p>
                </div>
              </div>

               {/* Category Tabs - Beside Available Menu */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full justify-end">
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onAddExtraClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold whitespace-nowrap border border-indigo-600 hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    Add Extra Item
                  </button>
                </div>
                
                <div className="h-4 w-px bg-slate-200 mx-1 shrink-0"></div>

                {categories
                  .filter(cat => cat !== 'Snacks')
                  .map((cat) => (
                  <button
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(cat);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50"
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    {cat}
                  </button>
                ))}
              </div>

               {/* Mobile Badge */}
               <div className="md:hidden">
                  {scannedStudent && extraItems.length > 0 && (
                    <Badge variant="success">{extraItems.length}</Badge>
                  )}
               </div>
            </div>

            {menuLoading ? (
              <div className="text-center py-12 text-slate-400">
                Loading menu...
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
                {(meals[sessionMeal] || []).map((item) => {
                  const isSelected = extraItems.find((i) => i.id === item.id);
                  const showDelete = showDeleteId === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (scannedStudent) {
                          if (scannedStudent.isMessClosed) {
                              showNotification("error", "Cannot add options when Mess is Closed.");
                              return;
                          }
                          toggleExtraItem(item);
                        } else {
                          setShowDeleteId(showDelete ? null : item.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50"
                          : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                      } ${!scannedStudent && !showDelete ? "hover:border-rose-200" : ""}`}
                    >
                      <div className="aspect-square md:aspect-[4/3] overflow-hidden relative">
                        <img
                          src={item.image ? (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`) : "https://placehold.co/400?text=No+Image"}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                               e.target.onerror = null; 
                               e.target.src = "https://placehold.co/400?text=No+Image"; 
                           }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white rounded-full p-2 text-indigo-600 shadow-xl scale-100 animate-in zoom-in duration-200">
                              <CheckCircle
                                size={24}
                                fill="currentColor"
                                className="text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4 lg:p-5">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                          <h3 className={`font-bold text-sm md:text-base transition-colors ${showDelete ? 'text-rose-600' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {item.name}
                          </h3>
                          <div className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
                            ₹{item.price}
                          </div>
                        </div>

                        {showDelete && !scannedStudent && (
                          <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                             <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPrice = prompt(`Enter new price for ${item.name}:`, item.price);
                                if (newPrice !== null && !isNaN(newPrice)) {
                                  onEditMeal(sessionMeal, item.id, { price: Number(newPrice) });
                                  setShowDeleteId(null);
                                }
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  onDeleteMeal(sessionMeal, item.id);
                                  setShowDeleteId(null);
                                }
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                        
                        {!scannedStudent && !showDelete && (
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Click to manage</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(meals[sessionMeal] || []).length === 0 && extraItemsList.filter(item => selectedCategory === "All" || item.category === selectedCategory).length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    No items available for this session.
                  </div>
                )}

                {/* Extra Items merged into grid */}
                {extraItemsList
                  .filter(item => selectedCategory === "All" || item.category === selectedCategory)
                  .map(item => {
                    const isSelected = extraItems.find((i) => i.name === item.name);
                    const showExtraActions = showDeleteId === item._id; // Use _id for extra items
                    
                    return (
                    <div
                      key={item._id}
                      onClick={() => {
                        if (scannedStudent) {
                           if (scannedStudent.isMessClosed) {
                               showNotification("error", "Cannot add extra items when Mess is Closed.");
                               return;
                           }
                           const existingItem = extraItems.find(i => i.name === item.name);
                           if (existingItem) {
                               updateItemQty(existingItem.id, 1);
                           } else {
                               toggleExtraItem({ name: item.name, price: item.price, id: Date.now() }); // Map to frontend format
                           }
                        } else {
                           setShowDeleteId(showExtraActions ? null : item._id); // Toggle actions for extra items
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50"
                          : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-500"
                      } ${!scannedStudent && !showExtraActions ? "hover:border-rose-200" : ""}`}
                    >
                      <div className="aspect-square md:aspect-[4/3] overflow-hidden relative">
                         {item.image ? (
                          <img
                            src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/400?text=No+Image"; // Fallback
                            }}
                          />
                         ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-4xl">
                            🍔
                          </div>
                         )}
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white rounded-full p-2 text-indigo-600 shadow-xl scale-100 animate-in zoom-in duration-200">
                              <CheckCircle
                                size={24}
                                fill="currentColor"
                                className="text-white"
                              />
                              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                {isSelected.qty}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4 lg:p-5">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                          <h3 className={`font-bold text-sm md:text-base transition-colors ${showExtraActions ? 'text-rose-600' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {item.name}
                          </h3>
                          <div className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
                            ₹{item.price}
                          </div>
                        </div>
                        
                        {showExtraActions && !scannedStudent && (
                          <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                             <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditExtra(item);
                                setShowDeleteId(null);
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  onDeleteExtra(item._id);
                                  setShowDeleteId(null);
                                }
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}

                        {!scannedStudent && !showExtraActions && (
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Click to manage</p>
                        )}
                      </div>
                    </div>
                  )})}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-8 border-indigo-100 shadow-indigo-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" size={20} />
              Current Order
            </h3>

            {scannedStudent ? (
              <>
                {extraItems.length > 0 ? (
                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {extraItems.map((item) => {
                      const itemTotal = calculateItemPrice(item);
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all gap-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 font-bold text-sm tracking-tight">
                              {item.name}
                            </span>
                            <button
                              onClick={() => toggleExtraItem(item)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-slate-100/50">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateItemQty(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                                disabled={item.qty <= 1}
                              >
                                -
                              </button>
                              <span className="w-10 text-center font-black text-slate-800">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateItemQty(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="text-indigo-600 font-black text-sm">
                                ₹{itemTotal}
                              </span>
                              {item.qty > 1 && item.price === 15 && (
                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">
                                  Bundle Applied
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-2xl bg-indigo-50 border border-dashed border-indigo-200 mb-6">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500 shadow-sm">
                      <UtensilsCrossed size={24} />
                    </div>
                    <p className="text-indigo-900 font-bold text-sm mb-1">
                      Mark Diet Only
                    </p>
                    <p className="text-indigo-600 text-xs">
                      Click Process to mark 1 diet for this student
                    </p>
                  </div>
                )}
                
                {scannedStudent && scannedStudent.isMessClosed && (
                    <div className="mb-4 text-center p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
                        Mess is Closed for this student.
                        <br/>
                        <span className="text-xs font-normal">Diet cannot be marked.</span>
                    </div>
                )}

                 {scannedStudent && !scannedStudent.isMessClosed && scannedStudent.takenMeals?.includes(sessionMeal) && (
                    <div className="mb-4 text-center p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">
                        Diet already taken.
                        <br/>
                        <span className="text-xs font-normal">Only extras can be added.</span>
                    </div>
                )}

                 <div className="bg-slate-900 rounded-2xl p-5 text-white mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold">₹{totalAmount}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitExtras}
                  variant={scannedStudent?.isMessClosed || (scannedStudent?.takenMeals?.includes(sessionMeal) && extraItems.length === 0) ? "secondary" : "success"}
                  className={`w-full py-4 text-lg ${scannedStudent?.isMessClosed || (scannedStudent?.takenMeals?.includes(sessionMeal) && extraItems.length === 0) ? '' : 'shadow-emerald-200'}`}
                  disabled={scannedStudent?.isMessClosed || (scannedStudent?.takenMeals?.includes(sessionMeal) && extraItems.length === 0)}
                >
                  {scannedStudent?.isMessClosed 
                     ? "Process cannot be done (Mess Closed)"
                     : (scannedStudent?.takenMeals?.includes(sessionMeal) && extraItems.length === 0 
                         ? "Process cannot be done without extra items" 
                         : (extraItems.length === 0 ? "Mark Diet Only" : "Process Order"))}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                 <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <QrCode size={32} />
                    </div>
                    <h4 className="text-slate-700 font-bold mb-2">Ready to Scan</h4>
                    <p className="text-slate-400 font-medium text-sm">
                      Scan a student QR code to view their details and process orders.
                    </p>
                </div>
              </div>
            )}
          </Card>
        </div>
        </div>

    </div>
  );
};

const EMPTY_MEALS = { breakfast: [], lunch: [], snacks: [], dinner: [] };

// ==================== MAIN COMPONENT ====================
const MunshiDashboard = ({ onLogout: onLogoutProp }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL, default to 'dashboard'
  const currentPath = location.pathname.split("/").pop();
  const activeTab = ["dashboard", "messoff", "reports", "adddiet", "addbill"].includes(currentPath) ? currentPath : "dashboard";

  const [sessionMeal, setSessionMeal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  
  // Extra Item Edit State
  const [editingExtraItem, setEditingExtraItem] = useState(null);
  const [isEditExtraModalOpen, setIsEditExtraModalOpen] = useState(false);
  const [isAddExtraModalOpen, setIsAddExtraModalOpen] = useState(false); // Add Extra Modal State
  const [scannedStudent, setScannedStudent] = useState(null);
  const [messOffRequests, setMessOffRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 50;
  const [meals, setMeals] = useState(EMPTY_MEALS);
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [munshiName, setMunshiName] = useState("");
  const [munshiHostel, setMunshiHostel] = useState("");
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const notificationTimeoutRef = React.useRef(null);
  const [extraItemsList, setExtraItemsList] = useState([]);

  const showNotification = (type, message) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type, message });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, 2000);
  };
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [categories, setCategories] = useState(["All"]);
  const [sessionStats, setSessionStats] = useState({ taken: [], notTaken: [], messOff: [] });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const refreshSessionStats = React.useCallback(async () => {
      if (!sessionMeal) return;
      try {
          const stats = await munshiApi.getSessionStats(sessionMeal);
          setSessionStats(stats);
      } catch (error) {
          console.error("Failed to fetch session stats:", error);
      }
  }, [sessionMeal]);

  useEffect(() => {
    if (sessionMeal) {
      refreshSessionStats();
      const interval = setInterval(refreshSessionStats, 30000); // Auto-refresh every 30s
      return () => clearInterval(interval);
    }
  }, [sessionMeal, refreshSessionStats]);
  const onLogout = onLogoutProp || handleLogout;

  const fetchExtraItems = async () => {
    try {
      const items = await munshiApi.getExtraItems();
      setExtraItemsList(items);
      const uniqueCats = ["All", ...new Set(items.map(i => i.category))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error("Failed to fetch extra items:", err);
    }
  };

  const handleEditExtra = async (id, formData) => {
      try {
          await munshiApi.updateExtraItem(id, formData);
          showNotification("success", "Item updated successfully");
          fetchExtraItems();
      } catch (err) {
          showNotification("error", err.message);
      }
  };

  const handleDeleteExtra = async (id) => {
      try {
          await munshiApi.deleteExtraItem(id);
          showNotification("success", "Item deleted successfully");
          fetchExtraItems(); // Refresh
      } catch (err) {
          showNotification("error", err.message);
      }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("authRole");
    if (!token || role !== "munshi") {
      window.location.href = "/login";
      return;
    }

    try {
      const authUserStr = localStorage.getItem("authUser");
      if (authUserStr) {
        const authData = JSON.parse(authUserStr);
        // Based on Login.jsx, the user object can be in .munshi or .user
        const name = authData.munshi?.name || authData.user?.name || "";
        const hostel = authData.munshi?.hostel || authData.user?.hostel || "";
        setMunshiName(name);
        setMunshiHostel(hostel);
      }
    } catch (err) {
      console.error("Error parsing authUser:", err);
    }

    setAuthChecked(true);
  }, []);

  const handleDeleteOrder = async (orderId) => {
      try {
          await munshiApi.deleteOrder(orderId);
          showNotification("success", "Order deleted successfully");
          refreshOrders(); // Refresh orders
          refreshSessionStats(); // Refresh stats too as diet count might change
      } catch (err) {
          showNotification("error", err.message);
      }
  };

  useEffect(() => {
    if (!authChecked || !sessionMeal) return;
    setMenuLoading(true);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    munshiApi
      .getMenu(today)
      .then(setMeals)
      .catch(() => setMeals(EMPTY_MEALS))
      .finally(() => setMenuLoading(false));

    // Fetch Extra Items
    fetchExtraItems();
  }, [authChecked, sessionMeal]);



  const refreshOrders = (page = 1) =>
    munshiApi
      .getOrders({ page, limit: LIMIT })
      .then((res) => {
          setOrders(res.data);
          setTotalPages(res.pagination.pages);
          setCurrentPage(res.pagination.page);
      })
      .catch(() => setOrders([]));
  const refreshMessOffRequests = () =>
    munshiApi
      .getMessOffRequests()
      .then(setMessOffRequests)
      .catch(() => setMessOffRequests([]));

  useEffect(() => {
    if (activeTab === "reports") { 
        refreshOrders();
    }
    if (activeTab === "messoff") {
        refreshMessOffRequests();
    }
  }, [activeTab]);

  const handleStudentScan = React.useCallback(async (q) => {
    if (!q?.trim()) return null;
    setLoading(true);
    try {
      const student = await munshiApi.lookupStudent(q);
      setScannedStudent(student);

      // Check for diet status immediately after scan
      if (student) {
          const currentSession = sessionMeal || getSessionByTime(); // Fallback if session not set
          
          if (student.isMessClosed) {
              showNotification("error", "Mess is CLOSED for this student.");
          } else if (student.takenMeals?.includes(currentSession)) {
              showNotification("error", "Diet already taken for this session.");
          }
      }

      return student;
    } catch {
      setScannedStudent(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionMeal]);

  const handleRequestAction = async (id, status, reason) => {
    await munshiApi.updateMessOffStatus(id, status, reason);
    setMessOffRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  };

  const handleMessOn = async (studentId) => {
    if(!window.confirm("Are you sure you want to enable mess for this student?")) return;
    try {
        await munshiApi.enableMessOn(studentId);
        showNotification("success", "Mess enabled successfully");
        refreshSessionStats(); 
        // Also clear scanned student if it matches
        if (scannedStudent && scannedStudent.id === studentId) {
            setScannedStudent(prev => ({ ...prev, isMessClosed: false }));
        }
    } catch (err) {
        showNotification("error", err.message);
    }
  };

  const getSessionByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 10) return "breakfast";
    if (hour >= 10 && hour < 15) return "lunch";
    if (hour >= 15 && hour < 18) return "snacks";
    if (hour >= 18 && hour < 23) return "dinner";
    return "breakfast"; // Default to breakfast for late night
  };

  const handleAddExtraItems = async (studentId, items, dietCount) => {
    let currentSession = sessionMeal;

    if (!currentSession) {
        currentSession = getSessionByTime();
        setSessionMeal(currentSession);
        // Optional: Notify user that session was auto-selected
        showNotification("success", `Auto-selected session: ${currentSession.charAt(0).toUpperCase() + currentSession.slice(1)}`);
    }

    // If buying items, default dietCount logic handled by backend (usually 1 unless snacks)
    // But if coming from buttons with explicit dietCount (like Guest Diet), we pass it.
    await munshiApi.createOrder(studentId, items, currentSession, dietCount);
    
    showNotification("success", items.length === 0 ? "Diet recorded successfully" : "Order processed successfully");

    refreshOrders();
    refreshSessionStats();
  };



  const handleAddExtraSubmit = async (formData) => {
      try {
          await munshiApi.addExtraItem(formData);
          showNotification("success", "Item added successfully");
          fetchExtraItems(); // Refresh list
      } catch (err) {
          showNotification("error", err.message);
          throw err;
      }
  };

  const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/munshi/dashboard" },
  { id: "messoff", label: "Mess Off", icon: Calendar, path: "/munshi/messoff" },
  { id: "reports", label: "Reports", icon: TrendingUp, path: "/munshi/reports" },
  { id: "adddiet", label: "Add Diet", icon: Plus, path: "/munshi/adddiet" },
  { id: "addbill", label: "Add Bill", icon: DollarSign, path: "/munshi/addbill" },
];

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {notification && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-300 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <X size={24} />
          )}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <UtensilsCrossed size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Munshi<span className="text-indigo-600">Dash</span>
            </h1>
          </div>

          {/* New Upper Sidebar Profile Section */}
          <div className="px-2 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {munshiName ? munshiName.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                  Munshi Profile
                </p>
                <h4 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {munshiName || "Munshi"}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <Home size={10} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-500 truncate">
                    {munshiHostel || "Hostel"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
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

          <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col gap-4">
            {/* Current Session Indicator */}
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 font-bold shadow-sm">
                <Calendar size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Session
                </p>
                <p className="text-xs text-slate-700 font-bold capitalize truncate">
                  {sessionMeal}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
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
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen relative">

        
        {/* Header */}
        <header className="relative z-30 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-slate-200/50 shadow-sm overflow-visible">
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Manage your mess operations efficiently
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* SESSION DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsSessionMenuOpen(!isSessionMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Calendar size={16} />
                <span className="capitalize">{sessionMeal || "Select Session"}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSessionMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isSessionMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {["breakfast", "lunch", "snacks", "dinner"].map((meal) => {
                    const isSelected = sessionMeal === meal;
                    const isCompleted = isSelected && sessionStats?.notTaken?.length === 0 && sessionStats?.taken?.length > 0;
                    
                    return (
                      <button
                        key={meal}
                        onClick={() => {
                          setSessionMeal(meal);
                          setIsSessionMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="capitalize">{meal}</span>
                        {isSelected && (
                             isCompleted ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                    Done <CheckCircle size={12} className="text-emerald-600" />
                                </span>
                             ) : (
                                <CheckCircle size={14} />
                             )
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <Bell size={20} />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-6 md:p-8 md:pt-4 pb-24 max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <>
              <DashboardView
                sessionMeal={sessionMeal}
                onStudentScan={handleStudentScan}
                scannedStudent={scannedStudent}
                clearScannedStudent={() => setScannedStudent(null)}
                onAddExtraItems={handleAddExtraItems}
                meals={meals}
                scanLoading={loading}
                menuLoading={menuLoading}
                munshiName={munshiName}
                munshiHostel={munshiHostel}
                // Handlers removed
                extraItemsList={extraItemsList}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onAddExtraClick={() => setIsAddExtraModalOpen(true)}
                onNavigate={() => setIsAddMealModalOpen(true)} // Reuse this flow or create dedicated
                onEditExtra={(item) => {
                    setEditingExtraItem(item);
                    setIsEditExtraModalOpen(true);
                }}
                onDeleteExtra={handleDeleteExtra}
                sessionStats={sessionStats}
              />
              
              {/* Modals */}


              {isEditExtraModalOpen && (
                <EditExtraItemModal
                    isOpen={isEditExtraModalOpen}
                    onClose={() => {
                        setIsEditExtraModalOpen(false);
                        setEditingExtraItem(null);
                    }}
                    onEdit={handleEditExtra}
                    item={editingExtraItem}
                />
              )}

              {isAddExtraModalOpen && (
                <AddExtraItemModal
                  isOpen={isAddExtraModalOpen}
                  onClose={() => setIsAddExtraModalOpen(false)}
                  onAdd={handleAddExtraSubmit}
                />
              )}
            </>
          )}
          {activeTab === "messoff" && (
            <MessOffRequestsPage
              requests={messOffRequests}
              handleAction={handleRequestAction}
            />
          )}
          {activeTab === "reports" && (
              <ReportsPage 
                orders={orders} 
                onOrderDeleted={handleDeleteOrder} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={refreshOrders}
              />
          )}
          {activeTab === "adddiet" && (
            <div className="space-y-6">
                <Card className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Instructions</h3>
                <p className="text-slate-600 text-sm">
                    To add a diet, go to the <b>Dashboard</b> tab, scan a student, and click <b>Process Order</b> (Diet Only) or select extra items.
                </p>
                </Card>

                 {/* Session Stats Section */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" />
                        Session Status: <span className="text-indigo-600 capitalize">{sessionMeal}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Taken Diet */}
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    Diet Taken
                                </h4>
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-emerald-600 shadow-sm">
                                    {sessionStats?.taken?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {sessionStats?.taken?.map(student => (
                                    <div key={student._id} className="bg-white p-3 rounded-xl border border-emerald-100/50 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{student.name}</p>
                                            <p className="text-xs text-slate-400">Roll: {student.rollNo}</p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                            {student.roomNo}
                                        </span>
                                    </div>
                                ))}
                                {(!sessionStats?.taken || sessionStats.taken.length === 0) && (
                                    <p className="text-center text-slate-400 text-xs py-4">No students yet</p>
                                )}
                            </div>
                        </div>

                        {/* Not Taken Diet */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                        <User size={18} />
                                        Not Taken
                                    </h4>
                                    <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                        {sessionStats?.notTaken?.length || 0}
                                    </span>
                                </div>
                                {sessionStats?.notTaken?.length > 0 && (
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to mark diet for all ${sessionStats.notTaken.length} students?`)) {
                                                    try {
                                                        const studentIds = sessionStats.notTaken.map(s => s._id);
                                                        await munshiApi.bulkRecordDiet(sessionMeal, studentIds);
                                                        showNotification("success", "Marked all as taken successfully");
                                                        refreshSessionStats();
                                                    } catch (err) {
                                                        showNotification("error", err.message);
                                                    }
                                                }
                                            }}
                                            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            Mark All
                                        </button>
                                )}
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {sessionStats?.notTaken?.map(student => (
                                    <div key={student._id} className="bg-white p-3 rounded-xl border border-slate-200/50 flex justify-between items-center shadow-sm">
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{student.name}</p>
                                            <p className="text-xs text-slate-400">Roll: {student.rollNo}</p>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                            {student.roomNo}
                                        </span>
                                    </div>
                                ))}
                                {(!sessionStats?.notTaken || sessionStats.notTaken.length === 0) && (
                                    <p className="text-center text-slate-400 text-xs py-4">All students have taken diet</p>
                                )}
                            </div>
                        </div>

                        {/* Mess Off */}
                        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-rose-800 flex items-center gap-2">
                                    <LogOut size={18} />
                                    Mess Closed
                                </h4>
                                <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-rose-600 shadow-sm">
                                    {sessionStats?.messOff?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {sessionStats?.messOff?.map(student => (
                                    <div key={student._id} className="bg-white p-3 rounded-xl border border-rose-100/50 flex justify-between items-center shadow-sm group">
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{student.name}</p>
                                            <p className="text-xs text-slate-400">Roll: {student.rollNo}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                                                {student.roomNo}
                                            </span>
                                            <button 
                                                onClick={() => handleMessOn(student._id)}
                                                className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold transition-opacity hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap"
                                                title="Enable Mess (Mess On)"
                                            >
                                                Mess On
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!sessionStats?.messOff || sessionStats.messOff.length === 0) && (
                                    <p className="text-center text-slate-400 text-xs py-4">No mess off requests</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
          )}
          {activeTab === "addbill" && <AddBillPage />}
        </div>
      </main>
    </div>
  );
};

export default MunshiDashboard;
