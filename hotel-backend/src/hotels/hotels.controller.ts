import { Controller, Get, Param } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import type { Hotel } from './schemas/hotel.schema/hotel.schema';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(): Hotel[] {
    return this.hotelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Hotel {
    return this.hotelsService.findOne(id);
  }
}
