import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BookingsService } from '../bookings.service';
import { ReservationStatus } from '../schemas/reservation.entity';
import { NotFoundException } from '@nestjs/common';
import { ErrorService } from '../../shared/services/error.service';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockDataSource = {
    query: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockErrorService = {
    mapDatabaseError: jest.fn((error) => error),
    mapReservationError: jest.fn((error) => {
      if (error.message === 'Database error') {
        return new Error('Failed to fetch reservations');
      }
      if (error.message === 'Insert failed') {
        return new Error('Failed to create reservation');
      }
      if (error.message === 'Update failed') {
        return new Error('Failed to cancel reservation');
      }
      if (error.message === 'Query failed') {
        return new Error('Failed to fetch reservations by date range');
      }
      return error;
    }),
  };

  const mockReservation = {
    ReservationID: 1,
    GuestID: 1,
    BookingDate: new Date(),
    CheckInDate: new Date('2024-04-01'),
    CheckOutDate: new Date('2024-04-05'),
    NumberOfGuests: 2,
    Status: ReservationStatus.PENDING,
    TotalPrice: 1000,
    FinalAmount: 1100,
  };

  const mockRoomDetails = [{ RoomID: 1, DailyRate: 200 }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ErrorService,
          useValue: mockErrorService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of reservations', async () => {
      const mockResults = [{ ...mockReservation }];
      mockDataSource.query.mockResolvedValueOnce(mockResults);

      const result = await service.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty(
        'ReservationID',
        mockReservation.ReservationID,
      );
      expect(mockDataSource.query).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('Database error'));
      await expect(service.findAll()).rejects.toThrow(
        'Failed to fetch reservations',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single reservation', async () => {
      mockDataSource.query.mockResolvedValueOnce([mockReservation]);

      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result.ReservationID).toBe(mockReservation.ReservationID);
    });

    it('should throw NotFoundException when reservation not found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([]) // START TRANSACTION
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert reservation
        .mockResolvedValueOnce([]) // Insert room details
        .mockResolvedValueOnce([mockReservation]) // COMMIT
        .mockResolvedValueOnce([mockReservation]); // findOne query

      const result = await service.create(mockReservation, mockRoomDetails);
      expect(result).toBeDefined();
      expect(result.ReservationID).toBe(mockReservation.ReservationID);
    });

    it('should rollback transaction on error', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([]) // START TRANSACTION
        .mockRejectedValueOnce(new Error('Insert failed')); // Insert fails

      await expect(
        service.create(mockReservation, mockRoomDetails),
      ).rejects.toThrow('Failed to create reservation');

      expect(mockDataSource.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([]) // Update query
        .mockResolvedValueOnce([mockReservation]); // findOne query

      const result = await service.cancel(1, 'Test cancellation');
      expect(result).toBeDefined();
      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });

    it('should throw error when cancellation fails', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('Update failed'));
      await expect(service.cancel(1)).rejects.toThrow(
        'Failed to cancel reservation',
      );
    });
  });

  describe('findByStatus', () => {
    it('should return reservations with specified status', async () => {
      const mockResults = [
        { ...mockReservation, Status: ReservationStatus.CONFIRMED },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockResults);

      const result = await service.findByStatus(ReservationStatus.CONFIRMED);
      expect(result).toBeInstanceOf(Array);
      expect(result[0].Status).toBe(ReservationStatus.CONFIRMED);
    });
  });

  describe('findByDateRange', () => {
    it('should return reservations within date range', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockReservation]),
      };

      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const startDate = new Date('2024-04-01');
      const endDate = new Date('2024-04-05');
      const result = await service.findByDateRange(startDate, endDate);

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toEqual(mockReservation);
      expect(mockDataSource.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle query builder errors', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Query failed')),
      };

      mockDataSource.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.findByDateRange(new Date(), new Date()),
      ).rejects.toThrow('Failed to fetch reservations by date range');
    });
  });
});
