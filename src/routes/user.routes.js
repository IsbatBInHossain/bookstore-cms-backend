const express = require('express')
const userController = require('../controllers/user.controller')
const validate = require('../middlewares/validate')
const { createUserSchema } = require('../validations/user.validation')

const router = express.Router()

router.post('/', validate(createUserSchema), userController.createUser)

module.exports = router
