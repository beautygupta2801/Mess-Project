// import React, { useState } from 'react';
// import { BarChart2, Download, FileText } from 'lucide-react';
// import { apiService } from './mockStudentData';

// const Reports = ({ mealHistory, token, isSummary = false }) => {
//     const [downloading, setDownloading] = useState(false);

//     const handleDownload = async () => {
//         setDownloading(true);
//         await apiService.downloadReport(token, 'Current');
//         setDownloading(false);
//     };

//     return (
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//             <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
//                 <div className="flex items-center">
//                     <div className="p-2 bg-blue-600 rounded-lg mr-3 text-white"><BarChart2 size={20}/></div>
//                     <h2 className="font-bold text-gray-800">{isSummary ? "Recent Meals" : "Full History"}</h2>
//                 </div>
//                 {!isSummary && (
//                     <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50">
//                         <Download size={16}/> {downloading ? 'Exporting...' : 'Export PDF'}
//                     </button>
//                 )}
//             </div>
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                     <thead>
//                         <tr className="text-xs uppercase text-gray-400 font-bold border-b">
//                             <th className="p-4">Date</th>
//                             <th className="p-4">Type</th>
//                             <th className="p-4 text-right">Cost</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {mealHistory.map((meal, i) => (
//                             <tr key={i} className="hover:bg-gray-50/50 transition-colors">
//                                 <td className="p-4 text-sm text-gray-600">{meal.date}</td>
//                                 <td className="p-4">
//                                     <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{meal.type}</span>
//                                 </td>
//                                 <td className="p-4 text-right font-bold text-gray-900">
//                                     ₹{meal.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0)}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default Reports;