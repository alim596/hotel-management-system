import { Controller } from '@nestjs/common';
import { Booking } from './schemas/booking.schema';
import { BookingsService } from './bookings.service';
import { Body, Get, Post } from '@nestjs/common';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() payload: Omit<Booking, 'id' | 'createdAt'>): Booking {
    return this.bookingsService.create(payload);
  }

  @Get()
  findAll(): Booking[] {
    return this.bookingsService.findAll();
  }
}
