// src/bookings/bookings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Reservation, ReservationStatus } from './schemas/reservation.entity';
import { ReservationDetail } from './schemas/reservation-detail.entity';
import { ErrorService } from '../shared/services/error.service';

interface DatabaseResult {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

interface DatabaseError extends Error {
  message: string;
}

interface RawReservationResult {
  ReservationID: number;
  GuestID: number;
  BookingDate: Date;
  CheckInDate: Date;
  CheckOutDate: Date;
  NumberOfGuests: number;
  SpecialRequests: string;
  Status: ReservationStatus;
  TotalPrice: number;
  DiscountAmount: number;
  TaxAmount: number;
  FinalAmount: number;
  PromotionID?: number;
  CancellationDate?: Date;
  CancellationReason?: string;
  ReservationDetailID?: number;
  RoomID?: number;
  DailyRate?: number;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly errorService: ErrorService,
  ) {}

  // Get all reservations
  async findAll(): Promise<Reservation[]> {
    try {
      const query = `
        SELECT r.*, rd.* 
        FROM Reservations r
        LEFT JOIN ReservationDetails rd ON r.ReservationID = rd.ReservationID
        ORDER BY r.BookingDate DESC
      `;
      const reservations =
        await this.dataSource.query<RawReservationResult[]>(query);
      return this.mapReservationResults(reservations);
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Get reservation by ID
  async findOne(id: number): Promise<Reservation> {
    try {
      const query = `
        SELECT r.*, rd.* 
        FROM Reservations r
        LEFT JOIN ReservationDetails rd ON r.ReservationID = rd.ReservationID
        WHERE r.ReservationID = ?
      `;
      const [reservation] = await this.dataSource.query<RawReservationResult[]>(
        query,
        [id],
      );

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${id} not found`);
      }

      return this.mapReservationResults([reservation])[0];
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Get reservations by guest ID
  async findByGuest(guestId: number): Promise<Reservation[]> {
    try {
      const query = `
        SELECT r.*, rd.* 
        FROM Reservations r
        LEFT JOIN ReservationDetails rd ON r.ReservationID = rd.ReservationID
        WHERE r.GuestID = ?
        ORDER BY r.BookingDate DESC
      `;
      const reservations = await this.dataSource.query<RawReservationResult[]>(
        query,
        [guestId],
      );
      return this.mapReservationResults(reservations);
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Create new reservation
  async create(
    reservationData: Partial<Reservation>,
    roomDetails: { RoomID: number; DailyRate: number }[],
  ): Promise<Reservation> {
    try {
      // Start transaction
      await this.dataSource.query('START TRANSACTION');

      try {
        // Insert reservation
        const columns = Object.keys(reservationData).join(', ');
        const values = Object.values(reservationData);
        const placeholders = values.map(() => '?').join(', ');

        const query = `
          INSERT INTO Reservations (${columns}) 
          VALUES (${placeholders})
        `;

        const result = await this.dataSource.query<DatabaseResult[]>(
          query,
          values,
        );
        const reservationId = result[0].insertId;

        // Insert reservation details
        for (const room of roomDetails) {
          const detailQuery = `
            INSERT INTO ReservationDetails (ReservationID, RoomID, DailyRate)
            VALUES (?, ?, ?)
          `;
          await this.dataSource.query(detailQuery, [
            reservationId,
            room.RoomID,
            room.DailyRate,
          ]);
        }

        // Commit transaction
        await this.dataSource.query('COMMIT');

        return this.findOne(reservationId);
      } catch (error) {
        // Rollback on error
        await this.dataSource.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Update reservation
  async update(
    id: number,
    reservationData: Partial<Reservation>,
  ): Promise<Reservation> {
    try {
      const updates = Object.entries(reservationData)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(reservationData), id];

      const query = `
        UPDATE Reservations 
        SET ${updates} 
        WHERE ReservationID = ?
      `;

      await this.dataSource.query(query, values);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const dbError = error as DatabaseError;
      throw new Error(`Failed to update reservation: ${dbError.message}`);
    }
  }

  // Cancel reservation
  async cancel(id: number, reason?: string): Promise<Reservation> {
    try {
      const query = `
        UPDATE Reservations 
        SET Status = ?, CancellationDate = NOW(), CancellationReason = ?
        WHERE ReservationID = ?
      `;

      await this.dataSource.query(query, [
        ReservationStatus.CANCELLED,
        reason,
        id,
      ]);
      return this.findOne(id);
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Get reservations by status
  async findByStatus(status: ReservationStatus): Promise<Reservation[]> {
    try {
      const query = `
        SELECT r.*, rd.* 
        FROM Reservations r
        LEFT JOIN ReservationDetails rd ON r.ReservationID = rd.ReservationID
        WHERE r.Status = ?
        ORDER BY r.BookingDate DESC
      `;
      const reservations = await this.dataSource.query<RawReservationResult[]>(
        query,
        [status],
      );
      return this.mapReservationResults(reservations);
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Get reservations by date range
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Reservation[]> {
    try {
      const reservations = await this.dataSource
        .createQueryBuilder()
        .select('r.*')
        .from(Reservation, 'r')
        .leftJoinAndSelect('r.reservationDetails', 'details')
        .where('r.CheckInDate >= :startDate', { startDate })
        .andWhere('r.CheckOutDate <= :endDate', { endDate })
        .orderBy('r.CheckInDate', 'ASC')
        .getMany();

      return reservations;
    } catch (error) {
      throw this.errorService.mapReservationError(error);
    }
  }

  // Helper method to map raw SQL results to Reservation objects
  private mapReservationResults(
    results: RawReservationResult[],
  ): Reservation[] {
    return results.map((result) => {
      const reservation = new Reservation();
      Object.assign(reservation, {
        ReservationID: result.ReservationID,
        GuestID: result.GuestID,
        BookingDate: result.BookingDate,
        CheckInDate: result.CheckInDate,
        CheckOutDate: result.CheckOutDate,
        NumberOfGuests: result.NumberOfGuests,
        SpecialRequests: result.SpecialRequests,
        Status: result.Status,
        TotalPrice: result.TotalPrice,
        DiscountAmount: result.DiscountAmount,
        TaxAmount: result.TaxAmount,
        FinalAmount: result.FinalAmount,
        PromotionID: result.PromotionID,
        CancellationDate: result.CancellationDate,
        CancellationReason: result.CancellationReason,
      });

      if (result.ReservationDetailID) {
        const detail = new ReservationDetail();
        Object.assign(detail, {
          ReservationDetailID: result.ReservationDetailID,
          ReservationID: result.ReservationID,
          RoomID: result.RoomID,
          DailyRate: result.DailyRate,
        });
        reservation.reservationDetails = [detail];
      }

      return reservation;
    });
  }
}
