const Notice = require("../models/Notice");

async function createNotice(req, res, next) {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content and category are required"
      });
    }

    const notice = await Notice.create({
      title,
      content,
      category,
      postedBy: req.user._id
    });

    const populated = await notice.populate(
      "postedBy",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice: populated
    });
  } catch (error) {
    next(error);
  }
}

async function getNotices(req, res, next) {
  try {
    const { category, sort = "-postedDate" } = req.query;
    const filter = {};

    if (category) {
      if (!["academic", "event", "exam"].includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }
      filter.category = category;
    }

    const allowedSorts = {
      "-postedDate": { postedDate: -1 },
      "postedDate": { postedDate: 1 },
      "-createdAt": { createdAt: -1 },
      "createdAt": { createdAt: 1 }
    };

    const sortObject = allowedSorts[sort] || { postedDate: -1 };

    const notices = await Notice.find(filter)
      .populate("postedBy", "name email role")
      .sort(sortObject);

    res.json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    next(error);
  }
}

async function getNoticeById(req, res, next) {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("postedBy", "name email role");

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    res.json({
      success: true,
      notice
    });
  } catch (error) {
    next(error);
  }
}

async function updateNotice(req, res, next) {
  try {
    const { title, content, category } = req.body;
    const notice = req.notice;

    if (title !== undefined) notice.title = title;
    if (content !== undefined) notice.content = content;
    if (category !== undefined) notice.category = category;

    await notice.save();

    const populated = await notice.populate(
      "postedBy",
      "name email role"
    );

    res.json({
      success: true,
      message: "Notice updated successfully",
      notice: populated
    });
  } catch (error) {
    next(error);
  }
}

async function deleteNotice(req, res, next) {
  try {
    await req.notice.deleteOne();

    res.json({
      success: true,
      message: "Notice deleted successfully"
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
};
