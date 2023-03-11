import { BadRequestException } from "@nestjs/common"
import { AppException } from "./AppException"

export class CustomBadRequestException extends AppException {
  public readonly errors: Record<string, string[]> = {}

  constructor(private readonly badRequestException: BadRequestException) {
    super(400, badRequestException.name, badRequestException.message)

    Object.setPrototypeOf(this, CustomBadRequestException.prototype)
    this.errors = badRequestException.getResponse()["message"]
  }

  override toString(): string {
    const { errorName, httpStatus } = this
    let message = `${errorName} (HTTP_STATUS ${httpStatus})`
    message += ` ERROR_NAME - ${this.errorName}`
    message += ` ERROR_MESSAGE - ${this.description}`
    message += ` VALIDATION_ERRORS - ${JSON.stringify(this.errors)}`

    if (this.errors) message += ` VALIDATION_ERRORS - ${JSON.stringify(this.errors)}`

    return message
  }

  override getResponse() {
    return {
      statusCode: this.httpStatus,
      errorName: this.errorName,
      errors: this.errors,
    }
  }
}
