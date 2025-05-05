const { z } = require('zod')

// --- Google book look up schema
const lookupSchema = z.object({
  query: z.object({
    q: z
      .string({ required_error: 'Query term is required' })
      .min(1, { message: 'Please enter the serch term' }),
  }),
})

// --- Author Schemas ---
const authorIdParamSchema = z.object({
  params: z.object({
    authorId: z.string().uuid({ message: 'Invalid Author ID format' }),
  }),
})

const createAuthorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Author name is required' })
      .min(2, { message: 'Author name must be at least 2 characters' }),
    bio: z.string().optional(), // Bio is optional text
  }),
})

const updateAuthorSchema = z.object({
  // Combine params schema with body schema for update validation
  params: authorIdParamSchema.shape.params, // Reuse params part
  body: z
    .object({
      name: z
        .string()
        .min(2, { message: 'Author name must be at least 2 characters' })
        .optional(), // Name is optional during update
      bio: z.string().nullable().optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field (name or bio) must be provided for update',
    }),
})

module.exports = {
  lookupSchema,
  createAuthorSchema,
  updateAuthorSchema,
  authorIdParamSchema,
}
