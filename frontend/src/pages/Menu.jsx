import React, { useState, useEffect, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FALLBACK_HOSTELS = {
  boys: ["MBH", "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7"],
  girls: ["GH-1", "GH-2", "MGH-1", "MGH-2"],
};

export default function Menu() {
  const [hostelType, setHostelType] = useState("boys");
  const [selectedHostel, setSelectedHostel] = useState(FALLBACK_HOSTELS.boys[0]);
  const [menuPage, setMenuPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hostelData = useMemo(() => {
    return {
      boys:
        menuPage?.hostels?.boys?.length > 0
          ? menuPage.hostels.boys
          : FALLBACK_HOSTELS.boys,
      girls:
        menuPage?.hostels?.girls?.length > 0
          ? menuPage.hostels.girls
          : FALLBACK_HOSTELS.girls,
    };
  }, [menuPage]);

  useEffect(() => {
    let cancelled = false;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/menu/public?hostel=${encodeURIComponent(selectedHostel)}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (!json.success || !json.data) {
          setError(json.message || "Invalid response");
          setMenuPage(null);
          return;
        }

        setMenuPage(json.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load menu");
          setMenuPage(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (selectedHostel) {
      fetchMenu();
    }

    return () => {
      cancelled = true;
    };
  }, [selectedHostel]);

  const handleHostelTypeChange = (type) => {
    setHostelType(type);
    const list =
      type === "boys"
        ? hostelData.boys
        : hostelData.girls;

    setSelectedHostel(list[0] || "");
  };

  const renderMealList = (title, items) => (
    <div className="mt-4 first:mt-0">
      <h3 className="text-lg font-semibold text-sky-800 uppercase tracking-wide border-b border-gray-200 pb-1">
        {title}
      </h3>
      <ul className="mt-2 text-gray-700 text-sm list-disc list-inside">
        {(items || []).length > 0 ? (
          items.map((item, index) => (
            <li key={index} className="capitalize">
              {String(item).toLowerCase()}
            </li>
          ))
        ) : (
          <li className="list-none text-gray-400 italic">Not set</li>
        )}
      </ul>
    </div>
  );

  const renderItemCard = (meal) => (
    <div
      key={meal.name}
      className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition"
    >
      <h2 className="bg-teal-600 text-white text-xl font-bold p-4 text-center">
        {meal.name}
      </h2>
      <ul className="p-5 text-gray-700 list-disc list-inside text-left">
        {(meal.items || []).length > 0 ? (
          meal.items.map((item, index) => (
            <li key={index} className="capitalize">
              {String(item).toLowerCase()}
            </li>
          ))
        ) : (
          <li className="list-none text-gray-400 italic">No items</li>
        )}
      </ul>
    </div>
  );

  const weeklyMenu = menuPage?.weeklyMenu || [];
  const dailyItems = menuPage?.dailyItems || [];
  const extraItems = menuPage?.extraItems || [];

  return (
    <div className="p-8 max-w-7xl mx-auto bg-sky-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-sky-800 mb-4">
        Weekly Mess Menu
      </h1>

      <div className="mb-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleHostelTypeChange("boys")}
            className={`px-12 py-4 text-xl font-bold rounded-xl transition-all ${
              hostelType === "boys"
                ? "bg-blue-600 text-white shadow-xl scale-105"
                : "bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-600 hover:shadow-lg"
            }`}
          >
            Boys Hostel
          </button>
          <button
            onClick={() => handleHostelTypeChange("girls")}
            className={`px-12 py-4 text-xl font-bold rounded-xl transition-all ${
              hostelType === "girls"
                ? "bg-pink-600 text-white shadow-xl scale-105"
                : "bg-white text-pink-600 border-2 border-pink-300 hover:border-pink-600 hover:shadow-lg"
            }`}
          >
            Girls Hostel
          </button>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-lg font-semibold text-sky-800 mb-4 text-center">
          Select Your Hostel
        </label>
        <div className="flex flex-wrap justify-center gap-4">
          {(hostelData[hostelType] || []).map((hostel) => (
            <button
              key={hostel}
              onClick={() => setSelectedHostel(hostel)}
              className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all ${
                selectedHostel === hostel
                  ? "bg-sky-700 text-white shadow-lg scale-105"
                  : "bg-white text-sky-700 border-2 border-sky-300 hover:border-sky-600 hover:shadow-md"
              }`}
            >
              {hostel}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center mb-8">
        <span className="inline-block bg-sky-700 text-white px-6 py-2 rounded-full text-xl font-bold">
          {selectedHostel || "Menu"} Menu
        </span>
      </div>

      {loading && (
        <div className="text-center mb-8">
          <div className="inline-block w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sky-800 font-semibold">Loading menu...</p>
        </div>
      )}

      {error && (
        <div className="text-center max-w-md mx-auto mb-8">
          <p className="text-red-600 font-semibold mb-2">Could not load menu</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weeklyMenu.map((day) => (
              <div
                key={day.day}
                className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition"
              >
                <h2 className="text-2xl font-bold text-center text-white bg-sky-700 p-4">
                  {day.day}
                </h2>
                <div className="p-6">
                  {renderMealList("Breakfast", day.breakfast)}
                  {renderMealList("Lunch", day.lunch)}
                  {renderMealList("Snacks", day.snacks)}
                  {renderMealList("Dinner", day.dinner)}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-center text-sky-800 mt-16 mb-8">
            Daily Available Items
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {dailyItems.map(renderItemCard)}
          </div>

          <h2 className="text-3xl font-bold text-center text-sky-800 mt-16 mb-8">
            Extra Items (Paid)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {extraItems.length === 0 ? (
  <p className="text-gray-400">No items</p>
) : (
      extraItems.map((item) => (
        <div key={item._id} className="bg-white shadow-xl rounded-2xl p-5">
          <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
          <p className="text-slate-600 font-semibold mt-2">₹{item.price}</p>
        </div>
      ))
    )}
          </div>
        </>
      )}
    </div>
  );
}