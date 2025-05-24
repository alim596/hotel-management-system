// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsModule } from './bookings/bookings.module';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SupportModule } from './support_forms/support.module';
import { staticDatabaseConfig } from './database/config/database.config';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Module
    TypeOrmModule.forRoot(staticDatabaseConfig),

    // Feature Modules
    BookingsModule,
    HotelsModule,
    RoomTypesModule,
    PromotionsModule,
    SupportModule,
  ],
})
export class AppModule {}
