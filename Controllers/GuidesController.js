import Guide from "../Models/GuidesModel.js";
import mongoose from "mongoose";

// Helper
function parseSteps(input) {
  if (!input) return [];
  return Array.isArray(input) ? input : JSON.parse(input);
}
export const createGuide = async (req, res) => {
  try {
    const {
      title,
      metaTitle,
      metaDescription,
      description,
      videoLink,
      steps,
      bannerImage,
      supportedImage1,
      supportedImage2,
      category,
      tags,
      author, // ✅ received from front-end
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const parsedSteps = Array.isArray(steps) ? steps : [];
    const parsedTags = Array.isArray(tags) ? tags.map(String) : [];

    const guide = new Guide({
      title,
      metaTitle,
      metaDescription,
      description,
      videoLink,
      steps: parsedSteps,
      bannerImage,
      supportedImage1,
      supportedImage2,
      category,
      tags: parsedTags,
      author: { id: author?.id, name: author?.name || "Therapist" }, // ✅ Save author
      isApproved: false,
    });

    await guide.save();
    return res.status(201).json({ guide });
  } catch (err) {
    console.error("createGuide error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



// ------------------ FETCH ------------------
export const getTherapistGuides = async (req, res) => {
  try {
    const guides = await Guide.find({ "author.id": req.user.id }).sort({ createdAt: -1 });
    res.json({ guides });
  } catch (err) {
    console.error("getTherapistGuides", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getApprovedGuides = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = Math.min(parseInt(req.query.limit || "10"), 50);
    const skip = (page - 1) * limit;

    const [guides, total] = await Promise.all([
      Guide.find({ isApproved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Guide.countDocuments({ isApproved: true }),
    ]);

    res.json({ guides, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("getApprovedGuides", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUnapprovedGuides = async (req, res) => {
  try {
    const guides = await Guide.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json({ guides });
  } catch (err) {
    console.error("getUnapprovedGuides", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getGuideById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "Not found" });
    res.json({ guide });
  } catch (err) {
    console.error("getGuideById", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ ADMIN ------------------
export const approveGuide = async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true, approvedBy: { id: req.user.id, name: req.user.name }, approvedAt: new Date() } },
      { new: true }
    );
    if (!guide) return res.status(404).json({ error: "Not found" });
    res.json({ guide });
  } catch (err) {
    console.error("approveGuide", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ COMMENTS ------------------
export const addComment = async (req, res) => {
  try {
    const comment = {
      userId: req.user.id,
      name: req.body.name,
      email: req.body.email,
      profileImage: req.body.profileImage || null,
      content: req.body.content,
      guideId: req.params.id,
    };

    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    ).select("comments");

    if (!guide) return res.status(404).json({ error: "Guide not found" });
    res.status(201).json({ comment: guide.comments[guide.comments.length - 1] });
  } catch (err) {
    console.error("addComment", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const listComments = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id, "comments");
    if (!guide) return res.status(404).json({ error: "Not found" });
    res.json({ totalComments: guide.comments.length, comments: guide.comments });
  } catch (err) {
    console.error("listComments", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ LIKE ------------------
export const toggleLike = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "Not found" });

    const exists = guide.likes.find((l) => String(l.userId) === String(req.user.id));
    if (exists) {
      await Guide.updateOne({ _id: guide._id }, { $pull: { likes: { userId: req.user.id } } });
      return res.json({ liked: false });
    } else {
      await Guide.updateOne(
        { _id: guide._id },
        { $push: { likes: { userId: req.user.id, name: req.user.name, email: req.user.email } } }
      );
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error("toggleLike", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ SAVE ------------------
export const toggleSave = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "Not found" });

    const exists = guide.saves.find((s) => String(s.userId) === String(req.user.id));
    if (exists) {
      await Guide.updateOne({ _id: guide._id }, { $pull: { saves: { userId: req.user.id } } });
      return res.json({ saved: false });
    } else {
      await Guide.updateOne(
        { _id: guide._id },
        { $push: { saves: { userId: req.user.id, name: req.user.name, email: req.user.email } } }
      );
      return res.json({ saved: true });
    }
  } catch (err) {
    console.error("toggleSave", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ GET USER SAVED ------------------
export const getSavedGuidesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const guides = await Guide.find({ "saves.userId": userId }).lean();
    res.json(guides);
  } catch (err) {
    console.error("getSavedGuidesByUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ DELETE ------------------
export const deleteGuide = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: "Not found" });

    const isAuthor = String(guide.author.id) === String(req.user.id);
    if (!isAuthor && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    await Guide.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteGuide", err);
    res.status(500).json({ error: "Server error" });
  }
};
