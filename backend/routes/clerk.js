const express = require("express");
const router = express.Router();
const clerkAuth = require("../middleware/clerkAuth");
const clerkController = require("../controllers/clerkController");
const menuController = require("../controllers/menuPageController");
// const extraItemController = require("../controllers/extraItemController");
const upload = require("../middleware/upload");

router.use(clerkAuth);

// ================= MENU =================
router.get("/menu/current", menuController.getCurrentMenu);
router.post("/menu/save", menuController.saveWeeklyMenu);

// ================= EXTRA ITEMS =================
// router.get("/extra-items", extraItemController.getExtraItems);
// router.post("/extra-items", upload.single("image"), extraItemController.addExtraItem);
// router.delete("/extra-items/:id", extraItemController.deleteExtraItem);
router.get("/extra-items", menuController.getExtraItems);
router.post("/extra-items", menuController.addExtraItem);
router.delete("/extra-items/:id", menuController.deleteExtraItem);

// ================= BILL =================
// ================= BILL =================
router.get("/meal-rate", clerkController.getMealRate);
router.post("/meal-rate", clerkController.saveMealRate);
router.get("/students-for-bill", clerkController.getStudentsForMonth);
router.get("/students-for-daterange", clerkController.getStudentsForDateRange);
router.post("/generate-bill", clerkController.generateMonthlyBill);
router.post("/generate-bill-daterange", clerkController.generateBillForDateRange);
router.get("/bill-history", clerkController.getBillHistory);
router.delete("/bill-history/:id", clerkController.deleteBillRecord);

// ================= STUDENTS =================
router.get("/all-students", clerkController.getAllStudents);
router.post("/verify-student", clerkController.verifyStudent);

module.exports = router;