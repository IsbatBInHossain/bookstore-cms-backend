const { z } = require('zod')

const lookupSchema = z.object({
  query: z.object({
    q: z
      .string({ required_error: 'Query term is required' })
      .min(1, { message: 'Please enter the serch term' }),
  }),
})

module.exports = { lookupSchema }
