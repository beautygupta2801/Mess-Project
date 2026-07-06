const express = require("express");
const router = express.Router();
const munshiAuth = require("../middleware/munshiAuth");
const munshiController = require("../controllers/munshiController");

const {
  validateStudentLookup,
  validateOrderCreation,
  validateOrdersList,
  validateMessOffList,
  validateMessOffStatus,
} = require("../validators/munshiValidators");

// ONLY munshi allowed
router.use(munshiAuth);

// ================= STUDENT =================
router.get("/student/lookup", validateStudentLookup, munshiController.lookupStudent);

// ================= ORDER =================
router.post("/order", validateOrderCreation, munshiController.createOrder);
router.get("/orders", validateOrdersList, munshiController.getOrders);

// ================= MESS-OFF =================
router.get("/mess-off-requests", validateMessOffList, munshiController.getMessOffRequests);
router.patch("/mess-off/:id/status", validateMessOffStatus, munshiController.updateMessOffStatus);

// ================= OTHER =================
router.post("/bulk-diet-record", munshiController.bulkRecordDiet);
router.get("/extra-items", munshiController.getExtraItems);
router.get("/session-stats", munshiController.getSessionStats);
router.patch("/mess-on", munshiController.enableMessOn);
router.post("/fine", munshiController.addFine);
router.delete("/orders/:id", munshiController.deleteOrder);

module.exports = router;