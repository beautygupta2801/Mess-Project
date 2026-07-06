
// --- IMPORTS ---
import React, { useState, useEffect } from 'react';
import { Home, BarChart2, CalendarOff, LogOut, Menu, X, QrCode, Download, FileText, ThumbsUp, Meh, ThumbsDown, Angry, MessageSquare, UtensilsCrossed, Bell, User, ChevronRight, Activity, DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

// --- API SERVICE LAYER ---
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  fetchStudentData: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch student data');
      }
      const data = await response.json();
      return data.success ? data.student : data;
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  },
  fetchMealHistory: async (token, month = null) => {
    try {
      const url = month !== null ? `${API_BASE_URL}/student/meals?month=${month}` : `${API_BASE_URL}/student/meals`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch meal history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching meal history:', error);
      throw error;
    }
  },
  fetchMessOffRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch mess off requests');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Error fetching mess off requests:', error);
      throw error;
    }
  },
  submitMessOff: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit mess off application');
      }
      return await response.json();
    } catch (error) {
      console.error('Error submitting mess off:', error);
      throw error;
    }
  },
  submitFeedback: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
  fetchMenu: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/current`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch menu');
      }
      const data = await response.json();
      if (data && data.data) return data.data;
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  },
  downloadReport: async (token, month) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/report/download?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download report');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-report-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },
  fetchBill: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bill/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch bill');
      }
      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }
};

// --- NAVIGATION COMPONENT ---
const NavItem = ({ icon, text, active, onClick, badge }) => (
    <li>
        <button 
            onClick={onClick} 
            className={`w-full flex items-center px-5 py-4 my-1.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            }`}
        >
            <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`}>
                {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
            </span>
            <span className={`ml-4 font-semibold text-[15px] tracking-wide relative z-10`}>{text}</span>
            {badge && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm relative z-10">
                    {badge}
                </span>
            )}
            {active && (
                <div className="ml-auto relative z-10 opacity-80">
                   <ChevronRight size={18} strokeWidth={3} />
                </div>
            )}
            {/* Subtle background glow for inactive hover */}
            {!active && <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
        </button>
    </li>
);

// --- LOADING COMPONENT ---
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="w-14 h-14 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-sm"></div>
        </div>
        <p className="mt-6 text-slate-500 font-medium text-sm tracking-wide animate-pulse">{message}</p>
    </div>
);

// --- DASHBOARD HOME ---
// --- DASHBOARD HOME ---
const StudentHome = ({ student, token }) => {
    const [mealHistory, setMealHistory] = useState([]);
    const [billData, setBillData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meals, bill] = await Promise.all([
                    apiService.fetchMealHistory(token),
                    apiService.fetchBill(token)
                ]);
                setMealHistory(Array.isArray(meals) ? meals.slice(0, 5) : []);
                setBillData(bill);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const totalBill = billData?.totalBill || student.bill || 0;
    const mealCount = billData?.mealCount || student.mealCount || 0;
    const avgMealCost = mealCount > 0 ? (totalBill / mealCount).toFixed(0) : 0;
    
    // Professional color palette & icons
    const stats = [
        { 
            label: 'Total Bill', 
            value: `₹${totalBill}`, 
            icon: <DollarSign size={24} />, 
            color: 'blue',
            desc: `${billData ? new Date(0, billData.month - 1).toLocaleString('default', { month: 'long' }) : 'Current'} ${billData?.year || new Date().getFullYear()}`
        },
        { 
            label: 'Meals Taken', 
            value: mealCount, 
            icon: <UtensilsCrossed size={24} />, 
            color: 'emerald',
            change: '+5',
            desc: 'this month'
        },
        { 
            label: 'Avg. Cost', 
            value: `₹${avgMealCost}`, 
            icon: <Activity size={24} />, 
            color: 'violet',
            change: '-2%',
            desc: 'per meal'
        },
        { 
            label: 'Mess Off', 
            value: '0', 
            icon: <CalendarOff size={24} />, 
            color: 'rose',
            change: '0',
            desc: 'active days'
        }
    ];

    const getLightBg = (color) => {
         const bgs = {
            blue: 'bg-blue-50 text-blue-600',
            emerald: 'bg-emerald-50 text-emerald-600',
            violet: 'bg-violet-50 text-violet-600',
            rose: 'bg-rose-50 text-rose-600',
        };
        return bgs[color] || bgs.blue;
    };

    return (
        <div className="space-y-10 transition-opacity duration-700 opacity-100">
            {/* Hero Section */}
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-200/40">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 transform transition-transform group-hover:scale-110 duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 opacity-10 rounded-full blur-2xl -ml-10 -mb-10 animate-pulse"></div>
                
                <div className="relative z-10 px-4 py-6 md:px-6 md:py-8 flex flex-row justify-between items-center gap-2 md:gap-6">
                    <div className="text-left max-w-[60%] md:max-w-2xl">
                        <div className="hidden md:inline-flex items-center px-4 py-1.5 bg-blue-500/20 rounded-full text-blue-50 text-xs font-bold mb-6 backdrop-blur-md border border-blue-400/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                            Live Mess Dashboard
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter mb-1 md:mb-2 drop-shadow-sm leading-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{student.name.split(' ')[0]}</span>
                        </h1>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                        {/* 1. VISIBLE DASHBOARD CARD (Simple & Clean) */}
                        <div className="mb-2 relative bg-white rounded-xl shadow-lg p-1 overflow-hidden">
                            <QRCodeCanvas 
                                value={student.qrCode || `${student.rollNo}-${student.hostelNo}-${student.roomNo}`} 
                                size={window.innerWidth < 768 ? 90 : 100}
                                level={"H"}
                                includeMargin={false}
                                bgColor={"#ffffff"}
                                fgColor={"#000000"}
                            />
                        </div>

                        <div className="mt-2 w-auto">
                             <button 
                                disabled={isDownloading}
                                onClick={async () => {
                                    try {
                                        setIsDownloading(true);
                                        const element = document.getElementById("printable-qr-card");
                                        if (element) {
                                            // 1. Clone the element
                                            const clone = element.cloneNode(true);
                                            clone.style.position = "fixed";
                                            clone.style.top = "0";
                                            clone.style.left = "0";
                                            clone.style.zIndex = "-9999";
                                            clone.style.transform = "none";
                                            clone.style.visibility = "visible";
                                            
                                            // 2. Fix: Copy Canvas Content (QRCode)
                                            // cloneNode() does not copy canvas data
                                            const originalCanvas = element.querySelector('canvas');
                                            const cloneCanvas = clone.querySelector('canvas');
                                            if (originalCanvas && cloneCanvas) {
                                                const ctx = cloneCanvas.getContext('2d');
                                                ctx.drawImage(originalCanvas, 0, 0);
                                            }

                                            document.body.appendChild(clone);

                                            // Wait for fonts/images
                                            await new Promise(resolve => setTimeout(resolve, 500));

                                            const canvas = await html2canvas(clone, {
                                                backgroundColor: null,
                                                scale: 4, 
                                                logging: false,
                                                useCORS: false, // No external assets, disable CORS checks
                                                allowTaint: false,
                                            });

                                            document.body.removeChild(clone);

                                            const pngUrl = canvas.toDataURL("image/png");
                                            const downloadLink = document.createElement("a");
                                            downloadLink.href = pngUrl;
                                            downloadLink.download = `NITJ_Mess_Card_${student.rollNo}.png`;
                                            document.body.appendChild(downloadLink);
                                            downloadLink.click();
                                            document.body.removeChild(downloadLink);
                                        }
                                    } catch (err) {
                                        console.error("Failed to capture QR card:", err);
                                        alert("Failed to download QR card. Please try again.");
                                    } finally {
                                        setIsDownloading(false);
                                    }
                                }}
                                className={`w-auto bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg font-medium text-xs backdrop-blur-sm border border-white/10 transition-all flex items-center justify-center gap-2 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                             >
                                 {isDownloading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                 ) : (
                                    <>
                                        <Download size={14} />
                                        <span>Download ID</span>
                                    </>
                                 )}
                             </button>
                        </div>

                        {/* 2. HIDDEN PREMIUM CARD (For Download Only) */}
                        {/* Positioned off-screen but rendered in DOM for html2canvas */}
                        <div style={{ position: "absolute", left: "-9999px", top: "0", zIndex: -10, visibility: 'hidden' }}>
                            <div id="printable-qr-card" style={{ 
                                position: 'relative', 
                                width: '320px', 
                                background: 'linear-gradient(135deg, #00BAF2, #0E1E5B)', 
                                borderRadius: '2rem', 
                                overflow: 'hidden', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                userSelect: 'none',
                                fontFamily: 'sans-serif' /* Ensure font consistency */
                            }}>
                                {/* Decorative Background Patterns */}
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '16rem', height: '16rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', filter: 'blur(64px)', marginRight: '-5rem', marginTop: '-5rem' }}></div>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '12rem', height: '12rem', background: 'rgba(0,0,0,0.1)', borderRadius: '9999px', filter: 'blur(40px)', marginLeft: '-2.5rem', marginBottom: '-2.5rem' }}></div>
                                
                                <div style={{ position: 'relative', zIndex: 10, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                    {/* Header */}
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.05em', color: '#ffffff', lineHeight: 1 }}>NITJ</span>
                                            <span style={{ fontSize: '10px', color: '#BFDBFE', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold' }}>MESS PORTAL</span>
                                        </div>
                                    </div>

                                    {/* Student Name & Roll - Prominent */}
                                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem', lineHeight: '1.2' }}>{student.name}</h2>
                                        <p style={{ color: '#BFDBFE', fontSize: '1rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 1rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block', margin: 0 }}>
                                            {student.rollNo}
                                        </p>
                                    </div>

                                    {/* QR Code Container - Centered and Large */}
                                    <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', marginBottom: '2rem' }}>
                                        <QRCodeCanvas 
                                            value={student.qrCode || `${student.rollNo}-${student.hostelNo}-${student.roomNo}`} 
                                            size={200}
                                            level={"H"}
                                            includeMargin={false}
                                        />
                                    </div>

                                    {/* Footer Info - Hostel Only */}
                                    <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                        <p style={{ fontSize: '12px', color: '#BFDBFE', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Hostel</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{student.hostelNo || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-1">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-3 md:mb-4">
                            <div className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl ${getLightBg(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                                {React.cloneElement(stat.icon, { size: window.innerWidth < 768 ? 18 : 24 })}
                            </div>
                            {stat.change && (
                                <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <h3 className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                        <div className="flex items-end gap-1 md:gap-2 mb-1 md:mb-3">
                            <span className="text-xl md:text-3xl font-extrabold text-slate-800">{stat.value}</span>
                            <span className="text-[10px] md:text-xs text-slate-400 font-medium mb-1 md:mb-1.5">{stat.desc}</span>
                        </div>
                        {stat.breakdown && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                                {stat.breakdown.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">{item.label}:</span>
                                        <span className="text-slate-700 font-bold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="w-full">
                <StudentReports mealHistory={mealHistory} studentName={student.name} isSummary={true} token={token} />
            </div>
        </div>
    );
};

// --- FEEDBACK COMPONENT ---
const StudentFeedback = ({ token }) => { 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedMealType, setSelectedMealType] = useState('');
    const [selectedMealName, setSelectedMealName] = useState('');
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState({});
    
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const menuData = await apiService.fetchMenu(token);
                setMenu(menuData);
            } catch (error) {
                console.error('Error loading menu:', error);
            }
        };
        fetchMenu();
    }, [token]);

    const mealItems = selectedMealType ? menu[selectedMealType] || [] : [];
    
    const handleSubmit = async () => { 
        if (!selectedDate || !selectedMealType || !rating) { 
            alert("Please select date, meal type, and provide a rating."); 
            return; 
        }
        setLoading(true);
        try {
            await apiService.submitFeedback(token, { date: selectedDate, mealType: selectedMealType, mealItem: selectedMealName, rating, comment });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSelectedMealType('');
                setSelectedMealName('');
                setRating('');
                setComment('');
            }, 3000);
        } catch (error) {
            alert(error.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const ratingOptions = [
        { value: 'Good', icon: <ThumbsUp size={28}/>, color: 'emerald', label: 'Satisfied' },
        { value: 'Average', icon: <Meh size={28}/>, color: 'blue', label: 'Neutral' },
        { value: 'Bad', icon: <ThumbsDown size={28}/>, color: 'orange', label: 'Unsatisfied' },
        { value: 'Very Bad', icon: <Angry size={28}/>, color: 'rose', label: 'Disappointed' },
    ];
    
    const getRatingStyles = (color, isSelected) => {
        const styles = {
            emerald: isSelected ? 'bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100' : 'border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-400',
            blue: isSelected ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100' : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-400',
            orange: isSelected ? 'bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100' : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-400',
            rose: isSelected ? 'bg-rose-500 border-rose-500 text-white ring-4 ring-rose-100' : 'border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400',
        };
        return styles[color];
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl mb-4 shadow-sm">
                            <MessageSquare className="text-blue-600" size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">We Value Your Feedback</h2>
                        <p className="text-slate-500 mt-2 text-lg">Help us improve the dining experience for everyone.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-50 rounded-3xl p-12 text-center border border-emerald-100 animate-in zoom-in duration-500">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6 shadow-sm">
                                <CheckCircle size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-800 mb-2">Feedback Received!</h3>
                            <p className="text-emerald-600">Thank you for taking the time to share your thoughts.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Date</label>
                                    <input 
                                        type="date" 
                                        value={selectedDate} 
                                        onChange={(e) => setSelectedDate(e.target.value)} 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Meal</label>
                                    <select 
                                        value={selectedMealType} 
                                        onChange={(e) => { setSelectedMealType(e.target.value); setSelectedMealName(''); }} 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none appearance-none"
                                    >
                                        <option value="">Select Meal Type</option>
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="snacks">Snacks</option>
                                        <option value="dinner">Dinner</option>
                                    </select>
                                </div>
                            </div>

                            {selectedMealType && mealItems.length > 0 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-slate-700 ml-1">Specific Item <span className="text-slate-400 font-normal">(Optional)</span></label>
                                    <select 
                                        value={selectedMealName} 
                                        onChange={(e) => setSelectedMealName(e.target.value)} 
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none appearance-none"
                                    >
                                        <option value="">Select an item...</option>
                                        {mealItems.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 ml-1 text-center md:text-left">How was your meal?</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {ratingOptions.map((option) => (
                                        <button 
                                            key={option.value} 
                                            onClick={() => setRating(option.value)} 
                                            className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${getRatingStyles(option.color, rating === option.value)} ${rating === option.value ? 'scale-105 shadow-lg' : 'hover:scale-105'}`}
                                        >
                                            <div className="mb-2 transition-transform duration-300 group-hover:-translate-y-1">{option.icon}</div>
                                            <span className="text-xs font-bold tracking-wide">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Comments</label>
                                <textarea 
                                    value={comment} 
                                    onChange={(e) => setComment(e.target.value)} 
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none resize-none min-h-[120px]" 
                                    placeholder="Tell us more about your experience..."
                                ></textarea>
                            </div>

                            <button 
                                onClick={handleSubmit} 
                                disabled={loading} 
                                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-800/30 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="relative flex items-center gap-2">
                                    {loading ? <LoadingSpinner message="" /> : <>Submit Feedback <ChevronRight size={20} strokeWidth={3} /></>}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- REPORTS COMPONENT ---
const StudentReports = ({ mealHistory, studentName, isSummary = false, token }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [filteredHistory, setFilteredHistory] = useState(mealHistory);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const availableMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    useEffect(() => {
        if (!isSummary) {
            const fetchMonthData = async () => {
                setLoading(true);
                try {
                    const data = await apiService.fetchMealHistory(token, selectedMonth);
                    setFilteredHistory(Array.isArray(data) ? data : []);
                    console.log(data)
                } catch (error) {
                    console.error('Error fetching month data:', error);
                    setFilteredHistory([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchMonthData();
        } else {
            setFilteredHistory(mealHistory);
        }
    }, [selectedMonth, isSummary, token, mealHistory]);
    
    const handleDownloadPdf = () => { 
        try {
            const doc = new jsPDF();
            const year = new Date().getFullYear();
            
            if (filteredHistory.length === 0) {
                alert("No meal records found for selected month to export.");
                return;
            }

            // Header
            doc.setFillColor(37, 99, 235); // Blue 600
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('MEAL REPORT', 14, 25);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

            // Student Info
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Student: ${studentName || 'N/A'}`, 14, 52);
            doc.setFont('helvetica', 'normal');
            doc.text(`Period: ${monthNames[selectedMonth] || ''}, ${year}`, 14, 58);

            // Table
            const tableColumn = ["Date", "Meal Type", "Diet", "Items", "Total"];
            const tableRows = [];
            let grandTotal = 0;

            filteredHistory.forEach(meal => {
                const cost = meal.totalCost || 0;
                grandTotal += cost;
                const itemsStr = (meal.items || []).map(i => `${i.name} (x${i.qty || 1})`).join(', ');
                const mealData = [
                    meal.date || '-',
                    meal.type || '-',
                    meal.dietCount !== undefined ? meal.dietCount : '-',
                    itemsStr || 'No items',
                    `Rs ${cost}`
                ];
                tableRows.push(mealData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                foot: [['', '', 'Grand Total', `Rs ${grandTotal}`]],
                startY: 65,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
                footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 4 },
                alternateRowStyles: { fillColor: [241, 245, 249] },
            });

            doc.save(`meal_report_${monthNames[selectedMonth]}_${year}.pdf`);
        } catch (error) {
            console.error("PDF Generation error:", error);
            alert("An error occurred while generating the PDF. Please try again.");
        }
    };

    const grandTotal = filteredHistory.reduce((sum, meal) => sum + (meal.totalCost || 0), 0);

    const getMealTypeStyle = (type) => {
        const styles = {
            'Breakfast': { bg: 'bg-orange-50 text-orange-700 ring-orange-100', dot: 'bg-orange-400' },
            'Lunch': { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-100', dot: 'bg-emerald-400' },
            'Snacks': { bg: 'bg-pink-50 text-pink-700 ring-pink-100', dot: 'bg-pink-400' },
            'Dinner': { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-100', dot: 'bg-indigo-400' },
            'Fine': { bg: 'bg-rose-50 text-rose-700 ring-rose-100', dot: 'bg-rose-400' },
        };
        return styles[type] || { bg: 'bg-slate-50 text-slate-700 ring-slate-100', dot: 'bg-slate-400' };
    };

    return (
        <div className={`bg-white rounded-3xl overflow-hidden border border-slate-100 ${!isSummary ? 'shadow-xl shadow-slate-200/50 p-6' : ''}`}>
            {!isSummary && (
                <div className="flex flex-wrap justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-50 rounded-2xl mr-4">
                            <BarChart2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meal Reports</h2>
                            <p className="text-slate-500 font-medium">Detailed history of your dining activity</p>
                        </div>
                    </div>
                    {availableMonths.length > 0 && (
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <div className="relative">
                                <select 
                                    value={selectedMonth} 
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none cursor-pointer"
                                >
                                    {availableMonths.map(month => <option key={month} value={month}>{monthNames[month]}</option>)}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} strokeWidth={3} />
                            </div>
                            
                            <button 
                                onClick={handleDownloadPdf} 
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-800/20 active:scale-95 transition-all flex items-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={16} strokeWidth={2.5} />
                                <span>Export PDF</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
                {loading ? (
                    <div className="p-12"><LoadingSpinner message="Loading meals..." /></div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Meal Type</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Diet</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Items</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.length > 0 ? (
                                <>
                                    {filteredHistory.map((meal, index) => { 
                                        const style = getMealTypeStyle(meal.type);
                                        return (
                                            <tr key={index} className="hover:bg-blue-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700">{meal.date}</span>
                                                        <span className="text-xs text-slate-400 mt-0.5">{meal.time || '12:00 PM'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${style.ring} ${style.bg} ${style.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}></span>
                                                        {meal.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-bold text-slate-700">{meal.dietCount !== undefined ? meal.dietCount : '-'}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {meal.items && meal.items.length > 0 ? (
                                                            meal.items.map((item, idx) => (
                                                                <span key={idx} className="inline-flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                                    {item.name}
                                                                    <span className="ml-1.5 text-slate-400 text-xs">×{item.qty}</span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400 text-sm italic">No items recorded</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">₹{meal.totalCost || 0}</span>
                                                </td>
                                            </tr>
                                        ); 
                                    })}
                                    <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-100">
                                        <td colSpan="4" className="py-4 px-6 text-right text-slate-500 uppercase text-xs tracking-wider">Grand Total</td>
                                        <td className="py-4 px-6 text-right text-lg text-blue-600">₹{grandTotal}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-16">
                                        <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                                            <FileText size={32} className="text-slate-300"/>
                                        </div>
                                        <p className="text-slate-500 font-medium">No meal records found for this period.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// --- MESS OFF COMPONENTS ---
const MessOffPage = ({ studentName, token }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await apiService.fetchMessOffRequests(token);
                setRequests(data);
            } catch (error) {
                console.error('Error loading mess off requests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [token]);

    const refreshRequests = async () => {
        try {
            const data = await apiService.fetchMessOffRequests(token);
            setRequests(data);
        } catch (error) {
            console.error('Error refreshing requests:', error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center mb-2">
                <div className="p-3 bg-indigo-50 rounded-2xl mr-4 border border-indigo-100">
                    <CalendarOff className="text-indigo-600" size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mess Leave</h1>
                    <p className="text-slate-500 mt-1 font-medium">Apply for leave and track your application status</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"> 
                <div className="lg:col-span-5 lg:sticky lg:top-8">
                    <MessOffForm token={token} onSubmitSuccess={refreshRequests} /> 
                </div>
                <div className="lg:col-span-7">
                    <MessOffStatus requests={requests} loading={loading} /> 
                </div>
            </div> 
        </div>
    );
};

const MessOffForm = ({ token, onSubmitSuccess }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [meals, setMeals] = useState([]);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleMealToggle = (meal) => { 
        setMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]); 
    };

    const handleSubmit = async () => {
        if (!fromDate || !toDate || meals.length === 0) { 
            alert('Please fill in all required fields'); 
            return; 
        }
        setSubmitting(true);
        try {
            await apiService.submitMessOff(token, { fromDate, toDate, meals, reason });
            // Custom toast notification could go here
            alert('Mess off application submitted successfully!');
            setFromDate(''); 
            setToDate(''); 
            setMeals([]); 
            setReason('');
            if (onSubmitSuccess) onSubmitSuccess();
        } catch (error) {
            alert(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-200/40 p-8 border border-slate-100 relative overflow-hidden"> 
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none"></div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center relative z-10">
                <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
                New Application
            </h2>
            
            <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4"> 
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">From</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"/>
                    </div> 
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">To</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700"/>
                    </div> 
                </div> 

                <div className="space-y-3"> 
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Select Meals to Skip</label> 
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> 
                        {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                            <label key={meal} className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${meals.includes(meal) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-500'}`}>
                                <input type="checkbox" checked={meals.includes(meal)} onChange={() => handleMealToggle(meal)} className="hidden"/>
                                <span className={`font-bold text-sm ${meals.includes(meal) ? 'text-indigo-700' : 'text-slate-600'}`}>{meal}</span>
                                {meals.includes(meal) && <CheckCircle size={14} className="mt-1 text-indigo-500" />}
                            </label>
                        ))}
                    </div> 
                </div> 

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Reason <span className="font-normal text-slate-400 normal-case">(Optional)</span></label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700 resize-none" rows="3" placeholder="e.g. Going home for weekend..."></textarea>
                </div> 

                <button 
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    className="w-full mt-2 bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>Processing...</> : <>Submit Application <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} strokeWidth={3} /></>}
                </button>
            </div>
        </div>
    );
};

const MessOffStatus = ({ requests, loading }) => {
    const getStatusStyle = (status) => {
        const styles = {
            'Approved': { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: <CheckCircle size={14} strokeWidth={3} className="text-emerald-500" /> },
            'Pending': { bg: 'bg-amber-50 text-amber-700 ring-amber-100', icon: <Clock size={14} strokeWidth={3} className="text-amber-500" /> },
            'Rejected': { bg: 'bg-rose-50 text-rose-700 ring-rose-100', icon: <XCircle size={14} strokeWidth={3} className="text-rose-500" /> },
        };
        return styles[status] || { bg: 'bg-slate-50 text-slate-700 ring-slate-100', icon: null };
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"> 
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <span className="w-1 h-6 bg-slate-200 rounded-full mr-3"></span>
                    Application History
                </h2>
                <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    {requests.length} Records
                </div>
            </div>
            
            <div className="p-2">
                {loading ? (
                    <LoadingSpinner message="Loading applications..." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Dates</th>
                                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Meals</th>
                                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {requests.length > 0 ? requests.map((req, index) => { 
                                    const style = getStatusStyle(req.status); 
                                    return (
                                        <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{req.fromDate || req.from}</span>
                                                    <span className="text-xs font-medium text-slate-400 mt-1">to {req.toDate || req.to}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(req.meals) ? req.meals : [req.meals]).map((m, i) => (
                                                        <span key={i} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ring-1 ring-inset ${style.bg} ${style.ring}`}>
                                                    {style.icon}{req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-16">
                                            <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                                                <FileText size={32} className="text-slate-300"/>
                                            </div>
                                            <p className="text-slate-500 font-medium">No application history found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [token, setToken] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePage, setActivePage] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop sidebar

    // Check if user is logged in as student (redirect munshi to munshi dashboard)
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        const storedRole = localStorage.getItem('authRole');

        if (storedRole === 'munshi') {
            window.location.href = '/munshi/dashboard';
            return;
        }

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setStudent(userData.student);
                setToken(storedToken);
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                localStorage.removeItem('authRole');
                window.location.href = '/login';
            }
        } else {
            window.location.href = '/login';
        }

        setInitialLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authRole');
        sessionStorage.removeItem('authUser');
        setStudent(null);
        setToken(null);
        window.location.href = '/login';
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-slate-50">
                <LoadingSpinner message="Initializing dashboard..." />
            </div>
        );
    }

    if (!student || !token) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Connection Issues</h3>
                    <p className="text-slate-500 text-sm mb-6">We're having trouble loading your data. Please check your connection.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform">Retry Connection</button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activePage) {
            case 'home': 
                return <StudentHome student={student} token={token} />;
            case 'reports': 
                return <StudentReports mealHistory={student.mealHistory || []} studentName={student.name} token={token} />;
            case 'messOff': 
                return <MessOffPage studentName={student.name} token={token} />;
            case 'feedback': 
                return <StudentFeedback token={token} />;
            default: 
                return <StudentHome student={student} token={token} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`bg-white w-80 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:${desktopSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-out z-50 shadow-2xl shadow-slate-200/50 flex flex-col border-r border-slate-100`}>
                <div className="p-8 pb-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                                <UtensilsCrossed size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">NITJ MESS</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Portal</p>
                            </div>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                            <X size={24} />
                        </button>
                        {/* Desktop Close Button */}
                        <button onClick={() => setDesktopSidebarOpen(false)} className="hidden md:block p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Profile Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                             <img src={student.photo || "https://ui-avatars.com/api/?name=" + student.name} alt={student.name} className="w-full h-full object-cover"/>
                        </div>
                        <div className="relative min-w-0">
                            <h3 className="font-bold text-slate-800 truncate text-sm">{student.name}</h3>
                            <p className="text-xs text-slate-500 font-medium truncate">{student.email}</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto">
                        <ul className="space-y-1">
                            <div className="px-4 mb-2 mt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                            </div>
                            <NavItem 
                                icon={<Home />} 
                                text="Dashboard" 
                                active={activePage === 'home'} 
                                onClick={() => { setActivePage('home'); setIsSidebarOpen(false); }} 
                            />
                            <NavItem 
                                icon={<BarChart2 />} 
                                text="Reports" 
                                active={activePage === 'reports'} 
                                onClick={() => { setActivePage('reports'); setIsSidebarOpen(false); }} 
                            />
                            <NavItem 
                                icon={<CalendarOff />} 
                                text="Mess Off" 
                                active={activePage === 'messOff'} 
                                onClick={() => { setActivePage('messOff'); setIsSidebarOpen(false); }} 
                            />
                            <div className="px-4 mb-2 mt-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Support</p>
                            </div>
                            <NavItem 
                                icon={<MessageSquare />} 
                                text="Feedback" 
                                active={activePage === 'feedback'} 
                                onClick={() => { setActivePage('feedback'); setIsSidebarOpen(false); }} 
                            />
                        </ul>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm group"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                        <p className="text-center text-[10px] text-slate-300 mt-4 font-semibold uppercase tracking-widest">v2.5.0 • NITJ MESS</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-auto bg-slate-50 relative w-full transition-all duration-300 ease-in-out ${desktopSidebarOpen ? 'md:ml-80' : 'md:ml-0'}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         {/* Desktop Menu Toggle */}
                         <button onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} className="hidden md:block p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Menu size={24} />
                         </button>
                         {/* Mobile Menu Toggle */}
                         <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                            <Menu size={24} />
                         </button>

                         <div className="flex items-center gap-3 md:hidden">
                             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                <span className="font-bold text-sm">NM</span>
                             </div>
                             <h1 className="font-bold text-slate-800">NITJ MESS</h1>
                        </div>
                        
                        <div className="hidden md:block">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
                                {activePage === 'messOff' ? 'Mess Leave Application' : activePage}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">{student.rollNo}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                <img src={student.photo || "https://ui-avatars.com/api/?name=" + student.name} alt="Profile" className="w-full h-full object-cover"/>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto pb-20">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;