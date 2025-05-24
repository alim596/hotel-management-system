// src/bookings/bookings.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Reservation, ReservationStatus } from './schemas/reservation.entity';

// DTO for creating reservations
export interface CreateReservationDto {
  GuestID: number;
  CheckInDate: string;
  CheckOutDate: string;
  NumberOfGuests: number;
  SpecialRequests?: string;
  TotalPrice: number;
  TaxAmount?: number;
  DiscountAmount?: number;
  FinalAmount: number;
  PromotionID?: number;
  RoomDetails: {
    RoomID: number;
    DailyRate: number;
  }[];
}

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    try {
      // Validate dates
      const checkIn = new Date(createReservationDto.CheckInDate);
      const checkOut = new Date(createReservationDto.CheckOutDate);
      const now = new Date();

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }

      if (checkIn < now) {
        throw new HttpException(
          'Check-in date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (checkOut <= checkIn) {
        throw new HttpException(
          'Check-out date must be after check-in date',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate room details
      if (!createReservationDto.RoomDetails?.length) {
        throw new HttpException(
          'At least one room must be selected',
          HttpStatus.BAD_REQUEST,
        );
      }

      const reservationData: Partial<Reservation> = {
        GuestID: createReservationDto.GuestID,
        CheckInDate: checkIn,
        CheckOutDate: checkOut,
        NumberOfGuests: createReservationDto.NumberOfGuests,
        SpecialRequests: createReservationDto.SpecialRequests,
        TotalPrice: createReservationDto.TotalPrice,
        TaxAmount: createReservationDto.TaxAmount || 0,
        DiscountAmount: createReservationDto.DiscountAmount || 0,
        FinalAmount: createReservationDto.FinalAmount,
        PromotionID: createReservationDto.PromotionID,
        Status: ReservationStatus.PENDING,
      };

      return await this.bookingsService.create(
        reservationData,
        createReservationDto.RoomDetails,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create reservation: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('status') status?: ReservationStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Reservation[]> {
    try {
      if (status) {
        return await this.bookingsService.findByStatus(status);
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new HttpException(
            'Invalid date format',
            HttpStatus.BAD_REQUEST,
          );
        }

        return await this.bookingsService.findByDateRange(start, end);
      }

      return await this.bookingsService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch reservations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Reservation> {
    try {
      const reservation = await this.bookingsService.findOne(id);
      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch reservation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('guest/:guestId')
  async findByGuest(
    @Param('guestId', ParseIntPipe) guestId: number,
  ): Promise<Reservation[]> {
    try {
      return await this.bookingsService.findByGuest(guestId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch guest reservations: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: Partial<CreateReservationDto>,
  ): Promise<Reservation> {
    try {
      const updateData: Partial<Reservation> = {};

      if (
        updateReservationDto.CheckInDate ||
        updateReservationDto.CheckOutDate
      ) {
        const checkIn = updateReservationDto.CheckInDate
          ? new Date(updateReservationDto.CheckInDate)
          : null;
        const checkOut = updateReservationDto.CheckOutDate
          ? new Date(updateReservationDto.CheckOutDate)
          : null;

        if (checkIn && checkOut && checkOut <= checkIn) {
          throw new HttpException(
            'Check-out date must be after check-in date',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (checkIn) updateData.CheckInDate = checkIn;
        if (checkOut) updateData.CheckOutDate = checkOut;
      }

      if (updateReservationDto.NumberOfGuests) {
        updateData.NumberOfGuests = updateReservationDto.NumberOfGuests;
      }
      if (updateReservationDto.SpecialRequests !== undefined) {
        updateData.SpecialRequests = updateReservationDto.SpecialRequests;
      }
      if (updateReservationDto.TotalPrice) {
        updateData.TotalPrice = updateReservationDto.TotalPrice;
      }
      if (updateReservationDto.FinalAmount) {
        updateData.FinalAmount = updateReservationDto.FinalAmount;
      }

      const reservation = await this.bookingsService.update(id, updateData);
      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update reservation: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelDto: { reason?: string },
  ): Promise<Reservation> {
    try {
      const reservation = await this.bookingsService.cancel(
        id,
        cancelDto.reason,
      );
      if (!reservation) {
        throw new HttpException('Reservation not found', HttpStatus.NOT_FOUND);
      }
      return reservation;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to cancel reservation: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    try {
      await this.bookingsService.cancel(id, 'Deleted by user');
      return { message: 'Reservation cancelled successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to delete reservation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
