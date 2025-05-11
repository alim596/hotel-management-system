import { Injectable } from '@nestjs/common';
import { ROOM_TYPES } from '../mock-data';
import type { RoomType } from './schemas/room-type.schema/room-type.schema';

@Injectable()
export class RoomTypesService {
  findByHotel(hotelId: string): RoomType[] {
    return ROOM_TYPES.filter((rt) => rt.hotelId === hotelId);
  }
}
