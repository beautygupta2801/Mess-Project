// import React, { useState, useEffect } from 'react';
// import { CalendarOff, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
// import { apiService } from './mockStudentData';

// export const MessOff = ({ token }) => {
//     const [requests, setRequests] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [form, setForm] = useState({ from: '', to: '', meals: [] });

//     useEffect(() => {
//         apiService.fetchMessOffRequests(token).then(data => {
//             setRequests(data);
//             setLoading(false);
//         });
//     }, [token]);

//     const handleToggleMeal = (meal) => {
//         setForm(prev => ({
//             ...prev,
//             meals: prev.meals.includes(meal) ? prev.meals.filter(m => m !== meal) : [...prev.meals, meal]
//         }));
//     };

//     const handleSubmit = async () => {
//         if (!form.from || !form.to || form.meals.length === 0) return alert("Fill all fields");
//         await apiService.submitMessOff(token, form);
//         alert("Application Submitted!");
//     };

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//                 <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><CalendarOff className="mr-2 text-blue-600" /> Apply Leave</h2>
//                 <div className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                         <input type="date" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, from: e.target.value})} />
//                         <input type="date" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, to: e.target.value})} />
//                     </div>
//                     <div className="flex gap-2">
//                         {['Breakfast', 'Lunch', 'Dinner'].map(m => (
//                             <button key={m} onClick={() => handleToggleMeal(m)} className={`px-4 py-2 rounded-full border text-sm font-bold ${form.meals.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}>{m}</button>
//                         ))}
//                     </div>
//                     <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center hover:bg-blue-700 transition-colors">Submit Request <ChevronRight size={18} className="ml-2"/></button>
//                 </div>
//             </div>

//             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//                 <h2 className="text-xl font-bold mb-6 text-gray-800">History</h2>
//                 <div className="space-y-4">
//                     {requests.map((r, i) => (
//                         <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
//                             <div>
//                                 <p className="text-sm font-bold text-gray-700">{r.from} to {r.to}</p>
//                                 <p className="text-xs text-gray-400">{r.meals.join(', ')}</p>
//                             </div>
//                             <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                                 {r.status === 'Approved' ? <CheckCircle size={12}/> : <Clock size={12}/>} {r.status}
//                             </span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MessOff;