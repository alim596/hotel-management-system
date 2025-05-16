import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { BookingsModule } from './bookings/bookings.module';
import { DestinationsModule } from './destinations_search_bar/destinations.module';
import { SupportModule } from './support_forms/support.module'; 
import { SupportMessage } from './support_forms/support_message.entity'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'changeme',
    database: 'hotel_support',
    autoLoadEntities: true,
    synchronize: true, 
  }),
    HotelsModule,
    RoomTypesModule,
    BookingsModule,
    DestinationsModule,
    SupportModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
