// src/promotions/promotions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Promotion } from '../shared/entities/promotion.entity';

// DTO for creating promotions
export interface CreatePromotionDto {
  Code: string;
  Name: string;
  Description?: string;
  DiscountType: 'Percentage' | 'Fixed Amount';
  DiscountValue: number;
  StartDate: string;
  EndDate: string;
  TermsAndConditions?: string;
  MaxUses?: number;
  MinBookingAmount?: number;
}

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async findAll(): Promise<Promotion[]> {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Promotion> {
    const promotion = await this.promotionsService.findOne(id);
    if (!promotion) {
      throw new HttpException('Promotion not found', HttpStatus.NOT_FOUND);
    }
    return promotion;
  }

  @Post()
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<Promotion> {
    return this.promotionsService.create(createPromotionDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromotionDto: Partial<CreatePromotionDto>,
  ): Promise<Promotion> {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.promotionsService.remove(id);
  }
}
