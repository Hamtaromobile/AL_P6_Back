// routes sauce

const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');

//protect. d'authentification
const auth = require('../middleware/auth');

//création
router.post('/', auth, multer, sauceCtrl.createSauce);

//lecture
router.get('/', auth, sauceCtrl.getAllSauce);

//recup. une sauce
router.get('/:id', auth, sauceCtrl.getOneSauce);

//modif.
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

//supp.
router.delete('/:id', auth, sauceCtrl.deleteSauce);

//like, dislike
router.post('/:id/like', auth, sauceCtrl.likeDislike)

module.exports = router;