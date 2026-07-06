// import React, { useState, useEffect } from 'react';
// import { DollarSign, UtensilsCrossed, Activity, AlertCircle, QrCode, Download, MessageSquare, CalendarOff, Calendar, ChevronRight } from 'lucide-react';
// import { apiService } from './mockStudentData';
// import Reports from './Reports';

// const LoadingSpinner = () => (
//     <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
// );

// export const DashboardHome = ({ student, token }) => {
//     const [mealHistory, setMealHistory] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         apiService.fetchMealHistory(token).then(data => {
//             setMealHistory(data.slice(0, 5));
//             setLoading(false);
//         });
//     }, [token]);

//     const stats = [
//         { label: 'Total Bill', value: `₹${student.bill}`, icon: <DollarSign />, grad: 'from-blue-500 to-blue-600' },
//         { label: 'Total Meals', value: student.mealCount, icon: <UtensilsCrossed />, grad: 'from-green-500 to-emerald-600' },
//         { label: 'Avg/Meal', value: `₹${(student.bill / student.mealCount).toFixed(2)}`, icon: <Activity />, grad: 'from-purple-500 to-purple-600' },
//         { label: 'Fines', value: `₹${student.fines}`, icon: <AlertCircle />, grad: 'from-red-500 to-red-600' }
//     ];

//     return (
//         <div className="space-y-8">
//             <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl overflow-hidden">
//                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
//                     <div>
//                         <h1 className="text-3xl font-bold">Welcome back, {student.name.split(' ')[0]}! 👋</h1>
//                         <p className="text-blue-100 mt-2">ID: {student.rollNo} • {student.hostelNo}</p>
//                     </div>
//                     <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center">
//                         <p className="text-xs uppercase tracking-wider">Room No</p>
//                         <p className="text-2xl font-bold">{student.roomNo}</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {stats.map((s, i) => (
//                     <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//                         <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center mb-4 shadow-lg`}>{s.icon}</div>
//                         <p className="text-gray-500 text-sm font-medium">{s.label}</p>
//                         <p className="text-2xl font-bold text-gray-900">{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 <div className="lg:col-span-2">
//                     {loading ? <LoadingSpinner /> : <Reports mealHistory={mealHistory} isSummary={true} />}
//                 </div>
//                 <div className="space-y-6">
//                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
//                         <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-center"><QrCode className="mr-2 text-blue-600" size={20}/> Mess QR</h3>
//                         <div className="bg-gray-50 p-4 rounded-xl inline-block border-2 border-dashed border-gray-200">
//                             <QrCode size={120} className="text-gray-800" />
//                         </div>
//                         <p className="mt-3 text-sm font-mono font-bold text-gray-500">{student.qrCode}</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DashboardHome;