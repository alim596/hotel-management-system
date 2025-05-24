// src/promotions/promotions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Promotion } from '../shared/entities/promotion.entity';
import { CreatePromotionDto } from './promotions.controller';

interface DatabaseResult {
  affectedRows?: number;
  insertId?: number;
}

@Injectable()
export class PromotionsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<Promotion[]> {
    try {
      const promotions = await this.dataSource.query<Promotion[]>(
        `SELECT * FROM Promotions ORDER BY StartDate DESC`,
      );
      return promotions;
    } catch (error: any) {
      throw new Error(`Failed to fetch promotions: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Promotion> {
    try {
      const [promotion] = await this.dataSource.query<Promotion[]>(
        `SELECT * FROM Promotions WHERE PromotionID = ?`,
        [id],
      );
      if (!promotion) {
        throw new NotFoundException(`Promotion with ID ${id} not found`);
      }
      return promotion;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch promotion: ${error.message}`);
    }
  }

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    try {
      const result = await this.dataSource.query<DatabaseResult>(
        `INSERT INTO Promotions (
          Code, 
          Name, 
          Description, 
          DiscountType, 
          DiscountValue, 
          StartDate, 
          EndDate, 
          TermsAndConditions, 
          MaxUses, 
          MinBookingAmount, 
          IsActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
        [
          createPromotionDto.Code,
          createPromotionDto.Name,
          createPromotionDto.Description,
          createPromotionDto.DiscountType,
          createPromotionDto.DiscountValue,
          new Date(createPromotionDto.StartDate),
          new Date(createPromotionDto.EndDate),
          createPromotionDto.TermsAndConditions,
          createPromotionDto.MaxUses,
          createPromotionDto.MinBookingAmount,
        ],
      );

      if (!result.insertId) {
        throw new Error('Failed to get inserted promotion ID');
      }

      return this.findOne(result.insertId);
    } catch (error: any) {
      throw new Error(`Failed to create promotion: ${error.message}`);
    }
  }

  async update(
    id: number,
    updatePromotionDto: Partial<CreatePromotionDto>,
  ): Promise<Promotion> {
    try {
      // First check if promotion exists
      await this.findOne(id);

      // Build SET clause dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];

      if (updatePromotionDto.Code) {
        updates.push('Code = ?');
        values.push(updatePromotionDto.Code);
      }
      if (updatePromotionDto.Name) {
        updates.push('Name = ?');
        values.push(updatePromotionDto.Name);
      }
      if ('Description' in updatePromotionDto) {
        updates.push('Description = ?');
        values.push(updatePromotionDto.Description);
      }
      if (updatePromotionDto.DiscountType) {
        updates.push('DiscountType = ?');
        values.push(updatePromotionDto.DiscountType);
      }
      if (updatePromotionDto.DiscountValue) {
        updates.push('DiscountValue = ?');
        values.push(updatePromotionDto.DiscountValue);
      }
      if (updatePromotionDto.StartDate) {
        updates.push('StartDate = ?');
        values.push(new Date(updatePromotionDto.StartDate));
      }
      if (updatePromotionDto.EndDate) {
        updates.push('EndDate = ?');
        values.push(new Date(updatePromotionDto.EndDate));
      }
      if ('TermsAndConditions' in updatePromotionDto) {
        updates.push('TermsAndConditions = ?');
        values.push(updatePromotionDto.TermsAndConditions);
      }
      if ('MaxUses' in updatePromotionDto) {
        updates.push('MaxUses = ?');
        values.push(updatePromotionDto.MaxUses);
      }
      if ('MinBookingAmount' in updatePromotionDto) {
        updates.push('MinBookingAmount = ?');
        values.push(updatePromotionDto.MinBookingAmount);
      }

      // Add the ID to values array
      values.push(id);

      await this.dataSource.query<DatabaseResult>(
        `UPDATE Promotions SET ${updates.join(', ')} WHERE PromotionID = ?`,
        values,
      );

      return this.findOne(id);
    } catch (error: any) {
      throw new Error(`Failed to update promotion: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.dataSource.query<DatabaseResult>(
        `DELETE FROM Promotions WHERE PromotionID = ?`,
        [id],
      );

      if (!result.affectedRows || result.affectedRows === 0) {
        throw new NotFoundException(`Promotion with ID ${id} not found`);
      }
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete promotion: ${error.message}`);
    }
  }
}
