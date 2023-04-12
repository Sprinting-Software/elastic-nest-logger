import { AppException } from "./AppException"
import { HttpStatus } from "@nestjs/common"

/**
 * An exception using HTTP status code 500 InternalServerError.
 */
export class ServerException extends AppException {
  constructor(
    public readonly errorName: string,
    public readonly description?: string,
    public readonly contextData: Record<string, any> = {},
    public readonly innerError?: Error
  ) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, errorName, description, contextData, innerError)
    Object.setPrototypeOf(this, ServerException.prototype)
  }
}
