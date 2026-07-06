const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

export const clerkApi = {
  // ================= MENU =================
  getMenu: async () => {
    const res = await fetch(`${API_BASE}/clerk/menu/current`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch menu");
    return data;
  },

  saveWeeklyMenu: async (weeklyMenu) => {
    const res = await fetch(`${API_BASE}/clerk/menu/save`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ weeklyMenu }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save menu");
    return data;
  },

  // ================= EXTRA ITEMS =================
  getExtraItems: async () => {
    const res = await fetch(`${API_BASE}/clerk/extra-items`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch extra items");
    return data.data || data;
  },

  addExtraItem: async (name, price) => {
  const res = await fetch(`${API_BASE}/clerk/extra-items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, price }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add extra item");
  return data;
},

  deleteExtraItem: async (id) => {
    const res = await fetch(`${API_BASE}/clerk/extra-items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete extra item");
    return data;
  },

  // ================= STUDENTS =================
  getAllStudents: async () => {
    const res = await fetch(`${API_BASE}/clerk/all-students`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data.data;
  },
  
  verifyStudent: async (studentId, action) => {
    const res = await fetch(`${API_BASE}/clerk/verify-student`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId, action }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed");
    return data;
  },

  // ================= BILL (MONTH) =================
  getStudentsForBill: async (month) => {
    const res = await fetch(
      `${API_BASE}/clerk/students-for-bill?month=${month}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data.data;
  },

  generateBill: async (month, dietRate, billItems) => {
    const res = await fetch(`${API_BASE}/clerk/generate-bill`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ month, dietRate, billItems }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to generate bill");
    }

    return await res.blob();
  },

  // ================= BILL (DATE RANGE) =================
  getStudentsForDateRange: async (fromDate, toDate) => {
    const res = await fetch(
      `${API_BASE}/clerk/students-for-daterange?fromDate=${fromDate}&toDate=${toDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data.data;
  },

  generateBillForDateRange: async (fromDate, toDate, dietRate, billItems) => {
    const res = await fetch(`${API_BASE}/clerk/generate-bill-daterange`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ fromDate, toDate, dietRate, billItems }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to generate bill");
    }

    return await res.blob();
  },

  // ================= BILL HISTORY =================
  getBillHistory: async () => {
    const res = await fetch(`${API_BASE}/clerk/bill-history`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch bill history");
    return data.data;
  },

  deleteBillRecord: async (id) => {
    const res = await fetch(`${API_BASE}/clerk/bill-history/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete bill record");
    return data;
  },
  // ================= MEAL RATE =================
getMealRate: async () => {
  const res = await fetch(`${API_BASE}/clerk/meal-rate`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch meal rate");
  return data.data;
},

saveMealRate: async (rate) => {
  const res = await fetch(`${API_BASE}/clerk/meal-rate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ rate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save meal rate");
  return data;
},
};