import Chat from "../Models/chat/ChatModel.js";
import Message from "../Models/chat/MessageModel.js";

// Get all chats for a user
export const getChats = async (req, res) => {
  const userId = req.params.userId;
  try {
    const chats = await Chat.find({ users: userId }).populate("users", "name isTherapist");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get or create chat between user and therapist
export const getOrCreateChat = async (req, res) => {
  const { userId, therapistId } = req.body;
  try {
    let chat = await Chat.findOne({ users: { $all: [userId, therapistId] } });
    if (!chat) {
      chat = new Chat({ users: [userId, therapistId] });
      await chat.save();
    }
    res.json({ chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages for a chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chatId }).populate("sender", "name");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  const { chatId, sender, text } = req.body;
  try {
    const message = new Message({ chatId, sender, text });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
