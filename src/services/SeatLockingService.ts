import { db } from '@/config/db';

export interface SeatLockResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  data?: {
    seatId: string;
    seatDbId: number;
    sessionId: string;
    expiresAt: Date;
    isNewLock: boolean;
  };
}

export interface SeatStatusResult {
  success: boolean;
  data?: {
    bookedSeats: string[];
    lockedSeats: string[];
    unavailableSeats: string[];
  };
  error?: string;
}

export class SeatLockingService {

  /**
   * Convert seat string ID (e.g., "A06") to database seat ID
   */
  static async getSeatDatabaseId(connection: any, showtimeId: string, seatStringId: string): Promise<number | null> {
    try {
      const row = seatStringId.charAt(0);
      const number = parseInt(seatStringId.substring(1));

      // Get screen ID from showtime
      const [showtimeResult] = await connection.execute(
        `SELECT id_screen FROM showtimes WHERE id_showtime = ?`,
        [showtimeId]
      );

      if (!showtimeResult || (showtimeResult as any[]).length === 0) {
        return null;
      }

      const screenId = (showtimeResult as any[])[0].id_screen;

      // Get seat database ID
      const [seatResult] = await connection.execute(
        `SELECT id_seats FROM seat WHERE id_screen = ? AND seat_row = ? AND seat_number = ?`,
        [screenId, row, number]
      );

      if (!seatResult || (seatResult as any[]).length === 0) {
        return null;
      }

      return (seatResult as any[])[0].id_seats;
    } catch (error) {
      console.error('Error converting seat ID:', error);
      return null;
    }
  }

  /**
   * Lock a seat with proper transaction handling
   */
  static async lockSeat(showtimeId: string, seatId: string, sessionId: string): Promise<SeatLockResult> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Convert seat string ID to database ID
      const seatDbId = await this.getSeatDatabaseId(connection, showtimeId, seatId);
      if (!seatDbId) {
        await connection.rollback();
        return {
          success: false,
          error: 'Invalid seat ID or seat not found',
          errorCode: 'SEAT_NOT_FOUND'
        };
      }

      // 2. Check if seat is already booked
      const [bookingCheck] = await connection.execute(
        `SELECT COUNT(*) as count FROM detail_booking db
         JOIN bookings b ON db.id_booking = b.id_booking
         WHERE b.id_showtime = ? AND db.id_seats = ?
         AND b.booking_status != 'cancelled'
         FOR UPDATE`,
        [showtimeId, seatDbId]
      );

      if ((bookingCheck as any[])[0]?.count > 0) {
        await connection.rollback();
        return {
          success: false,
          error: 'Seat is already booked',
          errorCode: 'SEAT_BOOKED'
        };
      }

      // 3. Cleanup expired locks
      await connection.execute(
        `DELETE FROM seat_locks WHERE expires_at <= NOW()`
      );

      // 4. Check existing locks
      const [lockCheck] = await connection.execute(
        `SELECT session_id, expires_at FROM seat_locks
         WHERE id_showtime = ? AND id_seats = ?
         AND expires_at > NOW()
         FOR UPDATE`,
        [showtimeId, seatDbId]
      );

      const existingLock = (lockCheck as any[])[0];

      if (existingLock && existingLock.session_id !== sessionId) {
        await connection.rollback();
        return {
          success: false,
          error: 'Seat is being selected by another user',
          errorCode: 'SEAT_LOCKED'
        };
      }

      // 5. Create or extend lock
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      let isNewLock = true;

      if (existingLock && existingLock.session_id === sessionId) {
        // Extend existing lock
        await connection.execute(
          `UPDATE seat_locks
           SET expires_at = ?, created_at = CURRENT_TIMESTAMP
           WHERE id_showtime = ? AND id_seats = ? AND session_id = ?`,
          [expiresAt, showtimeId, seatDbId, sessionId]
        );
        isNewLock = false;
      } else {
        // Create new lock
        await connection.execute(
          `INSERT INTO seat_locks (id_showtime, id_seats, session_id, expires_at)
           VALUES (?, ?, ?, ?)`,
          [showtimeId, seatDbId, sessionId, expiresAt]
        );
      }

      await connection.commit();

      return {
        success: true,
        data: {
          seatId,
          seatDbId,
          sessionId,
          expiresAt,
          isNewLock
        }
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error locking seat:', error);
      return {
        success: false,
        error: 'Database error occurred',
        errorCode: 'DB_ERROR'
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Unlock a specific seat
   */
  static async unlockSeat(showtimeId: string, seatId: string, sessionId: string): Promise<SeatLockResult> {
    const connection = await db.getConnection();

    try {
      const seatDbId = await this.getSeatDatabaseId(connection, showtimeId, seatId);
      if (!seatDbId) {
        return {
          success: false,
          error: 'Invalid seat ID or seat not found',
          errorCode: 'SEAT_NOT_FOUND'
        };
      }

      await connection.execute(
        `DELETE FROM seat_locks
         WHERE id_showtime = ? AND id_seats = ? AND session_id = ?`,
        [showtimeId, seatDbId, sessionId]
      );

      return {
        success: true,
        data: {
          seatId,
          seatDbId,
          sessionId,
          expiresAt: new Date(),
          isNewLock: false
        }
      };

    } catch (error) {
      console.error('Error unlocking seat:', error);
      return {
        success: false,
        error: 'Database error occurred',
        errorCode: 'DB_ERROR'
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Unlock all seats for a session
   */
  static async unlockAllSeats(sessionId: string): Promise<{ success: boolean; unlockedCount: number }> {
    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        `DELETE FROM seat_locks WHERE session_id = ?`,
        [sessionId]
      );

      return {
        success: true,
        unlockedCount: (result as any).affectedRows
      };

    } catch (error) {
      console.error('Error unlocking all seats:', error);
      return {
        success: false,
        unlockedCount: 0
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get seat status for a showtime
   */
  static async getSeatStatus(showtimeId: string): Promise<SeatStatusResult> {
    let connection;

    try {
      connection = await db.getConnection();

      // Cleanup expired locks first
      await connection.execute(
        `DELETE FROM seat_locks WHERE expires_at <= NOW()`
      );

      // Get booked seats
      const [bookedSeats] = await connection.execute(
        `SELECT DISTINCT CONCAT(s.seat_row, LPAD(s.seat_number, 2, '0')) as seatId
         FROM detail_booking db
         JOIN bookings b ON db.id_booking = b.id_booking
         JOIN seat s ON db.id_seats = s.id_seats
         WHERE b.id_showtime = ? AND b.booking_status != 'cancelled'`,
        [showtimeId]
      );

      // Get locked seats
      const [lockedSeats] = await connection.execute(
        `SELECT DISTINCT CONCAT(s.seat_row, LPAD(s.seat_number, 2, '0')) as seatId
         FROM seat_locks sl
         JOIN seat s ON sl.id_seats = s.id_seats
         WHERE sl.id_showtime = ? AND sl.expires_at > NOW()`,
        [showtimeId]
      );

      const bookedSeatIds = (bookedSeats as any[]).map(seat => seat.seatId);
      const lockedSeatIds = (lockedSeats as any[]).map(seat => seat.seatId);

      return {
        success: true,
        data: {
          bookedSeats: bookedSeatIds,
          lockedSeats: lockedSeatIds,
          unavailableSeats: [...new Set([...bookedSeatIds, ...lockedSeatIds])]
        }
      };

    } catch (error) {
      console.error('Error getting seat status:', error);

      // Return detailed error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

      return {
        success: false,
        error: `Database error: ${errorMessage}`
      };
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Cleanup expired locks (can be called periodically)
   */
  static async cleanupExpiredLocks(): Promise<{ success: boolean; cleanedCount: number }> {
    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        `DELETE FROM seat_locks WHERE expires_at <= NOW()`
      );

      return {
        success: true,
        cleanedCount: (result as any).affectedRows
      };

    } catch (error) {
      console.error('Error cleaning up expired locks:', error);
      return {
        success: false,
        cleanedCount: 0
      };
    } finally {
      connection.release();
    }
  }
}
