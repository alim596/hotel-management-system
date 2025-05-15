import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { BookingsModule } from './bookings/bookings.module';
import { DestinationsModule } from './destinations.module';

@Module({
  imports: [HotelsModule, RoomTypesModule, BookingsModule, DestinationsModule], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
