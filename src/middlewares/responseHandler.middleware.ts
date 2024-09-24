export class ResponseHandler {
  static success(res: any, data?: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static failure(res: any, message: string = 'Failure', statusCode: number = 500, error?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
