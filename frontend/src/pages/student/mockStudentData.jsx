// // --- API SERVICE LAYER ---
// const API_BASE_URL = 'https://api.example.com'; 

// export const apiService = {
//   fetchMealHistory: async (token, month = null) => {
//     // Simulated delay
//     await new Promise(resolve => setTimeout(resolve, 800));
//     return [
//       { date: '2025-10-13', type: 'Breakfast', items: [{name: 'Paratha', qty: 2, price: 20}, {name: 'Curd', qty: 1, price: 10}] },
//       { date: '2025-10-12', type: 'Dinner', items: [{name: 'Roti', qty: 3, price: 5}, {name: 'Paneer Masala', qty: 1, price: 40}] },
//       { date: '2025-10-11', type: 'Lunch', items: [{name: 'Rice', qty: 1, price: 15}, {name: 'Dal', qty: 1, price: 20}] }
//     ];
//   },

//   fetchMessOffRequests: async (token) => {
//     return [
//       { from: '2025-12-20', to: '2025-12-25', meals: ['Breakfast', 'Dinner'], status: 'Approved' },
//       { from: '2025-12-28', to: '2025-12-30', meals: ['Lunch'], status: 'Pending' }
//     ];
//   },

//   submitMessOff: async (token, data) => {
//     console.log("Submitting Mess Off:", data);
//     return { success: true };
//   },

//   submitFeedback: async (token, data) => {
//     console.log("Submitting Feedback:", data);
//     return { success: true };
//   },

//   fetchMenu: async (token) => {
//     return {
//       breakfast: [{ name: 'Paratha' }, { name: 'Puri Sabzi' }],
//       lunch: [{ name: 'Rice & Dal' }, { name: 'Veg Thali' }],
//       dinner: [{ name: 'Roti & Paneer' }, { name: 'Chicken Curry' }],
//       snacks: [{ name: 'Samosa' }, { name: 'Tea' }]
//     };
//   },

//   downloadReport: async (token, month) => {
//     alert(`Downloading report for month: ${month}`);
//   }
// };