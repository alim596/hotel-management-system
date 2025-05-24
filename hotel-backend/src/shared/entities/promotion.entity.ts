// src/shared/entities/promotion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'Percentage',
  FIXED_AMOUNT = 'Fixed Amount',
}

@Entity('Promotions')
@Index(['StartDate', 'EndDate'])
export class Promotion {
  @PrimaryGeneratedColumn()
  PromotionID: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  Code: string;

  @Column({ type: 'varchar', length: 255 })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  DiscountType: DiscountType;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  DiscountValue: number;

  @Column({ type: 'date' })
  StartDate: Date;

  @Column({ type: 'date' })
  EndDate: Date;

  @Column({ type: 'text', nullable: true })
  TermsAndConditions: string;

  @Column({ type: 'int', nullable: true })
  MaxUses: number;

  @Column({ type: 'int', default: 0 })
  CurrentUses: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  MinBookingAmount: number;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @CreateDateColumn()
  CreatedDate: Date;

  // Virtual properties
  get isCurrentlyActive(): boolean {
    const now = new Date();
    return (
      this.IsActive &&
      this.StartDate <= now &&
      this.EndDate >= now &&
      (this.MaxUses === null || this.CurrentUses < this.MaxUses)
    );
  }

  get discountDisplay(): string {
    if (this.DiscountType === DiscountType.PERCENTAGE) {
      return `${this.DiscountValue}% OFF`;
    } else {
      return `$${this.DiscountValue} OFF`;
    }
  }

  get usageStatus(): string {
    if (this.MaxUses === null) {
      return `${this.CurrentUses} uses (unlimited)`;
    }
    return `${this.CurrentUses}/${this.MaxUses} uses`;
  }

  get daysRemaining(): number {
    const now = new Date();
    const diffTime = this.EndDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
