export class ContentOperationError extends Error {
  constructor(message: string, public status = 400, public code = "content_operation_error") {
    super(message);
  }
}
