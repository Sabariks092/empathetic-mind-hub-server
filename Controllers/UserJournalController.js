// controllers/journalController.js
import Journal from "../Models/user/UserJournalsModel.js";

// ✅ Create new journal
export const createJournal = async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, stressLevel, highlights, reflections, date } = req.body;

    // Prevent duplicate journal for same day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Journal.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res.status(400).json({ message: "You already wrote a journal today." });
    }

    const newJournal = new Journal({
      userId,
      date,
      mood,
      stressLevel,
      highlights,
      reflections,
    });

    await newJournal.save();
    res.status(201).json(newJournal);
  } catch (error) {
    console.error("Error creating journal:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get journals by user + filter
export const getUserJournals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (parseInt(days) || 7));

    const journals = await Journal.find({
      userId,
      date: { $gte: cutoffDate },
    }).sort({ date: -1 });

    res.json(journals);
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ message: "Server error" });
  }
};
