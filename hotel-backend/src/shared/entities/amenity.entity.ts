// src/shared/entities/amenity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum AmenityCategory {
  ROOM = 'Room',
  HOTEL = 'Hotel',
  SPA = 'Spa',
  DINING = 'Dining',
  RECREATION = 'Recreation',
  BUSINESS = 'Business',
  TRANSPORTATION = 'Transportation',
}

@Entity('Amenities')
@Index(['Category'])
export class Amenity {
  @PrimaryGeneratedColumn()
  AmenityID: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({
    type: 'enum',
    enum: AmenityCategory,
  })
  Category: AmenityCategory;

  @Column({ type: 'varchar', length: 100, nullable: true })
  Icon: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  // Virtual properties
  get displayName(): string {
    return this.Name;
  }

  get categoryIcon(): string {
    switch (this.Category) {
      case AmenityCategory.ROOM:
        return '🏠';
      case AmenityCategory.HOTEL:
        return '🏨';
      case AmenityCategory.SPA:
        return '🧴';
      case AmenityCategory.DINING:
        return '🍽️';
      case AmenityCategory.RECREATION:
        return '🎾';
      case AmenityCategory.BUSINESS:
        return '💼';
      case AmenityCategory.TRANSPORTATION:
        return '🚗';
      default:
        return '📋';
    }
  }
}
