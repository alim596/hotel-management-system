import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsPositive,
} from 'class-validator';

export class RoomDetailDto {
  @IsNumber()
  @IsNotEmpty()
  RoomID: number;

  @IsNumber()
  @IsPositive()
  DailyRate: number;
}

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  GuestID: number;

  @IsDateString()
  @IsNotEmpty()
  CheckInDate: string;

  @IsDateString()
  @IsNotEmpty()
  CheckOutDate: string;

  @IsNumber()
  @Min(1)
  NumberOfGuests: number;

  @IsString()
  @IsOptional()
  SpecialRequests?: string;

  @IsNumber()
  @IsPositive()
  TotalPrice: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  TaxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  DiscountAmount?: number;

  @IsNumber()
  @IsPositive()
  FinalAmount: number;

  @IsNumber()
  @IsOptional()
  PromotionID?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one room must be selected' })
  @Type(() => RoomDetailDto)
  RoomDetails: RoomDetailDto[];
}
