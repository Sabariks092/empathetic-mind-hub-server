// controllers/eventController.js
import Event from "../Models/events/EventsModel.js";
import SavedEvent from "../Models/events/UserSavedEvents.js";
import Registration from "../Models/events/EventRegistration.js";

/**
 * Create a new event (isApproved always false initially)
 */
export const createEvent = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const event = new Event({
      title: payload.title,
      description: payload.description,
      eventBanner: payload.eventBanner,
      eventOrganizationLogo: payload.eventOrganizationLogo,
      category: payload.category,
      price: payload.price || "Free",
      venue: payload.venue,
      postedBy: payload.postedBy,
      facilitator: payload.facilitator,
      date: new Date(payload.date),
      time: payload.time,
      capacity: payload.capacity || 0,
      tags: payload.tags || [],
      createdBy: payload.userId || null,
      isApproved: false,
      status: "pending",
    });

    await event.save();
    res.status(201).json({ message: "Event created (pending approval)", event });
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetch all approved events
 */
export const fetchApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: true, status: "approved" }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("Fetch Approved Events Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetch all unapproved events
 */
export const fetchUnapprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error("Fetch Unapproved Events Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Save event for a user
 */
export const saveEvent = async (req, res) => {
  try {
    const { userId } = req.body;
    const { eventId } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const saved = new SavedEvent({ event: eventId, user: userId });
    await saved.save();

    res.status(201).json({ message: "Event saved", saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Event already saved" });
    }
    console.error("Save Event Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetch events hosted (created) by a user
 */
export const getHostedEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const hostedEvents = await Event.find({ createdBy: userId }).sort({ date: -1 });
    res.json(hostedEvents);
  } catch (err) {
    console.error("Get Hosted Events Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Fetch saved events by user
 */
export const getSavedEventsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const saved = await SavedEvent.find({ user: userId }).populate("event");
    res.json(saved.map(s => s.event));
  } catch (err) {
    console.error("Get Saved Events Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Register user for an event
 */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, name, email, phone, numPeople = 1 } = req.body;

    if (!userId) return res.status(400).json({ message: "userId required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.capacity && event.registeredCount + numPeople > event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    const existing = await Registration.findOne({ event: eventId, user: userId });
    if (existing) return res.status(409).json({ message: "Already registered" });

    const reg = new Registration({
      event: eventId,
      user: userId,
      name,
      email,
      phone,
      numPeople,
    });

    await reg.save();

    event.registeredCount += numPeople;
    await event.save();

    res.status(201).json({ message: "Registered successfully", registration: reg });
  } catch (err) {
    console.error("Register Event Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetch registered events by user
 */
export const getRegistrationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const regs = await Registration.find({ user: userId }).populate("event");
    res.json(regs);
  } catch (err) {
    console.error("Get Registrations Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Approve/Reject event (admin)
 */
export const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { isApproved = true } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.isApproved = Boolean(isApproved);
    event.status = isApproved ? "approved" : "pending";

    await event.save();
    res.json({ message: "Event updated", event });
  } catch (err) {
    console.error("Approve Event Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add review (only registered users)
 */
export const addReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ message: "userId and rating required" });
    }

    const reg = await Registration.findOne({ event: eventId, user: userId, status: "registered" });
    if (!reg) {
      return res.status(403).json({ message: "Only registered users can review" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const alreadyReviewed = event.reviews.some(r => r.user.toString() === userId);
    if (alreadyReviewed) {
      return res.status(409).json({ message: "You already reviewed this event" });
    }

    event.reviews.push({ user: userId, rating, comment });
    await event.save();

    res.status(201).json({ message: "Review added", reviews: event.reviews });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
