// src/room-types/room-types.controller.ts
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
import { RoomTypesService } from './room-types.service';
import { RoomType } from './schemas/room-type.entity';

// DTO for creating room types
export interface CreateRoomTypeDto {
  HotelID: number;
  Name: string;
  Description?: string;
  Capacity: number;
  BedType?: string;
  SizeInSqFt?: number;
  BasePrice: number;
  RoomImages?: string[];
  MaxOccupancy?: number;
}

@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  async create(
    @Body() createRoomTypeDto: CreateRoomTypeDto,
  ): Promise<RoomType> {
    try {
      return await this.roomTypesService.create(createRoomTypeDto);
    } catch (error) {
      throw new HttpException(
        `Failed to create room type: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(
    @Query('hotelId') hotelId?: string,
    @Query('minCapacity') minCapacity?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<RoomType[]> {
    try {
      if (hotelId) {
        const hotelIdNum = parseInt(hotelId, 10);
        if (isNaN(hotelIdNum)) {
          throw new HttpException('Invalid hotel ID', HttpStatus.BAD_REQUEST);
        }
        return await this.roomTypesService.findByHotel(hotelIdNum);
      }

      if (minCapacity) {
        const capacity = parseInt(minCapacity, 10);
        if (isNaN(capacity)) {
          throw new HttpException(
            'Invalid capacity value',
            HttpStatus.BAD_REQUEST,
          );
        }
        return await this.roomTypesService.findByCapacity(capacity);
      }

      if (minPrice && maxPrice) {
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (isNaN(min) || isNaN(max)) {
          throw new HttpException(
            'Invalid price values',
            HttpStatus.BAD_REQUEST,
          );
        }
        return await this.roomTypesService.findByPriceRange(min, max);
      }

      return await this.roomTypesService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch room types: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoomType> {
    try {
      return await this.roomTypesService.findOne(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to fetch room type: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('hotel/:hotelId')
  async findByHotel(
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ): Promise<RoomType[]> {
    try {
      return await this.roomTypesService.findByHotel(hotelId);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch room types for hotel: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomTypeDto: Partial<CreateRoomTypeDto>,
  ): Promise<RoomType> {
    try {
      return await this.roomTypesService.update(id, updateRoomTypeDto);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to update room type: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    try {
      return await this.roomTypesService.remove(id);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to delete room type: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
