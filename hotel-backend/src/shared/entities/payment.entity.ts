// src/shared/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Reservation } from '../../bookings/schemas/reservation.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
  PAYPAL = 'PayPal',
  BANK_TRANSFER = 'Bank Transfer',
  CASH = 'Cash',
  CRYPTO = 'Crypto',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
  CANCELLED = 'Cancelled',
}

@Entity('Payments')
@Index(['Status'])
@Index(['PaymentDate'])
@Index(['ReservationID'])
export class Payment {
  @PrimaryGeneratedColumn()
  PaymentID: number;

  @Column()
  ReservationID: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  Amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  Currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  PaymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  TransactionID: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  Status: PaymentStatus;

  @CreateDateColumn()
  PaymentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  ProcessedDate: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  RefundAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  RefundDate: Date;

  @Column({ type: 'json', nullable: true })
  GatewayResponse: any;

  // Relationships
  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'ReservationID' })
  reservation: Reservation;

  // Virtual properties
  get isCompleted(): boolean {
    return this.Status === PaymentStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.Status === PaymentStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.Status === PaymentStatus.FAILED;
  }

  get isRefunded(): boolean {
    return this.Status === PaymentStatus.REFUNDED;
  }

  get formattedAmount(): string {
    return `${this.Currency} ${this.Amount.toFixed(2)}`;
  }

  get netAmount(): number {
    return this.Amount - this.RefundAmount;
  }
}
