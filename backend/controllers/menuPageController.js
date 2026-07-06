const Menu = require("../models/menu");
const ExtraItem = require("../models/ExtraItem");

const DEFAULT_HOSTELS = {
  boys: ["MBH", "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7"],
  girls: ["GH-1", "GH-2", "MGH-1", "MGH-2"],
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MEAL_TYPES = ["breakfast", "lunch", "snacks", "dinner"];

function getHostelType(hostel) {
  const h = String(hostel || "").toUpperCase();
  if (h.startsWith("GH") || h.startsWith("MGH")) return "girls";
  return "boys";
}

function buildEmptyWeek() {
  return DAYS.map((day) => ({
    day,
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  }));
}

function normalizeWeeklyMenuInput(weeklyMenu) {
  if (!weeklyMenu || typeof weeklyMenu !== "object") {
    return buildEmptyWeek();
  }

  return DAYS.map((day) => ({
    day,
    breakfast: Array.isArray(weeklyMenu[day]?.breakfast)
      ? weeklyMenu[day].breakfast
      : [],
    lunch: Array.isArray(weeklyMenu[day]?.lunch)
      ? weeklyMenu[day].lunch
      : [],
    snacks: Array.isArray(weeklyMenu[day]?.snacks)
      ? weeklyMenu[day].snacks
      : [],
    dinner: Array.isArray(weeklyMenu[day]?.dinner)
      ? weeklyMenu[day].dinner
      : [],
  }));
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item) return null;

      if (typeof item === "string") {
        const name = item.trim();
        if (!name) return null;
        return {
          name,
          price: 0,
          image: "",
          isAvailable: true,
        };
      }

      const name = String(item.name || "").trim();
      if (!name) return null;

      return {
        name,
        price: Number(item.price || 0),
        image: item.image || item.existingImage || "",
        isAvailable: item.isAvailable !== false,
      };
    })
    .filter(Boolean);
}

function buildWeekFromDocs(menuDocs) {
  const weekMap = {
    Sunday: { day: "Sunday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Monday: { day: "Monday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Tuesday: { day: "Tuesday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Wednesday: { day: "Wednesday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Thursday: { day: "Thursday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Friday: { day: "Friday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Saturday: { day: "Saturday", breakfast: [], lunch: [], snacks: [], dinner: [] },
  };

  for (const doc of menuDocs) {
    if (!weekMap[doc.day]) continue;
    if (!MEAL_TYPES.includes(doc.mealType)) continue;

    weekMap[doc.day][doc.mealType] = Array.isArray(doc.items)
      ? doc.items.map((item) => ({
          name: item.name || "",
          price: item.price || 0,
          image: item.image || "",
          existingImage: item.image || "",
          isAvailable: item.isAvailable !== false,
        }))
      : [];
  }

  return DAYS.map((day) => weekMap[day]);
}

function buildPublicWeekFromDocs(menuDocs) {
  const weekMap = {
    Sunday: { day: "Sunday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Monday: { day: "Monday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Tuesday: { day: "Tuesday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Wednesday: { day: "Wednesday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Thursday: { day: "Thursday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Friday: { day: "Friday", breakfast: [], lunch: [], snacks: [], dinner: [] },
    Saturday: { day: "Saturday", breakfast: [], lunch: [], snacks: [], dinner: [] },
  };

  for (const doc of menuDocs) {
    if (!weekMap[doc.day]) continue;
    if (!MEAL_TYPES.includes(doc.mealType)) continue;

    weekMap[doc.day][doc.mealType] = Array.isArray(doc.items)
      ? doc.items
          .filter((item) => item.isAvailable !== false)
          .map((item) => item.name)
      : [];
  }

  return DAYS.map((day) => weekMap[day]);
}

async function saveMenuForHostel(hostel, weeklyMenu, actor) {
  const normalizedWeek = normalizeWeeklyMenuInput(weeklyMenu);
  const bulkOps = [];

  for (const dayEntry of normalizedWeek) {
    for (const mealType of MEAL_TYPES) {
      const items = sanitizeItems(dayEntry[mealType]);

      bulkOps.push({
        updateOne: {
          filter: {
            hostel,
            day: dayEntry.day,
            mealType,
          },
          update: {
            $set: {
              hostel,
              day: dayEntry.day,
              mealType,
              items,
              isAvailable: true,
              updatedBy: actor?._id || null,
              updatedByModel:
                actor?.role === "clerk"
                  ? "Clerk"
                  : actor?.role === "munshi"
                  ? "Munshi"
                  : null,
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (bulkOps.length) {
    await Menu.bulkWrite(bulkOps);
  }

  return await Menu.find({ hostel, isAvailable: true })
    .sort({ day: 1, mealType: 1 })
    .lean();
}

function formatExtraItemsForPublic(extraDocs) {
  return extraDocs
    .filter((item) => item.isAvailable !== false)
    .map((item) => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image || "",
      isAvailable: item.isAvailable !== false,
    }));
}

function formatExtraItemsForDashboard(extraDocs) {
  return extraDocs.map((item) => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image || "",
    isAvailable: item.isAvailable !== false,
  }));
}

// ================= CURRENT MENU FOR CLERK =================
async function getCurrentMenu(req, res) {
  try {
    const hostel = String(req.hostel || req.clerk?.hostel || req.munshi?.hostel || "")
      .toUpperCase()
      .trim();

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel is required",
      });
    }

    const [menuDocs, extraDocs] = await Promise.all([
      Menu.find({ hostel, isAvailable: true }).sort({ day: 1, mealType: 1 }).lean(),
      ExtraItem.find({ hostel, isAvailable: true }).sort({ createdAt: -1 }).lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        hostel,
        hostelType: getHostelType(hostel),
        hostels: DEFAULT_HOSTELS,
        weeklyMenu: buildWeekFromDocs(menuDocs),
        dailyItems: [],
        extraItems: formatExtraItemsForDashboard(extraDocs),
      },
    });
  } catch (err) {
    console.error("getCurrentMenu error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load current menu",
    });
  }
}

// ================= SAVE WEEKLY MENU =================
async function saveWeeklyMenu(req, res) {
  try {
    const hostel = String(req.hostel || req.clerk?.hostel || req.munshi?.hostel || "")
      .toUpperCase()
      .trim();

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel is required",
      });
    }

    const actor = req.clerk
      ? { _id: req.clerk._id, role: "clerk" }
      : req.munshi
      ? { _id: req.munshi._id, role: "munshi" }
      : null;

    const menuDocs = await saveMenuForHostel(hostel, req.body?.weeklyMenu, actor);
    const extraDocs = await ExtraItem.find({ hostel, isAvailable: true }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: "Weekly menu saved successfully",
      data: {
        hostel,
        hostelType: getHostelType(hostel),
        hostels: DEFAULT_HOSTELS,
        weeklyMenu: buildWeekFromDocs(menuDocs),
        dailyItems: [],
        extraItems: formatExtraItemsForDashboard(extraDocs),
      },
    });
  } catch (err) {
    console.error("saveWeeklyMenu error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save weekly menu",
    });
  }
}

// ================= GET PUBLIC MENU =================
async function getPublicMenu(req, res) {
  try {
    const hostel = String(req.query.hostel || "")
      .toUpperCase()
      .trim();

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel is required",
      });
    }

    const [menuDocs, extraDocs] = await Promise.all([
      Menu.find({ hostel, isAvailable: true }).sort({ day: 1, mealType: 1 }).lean(),
      ExtraItem.find({ hostel, isAvailable: true }).sort({ createdAt: -1 }).lean(),
    ]);

    return res.status(200).json({
  success: true,
  data: {
    hostel,
    hostelType: getHostelType(hostel),
    hostels: DEFAULT_HOSTELS,
    weeklyMenu: buildPublicWeekFromDocs(menuDocs),
    dailyItems: [],
    extraItems: formatExtraItemsForPublic(extraDocs),
  },
});
  } catch (err) {
    console.error("getPublicMenu error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load public menu",
    });
  }
}

// ================= ADD EXTRA ITEM =================
async function addExtraItem(req, res) {
  try {
    const hostel = String(req.hostel || req.clerk?.hostel || req.munshi?.hostel || "")
      .toUpperCase()
      .trim();

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel is required",
      });
    }

    const body = req.body || {};
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Extra item name is required",
      });
    }

    const extra = await ExtraItem.create({
      hostel,
      name,
      price,
      image: "",
      isAvailable: true,
      createdBy: req.clerk?._id || req.munshi?._id || null,
      createdByModel: req.clerk ? "Clerk" : req.munshi ? "Munshi" : null,
    });

    return res.status(201).json({
      success: true,
      message: "Extra item added successfully",
      data: extra,
    });
  } catch (err) {
    console.error("addExtraItem error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add extra item",
    });
  }
}

// ================= GET EXTRA ITEMS FOR DASHBOARD =================
async function getExtraItems(req, res) {
  try {
    const hostel = String(req.hostel || req.clerk?.hostel || req.munshi?.hostel || "")
      .toUpperCase()
      .trim();

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel is required",
      });
    }

    const extras = await ExtraItem.find({
      hostel,
      isAvailable: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: extras,
    });
  } catch (err) {
    console.error("getExtraItems error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch extra items",
    });
  }
}

// ================= DELETE EXTRA ITEM =================
async function deleteExtraItem(req, res) {
  try {
    const hostel = String(req.hostel || req.clerk?.hostel || req.munshi?.hostel || "")
      .toUpperCase()
      .trim();

    const { id } = req.params;

    const deleted = await ExtraItem.findOneAndDelete({
      _id: id,
      hostel,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Extra item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Extra item deleted successfully",
    });
  } catch (err) {
    console.error("deleteExtraItem error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete extra item",
    });
  }
}

module.exports = {
  getCurrentMenu,
  saveWeeklyMenu,
  getPublicMenu,
  addExtraItem,
  getExtraItems,
  deleteExtraItem,
  DEFAULT_HOSTELS,
};