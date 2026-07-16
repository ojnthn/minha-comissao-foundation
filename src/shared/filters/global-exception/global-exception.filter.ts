import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  BadRequestException,
  ConflictException,
  DomainException,
  NotFoundException,
  UnauthorizedException,
} from '../../exceptions/domain.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message } = this.resolve(exception);

    response.status(statusCode).json({ statusCode, message });
  }

  private resolve(exception: unknown): { statusCode: number; message: string } {
    if (exception instanceof UnauthorizedException) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: exception.message,
      };
    }
    if (exception instanceof BadRequestException) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: exception.message };
    }
    if (exception instanceof ConflictException) {
      return { statusCode: HttpStatus.CONFLICT, message: exception.message };
    }
    if (exception instanceof NotFoundException) {
      return { statusCode: HttpStatus.NOT_FOUND, message: exception.message };
    }
    if (exception instanceof DomainException) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
      };
    }
    if (exception instanceof HttpException) {
      return { statusCode: exception.getStatus(), message: exception.message };
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
    };
  }
}
