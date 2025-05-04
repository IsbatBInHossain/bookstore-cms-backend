const express = require('express')
const catalogController = require('../controllers/catalog.controller')
const { authenticateToken } = require('../middlewares/auth.middleware')
const { authorize, Role } = require('../middlewares/authorize.middleware') // Assuming Role enum is exported from here or constants
const validate = require('../middlewares/validate')
const { lookupSchema } = require('../validations/catalog.validation')

const router = express.Router()

router.get(
  '/lookup',
  authenticateToken, // Ensure user is logged in
  authorize([Role.ADMIN]), // Ensure user is authorized
  validate(lookupSchema),
  catalogController.lookupGoogleBooks
)

module.exports = router
