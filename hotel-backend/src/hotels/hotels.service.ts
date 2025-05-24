// src/hotels/hotels.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Hotel } from './schemas/hotel.entity';

interface DatabaseResult {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

interface DatabaseError extends Error {
  message: string;
}

@Injectable()
export class HotelsService {
  constructor(private readonly dataSource: DataSource) {}

  // Get all hotels
  async findAll(): Promise<Hotel[]> {
    try {
      const query = `
        SELECT * FROM Hotels 
        WHERE IsActive = true 
        ORDER BY StarRating DESC
      `;
      const hotels = await this.dataSource.query<Hotel[]>(query);
      return hotels;
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch hotels: ${dbError.message}`);
    }
  }

  // Get hotel by ID
  async findOne(id: number): Promise<Hotel> {
    try {
      const query = `
        SELECT * FROM Hotels 
        WHERE HotelID = ? AND IsActive = true
      `;
      const [hotel] = await this.dataSource.query<Hotel[]>(query, [id]);

      if (!hotel) {
        throw new NotFoundException(`Hotel with ID ${id} not found`);
      }

      return hotel;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch hotel: ${dbError.message}`);
    }
  }

  // Create new hotel
  async create(hotelData: Partial<Hotel>): Promise<Hotel> {
    try {
      const columns = Object.keys(hotelData).join(', ');
      const values = Object.values(hotelData);
      const placeholders = values.map(() => '?').join(', ');

      const query = `
        INSERT INTO Hotels (${columns}) 
        VALUES (${placeholders})
      `;

      const result = await this.dataSource.query(query, values);
      const insertResult = result[0] as DatabaseResult;
      return this.findOne(insertResult.insertId);
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to create hotel: ${dbError.message}`);
    }
  }

  // Update hotel
  async update(id: number, hotelData: Partial<Hotel>): Promise<Hotel> {
    try {
      const updates = Object.entries(hotelData)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(hotelData), id];

      const query = `
        UPDATE Hotels 
        SET ${updates} 
        WHERE HotelID = ?
      `;

      await this.dataSource.query(query, values);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new Error(`Failed to update hotel: ${dbError.message}`);
    }
  }

  // Soft delete hotel
  async remove(id: number): Promise<{ message: string }> {
    try {
      const hotel = await this.findOne(id);
      const query = `
        UPDATE Hotels 
        SET IsActive = false 
        WHERE HotelID = ?
      `;

      await this.dataSource.query(query, [id]);
      return { message: `Hotel ${hotel.Name} has been deactivated` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new Error(`Failed to delete hotel: ${dbError.message}`);
    }
  }

  // Search hotels by city
  async findByCity(city: string): Promise<Hotel[]> {
    try {
      const query = `
        SELECT * FROM Hotels 
        WHERE City = ? AND IsActive = true 
        ORDER BY StarRating DESC
      `;

      const hotels = await this.dataSource.query<Hotel[]>(query, [city]);
      return hotels;
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch hotels by city: ${dbError.message}`);
    }
  }

  // Get hotels with minimum star rating
  async findByMinRating(minRating: number): Promise<Hotel[]> {
    try {
      const query = `
        SELECT * FROM Hotels 
        WHERE StarRating >= ? AND IsActive = true 
        ORDER BY StarRating DESC
      `;

      const hotels = await this.dataSource.query<Hotel[]>(query, [minRating]);
      return hotels;
    } catch (error) {
      const dbError = error as DatabaseError;
      throw new Error(`Failed to fetch hotels by rating: ${dbError.message}`);
    }
  }
}
