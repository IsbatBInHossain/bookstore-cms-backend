const mockArgon2Hash = jest.fn()
const mockArgon2Verify = jest.fn()
jest.mock('argon2', () => ({
  hash: mockArgon2Hash,
  verify: mockArgon2Verify,
}))

const { hashPassword, verifyPassword } = require('../password')

// Describe block groups tests for the password utility
describe('Password Utility', () => {
  beforeEach(() => {
    mockArgon2Hash.mockClear()
    mockArgon2Verify.mockClear()
  })

  // Tests for hashPassword
  describe('hashPassword', () => {
    it('should call argon2.hash with the plain password', async () => {
      const plainPassword = 'password123'
      const expectedHash = 'hashed_password_string'
      // Configure the mock to return a value when called
      mockArgon2Hash.mockResolvedValue(expectedHash)

      await hashPassword(plainPassword)

      // Expect argon2.hash to have been called once with the correct password
      expect(mockArgon2Hash).toHaveBeenCalledTimes(1)
      expect(mockArgon2Hash).toHaveBeenCalledWith(plainPassword)
    })

    it('should return the hashed password from argon2.hash', async () => {
      const plainPassword = 'password123'
      const expectedHash = 'hashed_password_string'
      mockArgon2Hash.mockResolvedValue(expectedHash)

      const result = await hashPassword(plainPassword)

      // Expect the function to return the value provided by the mock
      expect(result).toBe(expectedHash)
    })

    it('should throw an error if argon2.hash fails', async () => {
      const plainPassword = 'password123'
      const expectedError = new Error('Hashing failed internally')
      // Configure the mock to reject with an error
      mockArgon2Hash.mockRejectedValue(expectedError)

      // Expect the promise to be rejected
      // Using async/await with try/catch or .rejects.toThrow()
      await expect(hashPassword(plainPassword)).rejects.toThrow(
        'Password hashing failed'
      )

      // Also check if the mock was called
      expect(mockArgon2Hash).toHaveBeenCalledTimes(1)
      expect(mockArgon2Hash).toHaveBeenCalledWith(plainPassword)
    })
  })

  // Tests for verifyPassword
  describe('verifyPassword', () => {
    it('should call argon2.verify with the hash and plain password', async () => {
      const hashedPassword = 'hashed_password_string'
      const plainPassword = 'password123'
      // Configure mock to resolve (return value doesn't matter for this check)
      mockArgon2Verify.mockResolvedValue(true)

      await verifyPassword(hashedPassword, plainPassword)

      // Expect argon2.verify to have been called once with correct arguments
      expect(mockArgon2Verify).toHaveBeenCalledTimes(1)
      expect(mockArgon2Verify).toHaveBeenCalledWith(
        hashedPassword,
        plainPassword
      )
    })

    it('should return true if argon2.verify returns true', async () => {
      const hashedPassword = 'hashed_password_string'
      const plainPassword = 'password123'
      mockArgon2Verify.mockResolvedValue(true) // Simulate successful verification

      const result = await verifyPassword(hashedPassword, plainPassword)

      // Expect the function to return true
      expect(result).toBe(true)
    })

    it('should return false if argon2.verify returns false', async () => {
      const hashedPassword = 'hashed_password_string'
      const plainPassword = 'wrong_password'
      mockArgon2Verify.mockResolvedValue(false) // Simulate failed verification

      const result = await verifyPassword(hashedPassword, plainPassword)

      // Expect the function to return false
      expect(result).toBe(false)
    })

    it('should return false if argon2.verify throws an error', async () => {
      const hashedPassword = 'invalid_hash_format'
      const plainPassword = 'password123'
      const expectedError = new Error('Verification failed internally')
      // Configure mock to reject with an error
      mockArgon2Verify.mockRejectedValue(expectedError)

      const result = await verifyPassword(hashedPassword, plainPassword)

      // Expect the function to return false when an internal error occurs
      expect(result).toBe(false)
      // Expect the mock to have been called
      expect(mockArgon2Verify).toHaveBeenCalledTimes(1)
    })
  })
})
