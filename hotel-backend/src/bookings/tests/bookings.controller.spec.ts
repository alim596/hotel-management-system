import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from '../bookings.controller';
import { BookingsService } from '../bookings.service';
import { ReservationStatus } from '../schemas/reservation.entity';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByStatus: jest.fn(),
    findByDateRange: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    findByGuest: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    const futureDatePlus5 = new Date(futureDate);
    futureDatePlus5.setDate(futureDatePlus5.getDate() + 4); // 5 days from tomorrow

    const createDto: CreateReservationDto = {
      GuestID: 1,
      CheckInDate: futureDate.toISOString().split('T')[0],
      CheckOutDate: futureDatePlus5.toISOString().split('T')[0],
      NumberOfGuests: 2,
      TotalPrice: 1000,
      FinalAmount: 1100,
      RoomDetails: [{ RoomID: 1, DailyRate: 200 }],
    };

    it('should create a reservation successfully', async () => {
      mockBookingsService.create.mockResolvedValue(mockReservation);

      const result = await controller.create(createDto);
      expect(result).toBeDefined();
      expect(result.ReservationID).toBe(mockReservation.ReservationID);
      expect(mockBookingsService.create).toHaveBeenCalled();
    });

    it('should validate check-in date is not in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday

      const pastDto = {
        ...createDto,
        CheckInDate: pastDate.toISOString().split('T')[0],
      };

      await expect(controller.create(pastDto)).rejects.toThrow(
        new HttpException(
          'Check-in date cannot be in the past',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should validate check-out date is after check-in date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); // 5 days from now
      const earlierDate = new Date();
      earlierDate.setDate(earlierDate.getDate() + 1); // tomorrow

      const invalidDateDto = {
        ...createDto,
        CheckInDate: futureDate.toISOString().split('T')[0],
        CheckOutDate: earlierDate.toISOString().split('T')[0],
      };

      await expect(controller.create(invalidDateDto)).rejects.toThrow(
        new HttpException(
          'Check-out date must be after check-in date',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should require at least one room', async () => {
      const noRoomDto = {
        ...createDto,
        RoomDetails: [],
      };

      await expect(controller.create(noRoomDto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      mockBookingsService.findAll.mockResolvedValue([mockReservation]);

      const result = await controller.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toEqual(mockReservation);
    });

    it('should filter by status', async () => {
      mockBookingsService.findByStatus.mockResolvedValue([mockReservation]);

      const result = await controller.findAll(ReservationStatus.PENDING);
      expect(result).toBeInstanceOf(Array);
      expect(result[0].Status).toBe(ReservationStatus.PENDING);
    });

    it('should filter by date range', async () => {
      mockBookingsService.findByDateRange.mockResolvedValue([mockReservation]);

      const result = await controller.findAll(
        undefined,
        '2024-04-01',
        '2024-04-05',
      );
      expect(result).toBeInstanceOf(Array);
      expect(mockBookingsService.findByDateRange).toHaveBeenCalled();
    });

    it('should handle invalid date format', async () => {
      await expect(
        controller.findAll(undefined, 'invalid-date', '2024-04-05'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('should return a single reservation', async () => {
      mockBookingsService.findOne.mockResolvedValue(mockReservation);

      const result = await controller.findOne(1);
      expect(result).toBeDefined();
      expect(result.ReservationID).toBe(mockReservation.ReservationID);
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      mockBookingsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe('findByGuest', () => {
    it('should return guest reservations', async () => {
      mockBookingsService.findByGuest.mockResolvedValue([mockReservation]);

      const result = await controller.findByGuest(1);
      expect(result).toBeInstanceOf(Array);
      expect(result[0].GuestID).toBe(mockReservation.GuestID);
    });
  });

  describe('remove', () => {
    it('should cancel a reservation', async () => {
      mockBookingsService.cancel.mockResolvedValue(mockReservation);

      const result = await controller.remove(1);
      expect(result).toEqual({ message: 'Reservation cancelled successfully' });
      expect(mockBookingsService.cancel).toHaveBeenCalledWith(
        1,
        'Deleted by user',
      );
    });

    it('should handle cancellation errors', async () => {
      mockBookingsService.cancel.mockRejectedValue(
        new Error('Cancellation failed'),
      );

      await expect(controller.remove(1)).rejects.toThrow(HttpException);
    });
  });
});
