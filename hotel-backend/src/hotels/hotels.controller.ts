// src/hotels/hotels.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Hotel } from './schemas/hotel.entity';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  async create(@Body() createHotelDto: Partial<Hotel>): Promise<Hotel> {
    try {
      return await this.hotelsService.create(createHotelDto);
    } catch (error) {
      throw new HttpException(
        `Failed to create hotel: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('minRating') minRating?: string,
  ): Promise<Hotel[]> {
    try {
      if (city) {
        return await this.hotelsService.findByCity(city);
      }
      if (minRating) {
        return await this.hotelsService.findByMinRating(parseFloat(minRating));
      }
      return await this.hotelsService.findAll();
    } catch (error) {
      throw new HttpException(
        `Failed to fetch hotels: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Hotel> {
    try {
      return await this.hotelsService.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to fetch hotel: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHotelDto: Partial<Hotel>,
  ): Promise<Hotel> {
    try {
      return await this.hotelsService.update(id, updateHotelDto);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to update hotel: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    try {
      return await this.hotelsService.remove(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to delete hotel: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
