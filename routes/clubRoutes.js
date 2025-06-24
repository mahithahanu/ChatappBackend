// const express = require('express');
// const router = express.Router();
// const clubController = require('../Controllers/clubController');

// router.get('/', clubController.getAllClubs);
// router.post('/register', clubController.registerUserToClub);
// router.get('/registered', clubController.getRegisteredClubs);
// router.get('/:clubId', clubController.getClubById);

// module.exports = router;


// clubRoutes.js
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

router.get('/club', clubController.getAllClubs);
router.get('/:clubId', clubController.getClubById);
router.post('/register', clubController.registerUserToClub);
router.post('/:clubId/register-details', clubController.registerUserWithDetails); // ✅ NO ()

module.exports = router;