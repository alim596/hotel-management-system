// src/room-types/room-types.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoomType } from './schemas/room-type.entity';

interface DatabaseResult {
  affectedRows?: number;
  insertId?: number;
}

@Injectable()
export class RoomTypesService {
  constructor(private readonly dataSource: DataSource) {}

  // Get all room types
  async findAll(): Promise<RoomType[]> {
    try {
      const roomTypes = await this.dataSource.query<RoomType[]>(`
        SELECT rt.*, h.Name as HotelName 
        FROM RoomTypes rt
        LEFT JOIN Hotels h ON rt.HotelID = h.HotelID
        WHERE rt.IsActive = true
        ORDER BY rt.BasePrice ASC
      `);
      return roomTypes;
    } catch (error: any) {
      throw new Error(`Failed to fetch room types: ${error.message}`);
    }
  }

  // Get room type by ID
  async findOne(id: number): Promise<RoomType> {
    try {
      const [roomType] = await this.dataSource.query<RoomType[]>(
        `
        SELECT rt.*, h.Name as HotelName 
        FROM RoomTypes rt
        LEFT JOIN Hotels h ON rt.HotelID = h.HotelID
        WHERE rt.RoomTypeID = ? AND rt.IsActive = true
      `,
        [id],
      );

      if (!roomType) {
        throw new NotFoundException(`Room type with ID ${id} not found`);
      }

      return roomType;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch room type: ${error.message}`);
    }
  }

  // Get room types by hotel ID
  async findByHotel(hotelId: number): Promise<RoomType[]> {
    try {
      const roomTypes = await this.dataSource.query<RoomType[]>(
        `
        SELECT rt.*, h.Name as HotelName 
        FROM RoomTypes rt
        LEFT JOIN Hotels h ON rt.HotelID = h.HotelID
        WHERE rt.HotelID = ? AND rt.IsActive = true
        ORDER BY rt.BasePrice ASC
      `,
        [hotelId],
      );
      return roomTypes;
    } catch (error: any) {
      throw new Error(`Failed to fetch room types for hotel: ${error.message}`);
    }
  }

  // Create new room type
  async create(roomTypeData: Partial<RoomType>): Promise<RoomType> {
    try {
      const result = await this.dataSource.query<DatabaseResult>(
        `
        INSERT INTO RoomTypes (
          HotelID,
          Name,
          Description,
          Capacity,
          BedType,
          SizeInSqFt,
          BasePrice,
          RoomImages,
          MaxOccupancy,
          IsActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
      `,
        [
          roomTypeData.HotelID,
          roomTypeData.Name,
          roomTypeData.Description,
          roomTypeData.Capacity,
          roomTypeData.BedType,
          roomTypeData.SizeInSqFt,
          roomTypeData.BasePrice,
          JSON.stringify(roomTypeData.RoomImages || []),
          roomTypeData.MaxOccupancy,
        ],
      );

      if (!result.insertId) {
        throw new Error('Failed to get inserted room type ID');
      }

      return this.findOne(result.insertId);
    } catch (error: any) {
      throw new Error(`Failed to create room type: ${error.message}`);
    }
  }

  // Update room type
  async update(id: number, roomTypeData: Partial<RoomType>): Promise<RoomType> {
    try {
      // First check if room type exists
      await this.findOne(id);

      // Build SET clause dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (roomTypeData.HotelID) {
        updates.push('HotelID = ?');
        values.push(roomTypeData.HotelID);
      }
      if (roomTypeData.Name) {
        updates.push('Name = ?');
        values.push(roomTypeData.Name);
      }
      if ('Description' in roomTypeData) {
        updates.push('Description = ?');
        values.push(roomTypeData.Description);
      }
      if (roomTypeData.Capacity) {
        updates.push('Capacity = ?');
        values.push(roomTypeData.Capacity);
      }
      if ('BedType' in roomTypeData) {
        updates.push('BedType = ?');
        values.push(roomTypeData.BedType);
      }
      if ('SizeInSqFt' in roomTypeData) {
        updates.push('SizeInSqFt = ?');
        values.push(roomTypeData.SizeInSqFt);
      }
      if (roomTypeData.BasePrice) {
        updates.push('BasePrice = ?');
        values.push(roomTypeData.BasePrice);
      }
      if (roomTypeData.RoomImages) {
        updates.push('RoomImages = ?');
        values.push(JSON.stringify(roomTypeData.RoomImages));
      }
      if ('MaxOccupancy' in roomTypeData) {
        updates.push('MaxOccupancy = ?');
        values.push(roomTypeData.MaxOccupancy);
      }

      // Add the ID to values array
      values.push(id);

      await this.dataSource.query<DatabaseResult>(
        `
        UPDATE RoomTypes 
        SET ${updates.join(', ')} 
        WHERE RoomTypeID = ?
      `,
        values,
      );

      return this.findOne(id);
    } catch (error: any) {
      throw new Error(`Failed to update room type: ${error.message}`);
    }
  }

  // Soft delete room type
  async remove(id: number): Promise<{ message: string }> {
    try {
      const roomType = await this.findOne(id); // This will throw if not found

      await this.dataSource.query<DatabaseResult>(
        `
        UPDATE RoomTypes 
        SET IsActive = false 
        WHERE RoomTypeID = ?
      `,
        [id],
      );

      return { message: `Room type ${roomType.Name} has been deactivated` };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete room type: ${error.message}`);
    }
  }

  // Search room types by capacity
  async findByCapacity(minCapacity: number): Promise<RoomType[]> {
    try {
      const roomTypes = await this.dataSource.query<RoomType[]>(
        `
        SELECT rt.*, h.Name as HotelName 
        FROM RoomTypes rt
        LEFT JOIN Hotels h ON rt.HotelID = h.HotelID
        WHERE rt.Capacity >= ? 
        AND rt.IsActive = true
        ORDER BY rt.BasePrice ASC
      `,
        [minCapacity],
      );

      return roomTypes;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch room types by capacity: ${error.message}`,
      );
    }
  }

  // Search room types by price range
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<RoomType[]> {
    try {
      const roomTypes = await this.dataSource.query<RoomType[]>(
        `
        SELECT rt.*, h.Name as HotelName 
        FROM RoomTypes rt
        LEFT JOIN Hotels h ON rt.HotelID = h.HotelID
        WHERE rt.BasePrice >= ? 
        AND rt.BasePrice <= ?
        AND rt.IsActive = true
        ORDER BY rt.BasePrice ASC
      `,
        [minPrice, maxPrice],
      );

      return roomTypes;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch room types by price range: ${error.message}`,
      );
    }
  }
}
