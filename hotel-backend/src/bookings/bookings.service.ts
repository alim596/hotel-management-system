import { Injectable } from '@nestjs/common';
import { BOOKINGS } from '../mock-data';
import { Booking } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  private bookings = BOOKINGS;

  create(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const booking: Booking = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.bookings.push(booking);
    return booking;
  }

  findAll(): Booking[] {
    return this.bookings;
  }
}
