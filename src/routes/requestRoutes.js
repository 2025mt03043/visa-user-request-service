const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authMiddleware');

const {
    create,
    list,
    getOne,
    update,
    cancel
} = require('../controllers/requestController');

router.use(authenticateUser);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.put('/:id', update);
router.patch('/:id/cancel', cancel);

module.exports = router;