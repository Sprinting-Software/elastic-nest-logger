import { BadRequestException } from "@nestjs/common"
import { CustomBadRequestException } from "../CustomBadRequestException"

describe("CustomBadRequestException", () => {
  describe("constructor", () => {
    it("should set the http status, error name, and error message correctly", () => {
      // Arrange
      const exception = new BadRequestException("Error message")

      // Act
      const customException = new CustomBadRequestException(exception)

      // Assert
      expect(customException.httpStatus).toBe(400)
      expect(customException.errorName).toBe("BadRequestException")
      expect(customException.description).toBe("Error message")
    })

    it("should set the validation errors correctly", () => {
      // Arrange
      const validationErrors = {
        message: {
          name: ["Name is required"],
          age: ["Age must be a number"],
        },
      }
      const exception = new BadRequestException(validationErrors)

      // Act
      const customException = new CustomBadRequestException(exception)

      // Assert
      expect(customException.validationErrors).toEqual(validationErrors.message)
    })
  })

  describe("toString", () => {
    it("should return a string with the error name, http status, error message, and validation errors", () => {
      // Arrange
      const validationErrors = {
        message: {
          name: ["Name is required"],
          age: ["Age must be a number"],
        },
      }
      const exception = new BadRequestException(validationErrors)
      const customException = new CustomBadRequestException(exception)

      // Act
      const result = customException.toString()

      // Assert
      expect(result).toContain(customException.errorName)
      expect(result).toContain(customException.httpStatus.toString())
      expect(result).toContain(customException.description)
      expect(result).toContain(JSON.stringify(customException.validationErrors))
    })
  })

  describe("getResponse", () => {
    it("should return an object with the http status, error name, and validation errors", () => {
      // Arrange
      const validationErrors = {
        name: ["Name is required"],
        age: ["Age must be a number"],
      }
      const exception = new BadRequestException(validationErrors)
      const customException = new CustomBadRequestException(exception)

      // Act
      const result = customException.getResponse()

      // Assert
      expect(result.statusCode).toBe(customException.httpStatus)
      expect(result.errorName).toBe(customException.errorName)
      expect(result.validationErrors).toEqual(customException.validationErrors)
    })
  })
})
