const Interview = require("../models/interviewModel");

exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createInterview = async (req, res) => {
  try {
    const newInterview = new Interview({ ...req.body, time: new Date() });
    await newInterview.save();
    res.status(201).json(newInterview);
  } catch (err) {
    res.status(500).json({ error: "Failed to post interview" });
  }
};

exports.replyToInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    interview.replies.push({ ...req.body, time: new Date() });
    await interview.save();
    res.status(200).json(interview);
  } catch (err) {
    res.status(500).json({ error: "Failed to post reply" });
  }
};
exports.deleteInterview = async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete interview" });
  }
};