// src/room-types/room-types.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import type { RoomType } from './schemas/room-type.schema/room-type.schema';

@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  /**
   * GET /api/room-types/:hotelId
   * Returns all room types for the given hotel
   */
  @Get(':hotelId')
  findByHotel(@Param('hotelId') hotelId: string): RoomType[] {
    return this.roomTypesService.findByHotel(hotelId);
  }
}
