// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// import the entity classes whose repos you inject
import { User } from '../users/schemas/user.entity';
import { Reservation } from '../bookings/schemas/reservation.entity';
import { Hotel } from '../hotels/schemas/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Reservation, Hotel])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
