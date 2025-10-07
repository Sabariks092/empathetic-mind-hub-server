import Blog from "../Models/TherapistBlogsModel.js";
import mongoose from "mongoose";

// --- Helper ---
function parseReferenceLinks(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return String(input)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ------------------ CREATE ------------------
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      referenceLinks,
      bannerImage,
      supportedImage1,
      supportedImage2,
      categories,
      author, // ✅ get author from front-end
    } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({ error: "Title, summary and content are required" });
    }

    const formattedRefs = Array.isArray(referenceLinks)
      ? referenceLinks.map(ref => ({
          title: ref.title?.trim(),
          link: ref.link?.trim(),
        }))
      : [];

    const blog = new Blog({
      title,
      summary,
      content,
      referenceLinks: formattedRefs,
      bannerImage,
      supportedImage1,
      supportedImage2,
      categories: Array.isArray(categories) ? categories.slice(0, 5) : [],
      author: {
        id: author?.id,
        name: author?.name || "Therapist",
      },
      isApproved: false,
    });

    await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (err) {
    console.error("createBlog error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ FETCH ------------------
export const getTherapistBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ "author.id": req.user.id }).sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (err) {
    console.error("getTherapistBlogs", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getApprovedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = Math.min(parseInt(req.query.limit || "10"), 50);
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({ isApproved: true }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Blog.countDocuments({ isApproved: true }),
    ]);

    res.json({ blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("getApprovedBlogs", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUnapprovedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (err) {
    console.error("getUnapprovedBlogs", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ blog });
  } catch (err) {
    console.error("getBlogById", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ ADMIN ------------------
export const approveBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved: true, approvedBy: { id: req.user.id, name: req.user.name }, approvedAt: new Date() } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ blog });
  } catch (err) {
    console.error("approveBlog", err);
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
      blogId: req.params.id,
    };

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment } },
      { new: true }
    ).select("comments");

    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(201).json({ comment: blog.comments[blog.comments.length - 1] });
  } catch (err) {
    console.error("addComment", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const listComments = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id, "comments");
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ totalComments: blog.comments.length, comments: blog.comments });
  } catch (err) {
    console.error("listComments", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ LIKE ------------------
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });

    const exists = blog.likes.find((l) => String(l.userId) === String(req.user.id));
    if (exists) {
      await Blog.updateOne({ _id: blog._id }, { $pull: { likes: { userId: req.user.id } } });
      return res.json({ liked: false });
    } else {
      await Blog.updateOne(
        { _id: blog._id },
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });

    const exists = blog.saves.find((s) => String(s.userId) === String(req.user.id));
    if (exists) {
      await Blog.updateOne({ _id: blog._id }, { $pull: { saves: { userId: req.user.id } } });
      return res.json({ saved: false });
    } else {
      await Blog.updateOne(
        { _id: blog._id },
        { $push: { saves: { userId: req.user.id, name: req.user.name, email: req.user.email } } }
      );
      return res.json({ saved: true });
    }
  } catch (err) {
    console.error("toggleSave", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/therapist-blogs/user/saved-blogs/:userId
export const getSavedBlogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find all blogs where saves array contains this userId
    const blogs = await Blog.find({ "saves.userId": userId })
      .select(
        "title content bannerImage createdAt comments saves author"
      )
      .lean();

    if (!blogs || blogs.length === 0) {
      return res.json([]); // return empty array
    }

    // Normalize comment data if needed
    const formattedBlogs = blogs.map((blog) => ({
      _id: blog._id,
      title: blog.title,
      summary: blog.content || blog.summary || "",
      bannerImage: blog.bannerImage,
      createdAt: blog.createdAt,
      comments: blog.comments?.map((c) => ({
        _id: c._id,
        userName: c.name || "Anonymous",
        commentText: c.content,
        createdAt: c.createdAt,
      })) || [],
    }));

    res.json(formattedBlogs);
  } catch (err) {
    console.error("getSavedBlogsByUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ DELETE ------------------
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });

    const isAuthor = String(blog.author.id) === String(req.user.id);
    if (!isAuthor && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    await Blog.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteBlog", err);
    res.status(500).json({ error: "Server error" });
  }
};
