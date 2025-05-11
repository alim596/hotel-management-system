import { Injectable } from '@nestjs/common';
import { HOTELS } from '../mock-data';

@Injectable()
export class HotelsService {
  findAll(): typeof HOTELS {
    return HOTELS;
  }

  findOne(id: string) {
    const hotel = HOTELS.find((h) => h.id === id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    return hotel;
  }
}
