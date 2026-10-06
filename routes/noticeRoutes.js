const express = require("express");
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
} = require("../controllers/noticeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const ownerOrAdmin = require("../middleware/ownershipMiddleware");

const router = express.Router();

router.get("/", getNotices);
router.get("/:id", getNoticeById);

router.post(
  "/",
  protect,
  authorize("staff", "admin"),
  createNotice
);

router.patch(
  "/:id",
  protect,
  ownerOrAdmin,
  updateNotice
);

router.delete(
  "/:id",
  protect,
  ownerOrAdmin,
  deleteNotice
);

module.exports = router;
