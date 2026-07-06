const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export const munshiApi = {
  async lookupStudent(query) {
    const res = await fetch(
      `${API_BASE}/munshi/student/lookup?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Student lookup failed");
    return data.data;
  },

  async getMenu(day) {
    const url = day 
        ? `${API_BASE}/munshi/menu/current?day=${encodeURIComponent(day)}`
        : `${API_BASE}/munshi/menu/current`;
        
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch menu");
    return data.data;
  },

  async saveWeeklyMenu(formData) {
    const res = await fetch(`${API_BASE}/munshi/menu/weekly`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}` 
        // Do NOT set Content-Type here, let browser set it with boundary for FormData
      },
      body: formData,
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to save weekly menu");
      return data;
    } catch (e) {
      console.error("Save Weekly Menu API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 200)}...`);
    }
  },

  async addMealItem(payload) {
    let body;
    let headers = getAuthHeaders();

    if (payload instanceof FormData) {
      body = payload;
      const { "Content-Type": ct, ...restHeaders } = headers;
      headers = restHeaders;
    } else {
      body = JSON.stringify(payload);
    }

    const res = await fetch(`${API_BASE}/munshi/menu/item`, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add meal");
    return data.data;
  },

  async deleteMealItem(mealType, itemId) {
    // Using POST instead of DELETE to avoid potential method blocking/handling issues
    const res = await fetch(
      `${API_BASE}/munshi/menu/delete-item/${mealType}/${itemId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok)
        throw new Error(data.message || "Failed to delete meal item");
      return data;
    } catch (e) {
      console.error("Delete API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 100)}...`);
    }
  },

  async updateMealItem(mealType, itemId, updates) {
    const res = await fetch(
      `${API_BASE}/munshi/menu/item/${mealType}/${itemId}`,
      {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      },
    );
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok)
        throw new Error(data.message || "Failed to update meal item");
      return data;
    } catch (e) {
      console.error("Update API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 100)}...`);
    }
  },

  async createOrder(studentId, items, mealType, dietCount) {
    const res = await fetch(`${API_BASE}/munshi/order`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        studentId,
        items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        mealType,
        dietCount, 
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create order");
    return data.data;
  },

  async getOrders(params = {}) {
    const sp = new URLSearchParams(params).toString();
    const url = sp
      ? `${API_BASE}/munshi/orders?${sp}`
      : `${API_BASE}/munshi/orders`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
    return data; // Returns { success, data: [], pagination: {} }
  },

  async getMessOffRequests() {
    const res = await fetch(`${API_BASE}/mess-off/all`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.message || "Failed to fetch mess-off requests");
    return data.data;
  },

  async updateMessOffStatus(requestId, status) {
    const res = await fetch(`${API_BASE}/mess-off/${requestId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update request");
    return data.data;
  },

  async getStudentsForBill(month) {
    const res = await fetch(
      `${API_BASE}/munshi/students-for-bill?month=${encodeURIComponent(month)}`,
      { headers: getAuthHeaders() },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data.data;
  },

  async generateBill(month, dietRate, billItems) {
    const res = await fetch(`${API_BASE}/munshi/generate-bill`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ month, dietRate, billItems }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to generate bill");
    }

    const blob = await res.blob();
    return blob;
  },

  async getAllStudents() {
    const res = await fetch(`${API_BASE}/munshi/all-students`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },

  async verifyStudent(studentId, action) {
    const res = await fetch(`${API_BASE}/munshi/verify-student`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId, action }),
    });
    if (!res.ok) throw new Error("Failed to verify student");
    return res.json();
  },

  async addBillCharge(payload) {
    const res = await fetch(`${API_BASE}/munshi/bill/add-charge`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.message || "Failed to add bill charge");
      return data;
    } catch (e) {
      console.error("Add Bill Charge API Error:", text);
      throw new Error(`Server returned error: ${text.substring(0, 200)}...`);
    }
  },

  async getStudentsForDateRange(fromDate, toDate) {
    const res = await fetch(
      `${API_BASE}/munshi/students-for-daterange?fromDate=${fromDate}&toDate=${toDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch students");
    return data.data;
  },

  async generateBillForDateRange(fromDate, toDate, dietRate, billItems) {
    const res = await fetch(`${API_BASE}/munshi/generate-bill-daterange`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ fromDate, toDate, dietRate, billItems }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to generate bill");
    }

    const blob = await res.blob();
    return blob;
  },

  async getBillHistory() {
    const res = await fetch(`${API_BASE}/munshi/bill-history`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch bill history");
    return data.data;
  },

  async deleteBillRecord(id) {
    const res = await fetch(`${API_BASE}/munshi/bill-history/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete bill record");
    return data.data;
  },
  
  async getExtraItems() {
    const res = await fetch(`${API_BASE}/munshi/extra-items`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch extra items");
    return data.data;
  },
  async addExtraItem(itemData) {
    let body;
    let headers = getAuthHeaders();

    if (itemData instanceof FormData) {
      body = itemData;
      // When sending FormData, let the browser set the Content-Type with the boundary
      const { "Content-Type": ct, ...restHeaders } = headers; 
      headers = restHeaders;
    } else {
      body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/extra-items/add`, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add extra item");
    return data.data;
  },
  async deleteExtraItem(id) {
    const res = await fetch(`${API_BASE}/extra-items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete extra item");
    return data;
  },
  async updateExtraItem(id, itemData) {
    let body;
    let headers = getAuthHeaders();

    if (itemData instanceof FormData) {
      body = itemData;
      const { "Content-Type": ct, ...restHeaders } = headers;
      headers = restHeaders;
    } else {
      body = JSON.stringify(itemData);
    }

    const res = await fetch(`${API_BASE}/extra-items/${id}`, {
      method: "PUT",
      headers: headers,
      body: body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update extra item");
    return data.data;
  },

  async getSessionStats(mealType) {
    const res = await fetch(`${API_BASE}/munshi/session-stats?mealType=${mealType}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch session stats");
    return data.data;
  },

  async enableMessOn(studentId) {
    const res = await fetch(`${API_BASE}/munshi/mess-on`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to enable mess");
    return data;
  },

  async addFine(studentId, amount, reason) {
    const res = await fetch(`${API_BASE}/munshi/fine`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId, amount, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add fine");
    return data;
  },

  async bulkRecordDiet(mealType, studentIds) {
    const res = await fetch(`${API_BASE}/munshi/bulk-diet-record`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ mealType, studentIds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to bulk record diet");
    return data;
  },

  async deleteOrder(orderId) {
    const res = await fetch(`${API_BASE}/munshi/orders/${orderId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete order");
    return data;
  },
};
