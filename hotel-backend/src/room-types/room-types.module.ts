// src/room-types/room-types.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';
import { RoomType } from './schemas/room-type.entity';
import { HotelsModule } from '../hotels/hotels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomType]),
    HotelsModule, // Import to access Hotel entity
  ],
  controllers: [RoomTypesController],
  providers: [RoomTypesService],
  exports: [RoomTypesService, TypeOrmModule],
})
export class RoomTypesModule {}
