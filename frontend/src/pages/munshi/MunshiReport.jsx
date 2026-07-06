import React, { useState } from 'react';
import { Download, DollarSign, ShoppingBag, TrendingUp, Search, Calendar, Filter, UtensilsCrossed, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Reusing UI Components locally to avoid import issues if they aren't exported
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30',
    secondary: 'bg-white text-slate-700 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30',
  };
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

// Helper to safely get diet count
const getDietCount = (order) => {
  if (order.dietCount !== undefined) return order.dietCount;
  // Fallback for old data: 
  // If it's snacks, 0 diets. Otherwise 1 diet.
  return order.mealType === 'snacks' ? 0 : 1;
};

const ReportsPage = ({ orders = [], onOrderDeleted, currentPage = 1, totalPages = 1, onPageChange }) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth().toString());
  const [selectedDay, setSelectedDay] = useState(today.getDate().toString());
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Date Filters
    if (selectedMonth !== 'all' || selectedDay !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        const orderMonth = orderDate.getMonth(); // 0-11
        const orderDay = orderDate.getDate(); // 1-31

        const monthMatch = selectedMonth === 'all' || orderMonth === parseInt(selectedMonth);
        const dayMatch = selectedDay === 'all' || orderDay === parseInt(selectedDay);

        return monthMatch && dayMatch;
      });
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const studentName = order.studentName || '';
        const roomNo = order.studentRoomNo || '';
        const rollNo = order.studentRollNo || '';
        const id = order.id || '';
        
        return (
          studentName.toLowerCase().includes(q) ||
          roomNo.toLowerCase().includes(q) ||
          rollNo.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q)
        );
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  
  const totalSales = filteredOrders.reduce((total, order) => total + order.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const totalDiets = filteredOrders.reduce((total, order) => total + getDietCount(order), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  const handleDownloadPdf = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Mess Sales Report', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    // Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Total Sales: Rs ${totalSales}`, 14, 50);
    doc.text(`Total Orders: ${totalOrders}`, 70, 50);
    doc.text(`Total Diets: ${totalDiets}`, 120, 50); // Added Total Diets
    doc.text(`Avg Value: Rs ${avgOrderValue}`, 160, 50);

    // Table
    const tableColumn = ["Date", "Student Name", "Room", "Meal", "Diet", "Items", "Total"];
    const tableRows = [];

    filteredOrders.forEach(order => {
      const diet = getDietCount(order);
      const dietText = diet > 0 ? diet.toString() : "-";
      
      const tableRow = [
        new Date(order.date).toLocaleDateString('en-IN'),
        order.studentName || 'Unknown',
        order.studentRoomNo || '-',
        order.mealType ? order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1) : '-',
        dietText,
        order.items.length > 0 ? order.items.map(i => `${i.name} (x${i.qty || 1})`).join(', ') : (diet > 0 ? "Diet Only" : "-"),
        `Rs ${order.totalAmount}`
      ];
      tableRows.push(tableRow);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        4: { halign: 'center' }, // Center Diet column
        6: { halign: 'right' }   // Right align Total column
      }
    });

    doc.save(`mess_report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      try {
        if (onOrderDeleted) {
           await onOrderDeleted(orderId);
        }
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Sales</p>
            <div className="flex items-center gap-2 md:gap-3">
               <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">₹{totalSales}</span>
               <div className="p-1.5 md:p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <DollarSign size={20} className="md:w-6 md:h-6" />
               </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Orders</p>
             <div className="flex items-center gap-2 md:gap-3">
               <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">{totalOrders}</span>
               <div className="p-1.5 md:p-2 bg-blue-50 rounded-xl text-blue-600">
                  <ShoppingBag size={20} className="md:w-6 md:h-6" />
               </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Diets</p>
             <div className="flex items-center gap-2 md:gap-3">
               <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">{totalDiets}</span>
               <div className="p-1.5 md:p-2 bg-orange-50 rounded-xl text-orange-600">
                  <UtensilsCrossed size={20} className="md:w-6 md:h-6" />
               </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Order Value</p>
             <div className="flex items-center gap-2 md:gap-3">
               <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">₹{avgOrderValue}</span>
               <div className="p-1.5 md:p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <TrendingUp size={20} className="md:w-6 md:h-6" />
               </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 md:p-8 overflow-visible min-h-[500px]">
        <div className="bg-white/95 backdrop-blur-xl -mx-4 -mt-4 p-4 md:-mx-6 md:-mt-6 md:p-6 mb-0 rounded-t-3xl shadow-sm border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6 transition-all duration-300">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sales Report</h2>
            <p className="text-slate-500 text-sm">View and analyze transaction history</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search student, room..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all w-full md:w-64"
                />
             </div>

             {/* Filters */}
             <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                   <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="pl-10 pr-8 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm hover:border-slate-200 cursor-pointer text-sm min-w-[140px]"
                   >
                      <option value="all">All Months</option>
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                      ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Filter size={14} />
                   </div>
                </div>

                <div className="relative group">
                   <select 
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="pl-4 pr-8 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 appearance-none shadow-sm hover:border-slate-200 cursor-pointer text-sm min-w-[100px]"
                   >
                      <option value="all">All Days</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Filter size={14} />
                   </div>
                </div>
            </div>

            <Button onClick={handleDownloadPdf} variant="success" icon={Download} className="md:w-auto w-full">
              Export PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full">
            <thead className="bg-slate-50 shadow-sm transition-[top] duration-300">
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Date</th>
                <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Student</th>
                <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Room</th>
                <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Meal</th>
                <th className="text-center py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Diet</th>
                <th className="text-left py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider w-1/3 bg-slate-50">Items</th>
                <th className="text-right py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Total</th>
                <th className="text-center py-4 px-6 font-bold text-slate-500 text-xs uppercase tracking-wider bg-slate-50">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const diet = getDietCount(order);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-600">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <div className="text-xs text-slate-400 font-normal">
                           {new Date(order.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{order.studentName}</div>
                          <div className="text-xs text-slate-400 font-medium">#{order.studentRollNo || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
                              {order.studentRoomNo || '-'}
                          </span>
                      </td>
                      <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${
                              order.mealType === 'breakfast' ? 'bg-orange-50 text-orange-600' :
                              order.mealType === 'lunch' ? 'bg-yellow-50 text-yellow-600' :
                              order.mealType === 'snacks' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-indigo-50 text-indigo-600'
                          }`}>
                              {order.mealType}
                          </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                          {diet > 0 ? (
                              <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-bold border border-orange-100">
                                {diet}
                              </span>
                          ) : (
                              <span className="text-slate-300 font-bold">-</span>
                          )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600 font-medium">
                        <div className="text-sm text-slate-600 font-medium">
                          {(() => {
                            const itemStrings = order.items.map(i => `${i.name}${i.qty > 1 ? ` (x${i.qty})` : ''}`);
                            const hasExplicitDietItem = order.items.some(i => i.name.toLowerCase().includes('diet'));
                            
                            if (diet > 0 && !hasExplicitDietItem) {
                                // Add Standard Diet only if no explicit diet item exists
                                itemStrings.unshift(`Standard Diet (x${diet})`);
                            }
                            return itemStrings.length > 0 ? itemStrings.join(', ') : '-';
                          })()}
                        </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                          <span className="font-bold text-slate-800">₹{order.totalAmount}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDelete(order.id || order._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                     <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Filter size={20} />
                        </div>
                        <p>No orders found matching your criteria</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2 pt-4 border-t border-slate-100">
            <div className="text-sm text-slate-500 font-medium">
              Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`py-1.5 px-3 text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`py-1.5 px-3 text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;