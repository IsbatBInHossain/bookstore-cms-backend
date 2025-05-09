const express = require('express')
const catalogController = require('../controllers/catalog.controller')
const { authenticateToken } = require('../middlewares/auth.middleware')
const { authorize, Role } = require('../middlewares/authorize.middleware') // Assuming Role enum is exported from here or constants
const validate = require('../middlewares/validate')
const {
  lookupSchema,
  authorIdParamSchema,
  createAuthorSchema,
  updateAuthorSchema,
} = require('../validations/catalog.validation')

const router = express.Router()

// --- Google Books Lookup ---
router.get(
  '/lookup',
  authenticateToken,
  authorize([Role.ADMIN]),
  validate(lookupSchema),
  catalogController.lookupGoogleBooks
)

// --- Author CRUD Routes ---

// POST /api/catalog/authors - Create Author (Admin only)
router.post(
  '/authors',
  authenticateToken,
  authorize([Role.ADMIN]),
  validate(createAuthorSchema),
  catalogController.createAuthor
)

// GET /api/catalog/authors - Get All Authors
router.get('/authors', catalogController.getAllAuthors)

// GET /api/catalog/authors/:authorId - Get Author by ID
router.get(
  '/authors/:authorId',
  validate(authorIdParamSchema),
  catalogController.getAuthorById
)

// PATCH /api/catalog/authors/:authorId - Update Author (Admin only)
router.patch(
  '/authors/:authorId',
  authenticateToken,
  authorize([Role.ADMIN]),
  validate(updateAuthorSchema),
  catalogController.updateAuthor
)

// DELETE /api/catalog/authors/:authorId - Delete Author (Admin only)
router.delete(
  '/authors/:authorId',
  authenticateToken,
  authorize([Role.ADMIN]),
  validate(authorIdParamSchema),
  catalogController.deleteAuthor
)

module.exports = router
