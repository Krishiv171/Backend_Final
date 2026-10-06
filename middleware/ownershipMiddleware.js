const Notice = require("../models/Notice");

async function ownerOrAdmin(req, res, next) {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    const isOwner = notice.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only the original poster or an admin can modify this notice"
      });
    }

    req.notice = notice;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = ownerOrAdmin;
