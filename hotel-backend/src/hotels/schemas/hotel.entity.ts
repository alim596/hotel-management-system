// src/hotels/schemas/hotel.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('Hotels')
@Index(['City', 'Country'])
@Index(['StarRating'])
@Index(['IsActive'])
export class Hotel {
  @PrimaryGeneratedColumn()
  HotelID: number;

  @Column({ type: 'varchar', length: 255 })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 1,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  StarRating: number;

  @Column({ type: 'time', default: '15:00:00' })
  CheckInTime: string;

  @Column({ type: 'time', default: '11:00:00' })
  CheckOutTime: string;

  @Column({ type: 'text' })
  Address: string;

  @Column({ type: 'varchar', length: 100 })
  City: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  State: string;

  @Column({ type: 'varchar', length: 100 })
  Country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  PostalCode: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  PhoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  WebsiteURL: string;

  @CreateDateColumn()
  RegistrationDate: Date;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'int', default: 0 })
  TotalRooms: number;

  // Relationships - temporarily commented out to avoid circular dependency
  // @OneToMany(() => RoomType, roomType => roomType.hotel)
  // roomTypes: RoomType[];

  // Virtual properties for API responses
  get averageRating(): number {
    // This will be calculated via joins in service layer
    return 0;
  }

  get totalReviews(): number {
    // This will be calculated via joins in service layer
    return 0;
  }
}
