const Club = require('../models/clubModel');
const axios = require('axios');

//GET /
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

//GET /club/:clubId
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch club' });
  }
};

exports.registerUserWithDetails = async (req, res) => {
  const { clubId } = req.params;
  const { name, rollNo, email, phone } = req.body;

  try {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const lowerEmail = email.toLowerCase();
    const alreadyRegistered = club.registeredUsersData.some(user => user.email === lowerEmail);
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered' });
    }

    club.registeredUsers.push(lowerEmail);
    club.registeredUsersData.push({ name, rollNo, email: lowerEmail, phone });
    await club.save();

    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Error registering with details:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.registerUserToClub = async (req, res) => {
  const { email, clubId } = req.body;

  try {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const lowerEmail = email.toLowerCase();
    const alreadyRegistered = club.registeredUsers.includes(lowerEmail);

    if (!alreadyRegistered) {
      club.registeredUsers.push(lowerEmail);
      await club.save();

      try {
        await axios.post(
          'https://dev225934.service-now.com/api/1616695/club_registration/send-confirmation',
          { email: lowerEmail, clubName: club.name },
          {
            auth: { username: 'reactapi', password: 'UConnect#2129' },
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (err) {
        console.error('Error sending email:', err.response?.data || err.message);
      }
    }

    res.json({ message: alreadyRegistered ? 'Already registered' : 'Registered and email sent' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.getClubsByUserEmail = async (req, res) => {
  const email = req.query.email;
  try {
    const clubs = await Club.find({ registeredUsers: email });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};


exports.addNewClub = async (req, res) => {
  try {
    const newClub = new Club(req.body);
    await newClub.save();
    res.status(201).json(newClub);
  } catch (err) {
    console.error('Error adding club:', err);
    res.status(500).json({ error: 'Failed to add club' });
  }
};

// ✅ Update club (e.g., add event)
exports.updateClubEvents = async (req, res) => {
  try {
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.clubId,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedClub);
  } catch (err) {
    console.error('Error updating club:', err);
    res.status(500).json({ error: 'Failed to update club' });
  }
};