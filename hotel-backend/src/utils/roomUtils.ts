import { pool } from '../index';
import { BookingStatus } from '../shared/types';

interface QueryCount {
  count: string;
}

export async function checkRoomAvailability(
  roomId: number,
  checkIn: Date,
  checkOut: Date,
): Promise<boolean> {
  const result = await pool.query<QueryCount>(
    `SELECT COUNT(*) as count
     FROM bookings 
     WHERE room_id = $1 
     AND status != $2
     AND (
       (check_in <= $3 AND check_out >= $3)
       OR (check_in <= $4 AND check_out >= $4)
       OR (check_in >= $3 AND check_out <= $4)
     )`,
    [roomId, BookingStatus.CANCELLED, checkIn, checkOut],
  );

  return parseInt(result.rows[0].count) === 0;
}
