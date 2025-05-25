// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BookingsModule } from './bookings/bookings.module';
import { HotelsModule } from './hotels/hotels.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SupportModule } from './support_forms/support.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { staticDatabaseConfig } from './database/config/database.config';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        () => ({
          database: {
            type: process.env.DB_TYPE || 'postgres',
            ...staticDatabaseConfig,
          },
        }),
      ],
    }),

    // Database Module
    TypeOrmModule.forRoot({
      ...staticDatabaseConfig,
      type: process.env.DB_TYPE as 'mysql' | 'postgres',
    } as TypeOrmModuleOptions),

    // Feature Modules
    AuthModule,
    BookingsModule,
    HotelsModule,
    RoomTypesModule,
    PromotionsModule,
    SupportModule,
    UsersModule,
  ],
})
export class AppModule {}
