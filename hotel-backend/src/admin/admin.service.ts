// src/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/schemas/user.entity';
import { Reservation } from '../bookings/schemas/reservation.entity';
import { Hotel } from '../hotels/schemas/hotel.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private users: Repository<User>,
    @InjectRepository(Reservation)
    private bookings: Repository<Reservation>,
    @InjectRepository(Hotel)
    private hotels: Repository<Hotel>,
  ) {}

  async getUsers(): Promise<User[]> {
    return this.users.find();
  }

  async updateUserRole(id: string, role: User['role']): Promise<User> {
    const user = await this.users.findOneBy({ id: Number(id) });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.users.save(user);
  }

  async getBookings(): Promise<Reservation[]> {
    return this.bookings.find({
      relations: ['reservationDetails'], // this one actually exists
    });
  }

  async getHotels(): Promise<Hotel[]> {
    // no ‘rooms’ relation defined on Hotel, so load flat list
    return this.hotels.find();
  }

  async getDashboardStats() {
    // Temporarily remove the try/catch so you get the real error:
    const totalUsers = await this.users.count();
    const totalBookings = await this.bookings.count();
    const totalHotels = await this.hotels.count();

    console.log('[AdminService] counts:', {
      totalUsers,
      totalBookings,
      totalHotels,
    });

    // Run the SUM query
    const raw = await this.bookings
      .createQueryBuilder('b')
      // quote the column exactly as it exists in the DB:
      .select('SUM(b."TotalPrice")', 'sum')
      .getRawOne<{ sum: string | null }>();

    console.log('[AdminService] raw revenue:', raw);

    const sumString = raw?.sum ?? '0';
    const totalRevenue = parseFloat(sumString) || 0;

    return { totalUsers, totalBookings, totalHotels, totalRevenue };
  }
}
