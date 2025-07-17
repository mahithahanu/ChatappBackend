const AudioCall = require("../models/audioCall");
const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const VideoCall = require("../models/videoCall");
const catchAsync = require("../utils/catchAsync");
const filterObj = require("../utils/filterObj");
const { generateToken04 } = require("./zegoServerAssistant");

const appID = process.env.ZEGO_APP_ID;
const serverSecret = process.env.ZEGO_SERVER_SECRET;

// Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

// Update user
exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const userDoc = await User.findByIdAndUpdate(req.user._id, filteredBody);
  res.status(200).json({
    status: "success",
    data: userDoc,
    message: "User Updated successfully",
  });
});

// Get users who are verified and not friends
exports.getUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({ verified: true }).select("firstName lastName _id");

  const this_user = await User.findById(req.user._id);

  const remaining_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id.toString()) &&
      user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

// Get all verified users excluding self
exports.getAllVerifiedUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({ verified: true }).select("firstName lastName _id");

  const remaining_users = all_users.filter(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "Users found successfully!",
  });
});

// Get friend requests
exports.getRequests = catchAsync(async (req, res, next) => {
  const requests = await FriendRequest.find({ recipient: req.user._id })
    .populate("sender")
    .select("_id firstName lastName");

  res.status(200).json({
    status: "success",
    data: requests,
    message: "Requests found successfully!",
  });
});

// Get friends
exports.getFriends = catchAsync(async (req, res, next) => {
  const this_user = await User.findById(req.user._id).populate(
    "friends",
    "_id firstName lastName"
  );
  res.status(200).json({
    status: "success",
    data: this_user.friends,
    message: "Friends found successfully!",
  });
});

// Generate Zego token
exports.generateZegoToken = catchAsync(async (req, res, next) => {
  try {
    const { userId, room_id } = req.body;

    const effectiveTimeInSeconds = 3600;
    const payloadObject = {
      room_id,
      privilege: { 1: 1, 2: 1 },
      stream_id_list: null,
    };

    const payload = JSON.stringify(payloadObject);
    const token = generateToken04(appID * 1, userId, serverSecret, effectiveTimeInSeconds, payload);

    res.status(200).json({
      status: "success",
      message: "Token generated successfully",
      token,
    });
  } catch (err) {
    console.log(err);
  }
});

// Start audio call
exports.startAudioCall = catchAsync(async (req, res, next) => {
  const from = req.user._id;
  const to = req.body.id;

  const to_user = await User.findById(to);

  const new_audio_call = await AudioCall.create({
    participants: [from, to],
    from,
    to,
    status: "Ongoing",
  });

  res.status(200).json({
    data: {
      _id: new_audio_call._id,
      from: to_user,
      roomID: new_audio_call._id,
      streamID: to,
      userID: from,
      userName: from,
    },
  });
});

// Start video call
exports.startVideoCall = catchAsync(async (req, res, next) => {
  const from = req.user._id;
  const to = req.body.id;

  const to_user = await User.findById(to);

  const new_video_call = await VideoCall.create({
    participants: [from, to],
    from,
    to,
    status: "Ongoing",
  });

  res.status(200).json({
    data: {
      from: to_user,
      roomID: new_video_call._id,
      streamID: to,
      userID: from,
      userName: from,
    },
  });
});

// ✅ End call (update status)
// ✅ End call (update status, verdict, and endedAt)
exports.endCall = catchAsync(async (req, res, next) => {
  const { id, type, verdict = "Ended" } = req.body;

  console.log("End Call Request:", { id, type, verdict });

  const model = type === "video" ? VideoCall : AudioCall;

  // Ensure we are updating the right fields
  const updated = await model.findByIdAndUpdate(
    id,
    {
      status: "Ended",
      verdict,
      endedAt: new Date(), // ✅ Set the end time
    },
    { new: true } // ✅ Return updated document
  ).populate("from to"); // Optional: Populate for frontend use

  if (!updated) {
    console.log("❌ Call not found for ID:", id);
    return res.status(404).json({
      status: "fail",
      message: "Call not found",
    });
  }

  console.log("✅ Call ended successfully:", updated);

  res.status(200).json({
    status: "success",
    message: "Call ended successfully",
    data: updated, // ✅ Return updated call info (useful for logs/frontend)
  });
});


// ✅ Get call logs
exports.getCallLogs = catchAsync(async (req, res, next) => {
  const user_id = req.user._id;
  const call_logs = [];

  // ✅ Fetch only audio calls (video call logic commented out)
  const audio_calls = await AudioCall.find({ participants: { $all: [user_id] } }).populate("from to");

  // const video_calls = await VideoCall.find({ participants: { $all: [user_id] } }).populate("from to");

  const all_calls = [...audio_calls /*, ...video_calls*/];

  for (let call of all_calls) {
    const missed = call.verdict !== "Accepted";
    const isIncoming = call.to._id.toString() === user_id.toString();
    const other_user = isIncoming ? call.from : call.to;

    call_logs.push({
      id: call._id,
      img: other_user.avatar,
      name: other_user.firstName,
      online: true,
      incoming: isIncoming,
      missed,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Call Logs Found successfully!",
    data: call_logs,
  });
});



// ✅ Get call status (for polling from frontend)
exports.getCallStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Try to find the call in AudioCall model
  let call = await AudioCall.findById(id);

  // If not found in audio, try video
  if (!call) {
    call = await VideoCall.findById(id);
  }

  // If still not found, return error
  if (!call) {
    return res.status(404).json({
      status: "fail",
      message: "Call not found",
    });
  }

  // Return status only
  return res.status(200).json({
    status: call.status,
  });
});

