import React, { useState } from "react";
import HeroSection from "./herosection.jsx";

const menuItems = [
  { name: "Paneer Masala", desc: "Rich and creamy cottage cheese curry.", price: 60, type: "Dinner", color: "bg-red-500" },
  { name: "Veg Biryani", desc: "Fragrant rice with vegetables.", price: 80, type: "Lunch", color: "bg-orange-500" },
  { name: "Aloo Paratha", desc: "Wheat bread with spiced potatoes.", price: 40, type: "Breakfast", color: "bg-yellow-400" },
  { name: "Gulab Jamun", desc: "Soft fried dough balls in syrup.", price: 25, type: "Snacks", color: "bg-green-500" },
  { name: "Masala Dosa", desc: "Crispy crepe with potato filling.", price: 40, type: "Breakfast", color: "bg-teal-500" },
  { name: "Samosa", desc: "Crispy pastry with chickpeas.", price: 20, type: "Snacks", color: "bg-sky-500" },
  { name: "Rajma Chawal", desc: "Kidney beans curry with rice.", price: 70, type: "Lunch", color: "bg-purple-500" },
  { name: "Poha", desc: "Flattened rice cooked with spices.", price: 30, type: "Breakfast", color: "bg-pink-500" },
  { name: "Vada Pav", desc: "Spicy potato fritter in a bun.", price: 25, type: "Snacks", color: "bg-indigo-500" },
  { name: "Dal Makhani", desc: "Creamy black lentil curry.", price: 65, type: "Dinner", color: "bg-blue-500" },
  { name: "Chai", desc: "Indian spiced tea.", price: 15, type: "Snacks", color: "bg-lime-500" },
  { name: "Butter Chicken", desc: "Creamy tomato-based chicken curry.", price: 90, type: "Dinner", color: "bg-rose-500" },
];

export default function Home() {
  const [filter, setFilter] = useState("All");

  const filteredItems =
    filter === "All"
      ? menuItems
      : menuItems.filter((item) => item.type === filter);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-center items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm font-medium mr-2">Filter by:</span>
          {["All", "Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === type
                  ? "bg-sky-500 text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, i) => (
            <div
              key={i}
              className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700"
            >
              <div className={`h-44 ${item.color} relative`}>
                <div className="absolute top-4 right-4 bg-black/40 px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{item.desc}</p>

                <div className="pt-4 border-t border-slate-700">
                  <span className="text-3xl font-bold text-sky-400">
                    ₹{item.price}.00
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
