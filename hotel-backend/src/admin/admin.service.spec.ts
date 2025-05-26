import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserRole } from '../shared/types';
import { User } from '../users/schemas/user.entity';
import { Reservation } from '../bookings/schemas/reservation.entity';
import { Hotel } from '../hotels/schemas/hotel.entity';

describe('AdminService', () => {
  let service: AdminService;
  let usersRepo: Repository<User>;
  let bookingsRepo: Repository<Reservation>;
  let hotelsRepo: Repository<Hotel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Hotel),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    bookingsRepo = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
    hotelsRepo = module.get<Repository<Hotel>>(getRepositoryToken(Hotel));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('returns users array', async () => {
      const mockUsers = [{ id: 1 }] as unknown as User[];
      jest.spyOn(usersRepo, 'find').mockResolvedValue(mockUsers);
      const result = await service.getUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('updateUserRole', () => {
    it('updates role when user exists', async () => {
      const user = { id: 1, role: UserRole.GUEST } as unknown as User;
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(user);
      jest
        .spyOn(usersRepo, 'save')
        .mockResolvedValue({ ...user, role: UserRole.ADMIN });

      const updated = await service.updateUserRole('1', UserRole.ADMIN);
      expect(updated.role).toBe(UserRole.ADMIN);
    });

    it('throws NotFoundException when user not found', async () => {
      jest.spyOn(usersRepo, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.updateUserRole('1', UserRole.ADMIN),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getBookings', () => {
    it('returns bookings', async () => {
      const mock = [{ id: 1 }] as unknown as Reservation[];
      jest.spyOn(bookingsRepo, 'find').mockResolvedValue(mock);
      const result = await service.getBookings();
      expect(result).toEqual(mock);
    });
  });

  describe('getHotels', () => {
    it('returns hotels', async () => {
      const mock = [{ id: 1 }] as unknown as Hotel[];
      jest.spyOn(hotelsRepo, 'find').mockResolvedValue(mock);
      const result = await service.getHotels();
      expect(result).toEqual(mock);
    });
  });

  describe('getDashboardStats', () => {
    it('computes stats correctly', async () => {
      jest.spyOn(usersRepo, 'count').mockResolvedValue(2);
      jest.spyOn(bookingsRepo, 'count').mockResolvedValue(3);
      jest.spyOn(hotelsRepo, 'count').mockResolvedValue(4);
      jest.spyOn(bookingsRepo, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            select: () => ({
              getRawOne: async () => ({ sum: '150' }),
            }),
          }) as any,
      );

      const stats = await service.getDashboardStats();
      expect(stats).toEqual({
        totalUsers: 2,
        totalBookings: 3,
        totalHotels: 4,
        totalRevenue: 150,
      });
    });
  });
});
