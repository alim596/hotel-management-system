// src/database/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Import all entities
import { User } from '../../shared/entities/user.entity';
import { Guest } from '../../shared/entities/guest.entity';
import { HotelStaff } from '../../shared/entities/hotel-staff.entity';
import { Hotel } from '../../hotels/schemas/hotel.entity';
import { Room } from '../../shared/entities/room.entity';
import { RoomType } from '../../room-types/schemas/room-type.entity';
import { Amenity } from '../../shared/entities/amenity.entity';
import { HotelAmenity } from '../../shared/entities/hotel-amenity.entity';
import { Reservation } from '../../bookings/schemas/reservation.entity';
import { ReservationDetail } from '../../bookings/schemas/reservation-detail.entity';
import { Payment } from '../../shared/entities/payment.entity';
import { Promotion } from '../../shared/entities/promotion.entity';
import { Review } from '../../shared/entities/review.entity';
import { Notification } from '../../shared/entities/notification.entity';
import { SupportMessage } from '../../support_forms/support_message.entity';

export const staticDatabaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'hoteluser',
  password: process.env.DB_PASSWORD || 'hotelpassword',
  database: process.env.DB_NAME || 'hotel_booking_system',
  entities: [
    User,
    Guest,
    HotelStaff,
    Hotel,
    Room,
    RoomType,
    Amenity,
    HotelAmenity,
    Reservation,
    ReservationDetail,
    Payment,
    Promotion,
    Review,
    Notification,
    SupportMessage,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
  charset: 'utf8mb4',
  timezone: 'Z',
  connectTimeout: 30000,
  // Additional settings for better performance and reliability
  extra: {
    connectionLimit: 100,
    queueLimit: 0,
    waitForConnections: true,
  },
  // Disable automatic migrations since we're using custom migration logic
  migrationsRun: false,
  migrations: [],
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
};
