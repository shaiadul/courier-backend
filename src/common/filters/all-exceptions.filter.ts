import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Optional: Log the error to the console
    console.error({
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
