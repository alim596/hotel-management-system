import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class ErrorService {
  mapDatabaseError(error: any): HttpException {
    // Handle TypeORM's QueryFailedError
    if (error instanceof QueryFailedError) {
      const message = error.message;
      const code = (error as any).code; // MySQL error code

      switch (code) {
        case 'ER_DUP_ENTRY':
          return new ConflictException(
            'A record with this data already exists',
          );
        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
          return new BadRequestException('Referenced record does not exist');
        case 'ER_ROW_IS_REFERENCED':
        case 'ER_ROW_IS_REFERENCED_2':
          return new BadRequestException(
            'Record is referenced by other records',
          );
        default:
          return new HttpException(
            `Database error: ${message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    // Handle specific error types
    if (error instanceof NotFoundException) {
      return error;
    }

    if (error instanceof BadRequestException) {
      return error;
    }

    if (error instanceof HttpException) {
      return error;
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return new BadRequestException(error.message);
    }

    // Handle custom business logic errors
    if (error.name === 'BusinessError') {
      return new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // Handle date-related errors
    if (error.name === 'InvalidDateError') {
      return new BadRequestException(error.message);
    }

    // Handle transaction errors
    if (error.name === 'TransactionError') {
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Default error handling
    return new HttpException(
      error.message || 'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  mapReservationError(error: any): HttpException {
    // Handle specific reservation-related errors
    if (error.message?.includes('room is not available')) {
      return new ConflictException(
        'The selected room is not available for the specified dates',
      );
    }

    if (error.message?.includes('invalid date range')) {
      return new BadRequestException('Invalid date range for reservation');
    }

    if (error.message?.includes('guest not found')) {
      return new NotFoundException('Guest not found');
    }

    if (error.message?.includes('promotion not valid')) {
      return new BadRequestException(
        'The promotion code is not valid or has expired',
      );
    }

    // Default to generic error mapping
    return this.mapDatabaseError(error);
  }

  mapPaymentError(error: any): HttpException {
    // Handle specific payment-related errors
    if (error.message?.includes('insufficient funds')) {
      return new BadRequestException('Insufficient funds for payment');
    }

    if (error.message?.includes('payment failed')) {
      return new HttpException(
        'Payment processing failed',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    if (error.message?.includes('invalid payment method')) {
      return new BadRequestException('Invalid payment method');
    }

    // Default to generic error mapping
    return this.mapDatabaseError(error);
  }
}
