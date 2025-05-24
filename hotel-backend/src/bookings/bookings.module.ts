// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Reservation } from './schemas/reservation.entity';
import { ReservationDetail } from './schemas/reservation-detail.entity';
import { HotelsModule } from '../hotels/hotels.module';
import { RoomTypesModule } from '../room-types/room-types.module';
import { ErrorService } from '../shared/services/error.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ReservationDetail]),
    HotelsModule,
    RoomTypesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, ErrorService],
  exports: [BookingsService, TypeOrmModule],
})
export class BookingsModule {}
