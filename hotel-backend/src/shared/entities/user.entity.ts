// src/shared/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum UserType {
  GUEST = 'Guest',
  HOTEL_STAFF = 'HotelStaff',
  ADMINISTRATOR = 'Administrator',
}

@Entity('Users')
@Index(['UserType'])
export class User {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  Email: string;

  @Column({ type: 'varchar', length: 255 })
  Password: string;

  @Column({ type: 'varchar', length: 100 })
  FirstName: string;

  @Column({ type: 'varchar', length: 100 })
  LastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  PhoneNumber: string;

  @Column({ type: 'date', nullable: true })
  DateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  Address: string;

  @CreateDateColumn()
  RegistrationDate: Date;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  UserType: UserType;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  LastLoginDate: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.FirstName} ${this.LastName}`;
  }

  get isGuest(): boolean {
    return this.UserType === UserType.GUEST;
  }

  get isStaff(): boolean {
    return this.UserType === UserType.HOTEL_STAFF;
  }

  get isAdmin(): boolean {
    return this.UserType === UserType.ADMINISTRATOR;
  }
}
