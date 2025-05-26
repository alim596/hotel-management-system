import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Update enum to match database values
enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
}

enum RoomTypeNames {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
}

// Test bcrypt import
console.log('bcrypt object:', bcrypt);

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'hotel_management',
  user: 'postgres',
  password: 'postgres',
});

// Simple passwords for seed users
const ADMIN_PASSWORD = 'admin123';
const MANAGER_PASSWORD = 'manager123';
const GUEST_PASSWORD = 'guest123';

async function seedUsers() {
  try {
    // Hash each one
    const [adminHash, managerHash, guestHash] = await Promise.all([
      bcrypt.hash(ADMIN_PASSWORD, 10),
      bcrypt.hash(MANAGER_PASSWORD, 10),
      bcrypt.hash(GUEST_PASSWORD, 10),
    ]);

    console.log('→ Admin plain password:   ', ADMIN_PASSWORD);
    console.log('→ Manager plain password: ', MANAGER_PASSWORD);
    console.log('→ Guest plain password:   ', GUEST_PASSWORD);

    // … inside seedUsers()

    const insertUser = async (
      email: string,
      hash: string,
      first: string,
      last: string,
      role: string,
    ) => {
      await pool.query(
        `
    INSERT INTO users (email, password, first_name, last_Name, role)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO NOTHING
    `,
        [email, hash, first, last, role],
      );
    };

    await insertUser('admin@hotel.com', adminHash, 'Admin', 'User', 'admin');
    await insertUser(
      'manager@hotel.com',
      managerHash,
      'Hotel',
      'Manager',
      'hotel_manager',
    );
    await insertUser('user@hotel.com', guestHash, 'Regular', 'User', 'guest');

    console.log('✅ Users seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    throw err;
  }
}

async function seedHotels() {
  try {
    const hotels = [
      {
        name: 'Grand Hotel',
        description: 'Luxury hotel in the city center',
        city: 'New York',
        country: 'USA',
        address: '123 Main St',
        images: ['https://example.com/grand-hotel.jpg'],
        star_rating: 4.5,
      },
      {
        name: 'Beach Resort',
        description: 'Beautiful beachfront resort',
        city: 'Miami',
        country: 'USA',
        address: '456 Ocean Drive',
        images: ['https://example.com/beach-resort.jpg'],
        star_rating: 4.2,
      },
    ];

    for (const hotel of hotels) {
      // 1) Check if a hotel with this name already exists
      const { rowCount } = await pool.query(
        `SELECT 1 FROM hotels WHERE name = $1`,
        [hotel.name],
      );

      // 2) Only insert if not found
      if (rowCount === 0) {
        await pool.query(
          `
          INSERT INTO hotels (
            name,
            description,
            city,
            country,
            address,
            images,
            star_rating,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
          )
          `,
          [
            hotel.name,
            hotel.description,
            hotel.city,
            hotel.country,
            hotel.address,
            hotel.images,
            hotel.star_rating,
          ],
        );
      }
    }

    console.log('✅ Hotels seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    throw error;
  }
}

async function seedRoomTypes() {
  try {
    // Fetch all hotels
    const { rows: hotels } = await pool.query<{ id: number }>(
      'SELECT id FROM hotels',
    );

    // Define default room types (must match enum values)
    const defaultTypes = [
      {
        name: 'STANDARD',
        description: 'Basic room with essential amenities',
        capacity: 2,
        base_price: 100.0,
        bed_type: 'Queen',
        size_sq_ft: 250,
        amenities: ['WiFi', 'TV', 'Desk'],
        images: [],
        max_occupancy: 2,
        is_active: true,
      },
      {
        name: 'DELUXE',
        description: 'Spacious room with premium features',
        capacity: 3,
        base_price: 200.0,
        bed_type: 'King',
        size_sq_ft: 400,
        amenities: ['WiFi', 'TV', 'Mini-bar', 'Coffee Maker'],
        images: [],
        max_occupancy: 3,
        is_active: true,
      },
      {
        name: 'SUITE',
        description: 'Luxurious suite with separate living area',
        capacity: 4,
        base_price: 300.0,
        bed_type: 'King',
        size_sq_ft: 600,
        amenities: ['WiFi', 'TV', 'Mini-bar', 'Coffee Maker', 'Sofa'],
        images: [],
        max_occupancy: 4,
        is_active: true,
      },
    ];

    for (const hotel of hotels) {
      for (const type of defaultTypes) {
        // Check if this room type already exists for the hotel
        const { rowCount } = await pool.query(
          `SELECT 1 FROM room_types WHERE hotel_id = $1 AND name = $2`,
          [hotel.id, type.name],
        );
        if (rowCount > 0) continue;

        // Insert the room type
        await pool.query(
          `
          INSERT INTO room_types (
            hotel_id,
            name,
            description,
            capacity,
            base_price,
            bed_type,
            size_sq_ft,
            amenities,
            images,
            max_occupancy,
            is_active,
            created_at,
            updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
          `,
          [
            hotel.id,
            type.name,
            type.description,
            type.capacity,
            type.base_price,
            type.bed_type,
            type.size_sq_ft,
            type.amenities,
            type.images,
            type.max_occupancy,
            type.is_active,
          ],
        );
      }
    }

    console.log('✅ Room types seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding room types:', error);
    throw error;
  }
}

async function seedRooms() {
  try {
    // Fetch all hotels
    const { rows: hotels } = await pool.query<{ id: number }>(
      'SELECT id FROM hotels',
    );
    // Fetch room types
    const { rows: types } = await pool.query<{
      id: number;
      name: string;
    }>('SELECT id, name FROM room_types');

    for (const hotel of hotels) {
      // Define rooms to seed per hotel
      const roomsToSeed = [
        {
          room_number: '101',
          floor: '1',
          typeName: RoomTypeNames.STANDARD,
          special_notes: 'Comfortable room with basic amenities',
          is_available: true,
        },
        {
          room_number: '102',
          floor: '1',
          typeName: RoomTypeNames.DELUXE,
          special_notes: 'Spacious room with premium amenities',
          is_available: true,
        },
        {
          room_number: '103',
          floor: '1',
          typeName: RoomTypeNames.SUITE,
          special_notes: 'Luxury suite with separate living area',
          is_available: true,
        },
      ];

      for (const r of roomsToSeed) {
        const rt = types.find((t) => t.name === r.typeName);
        if (!rt) {
          console.warn(
            `Room type ${r.typeName} not found; skipping room ${r.room_number}`,
          );
          continue;
        }
        // Check if this room already exists for the hotel
        const { rowCount } = await pool.query(
          'SELECT 1 FROM rooms WHERE hotel_id = $1 AND room_number = $2',
          [hotel.id, r.room_number],
        );
        if ((rowCount ?? 0) > 0) continue;

        // Insert the room
        await pool.query(
          `
          INSERT INTO rooms (
            hotel_id,
            room_type_id,
            room_number,
            floor,
            status,
            is_available,
            special_notes,
            created_at,
            updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
          `,
          [
            hotel.id,
            rt.id,
            r.room_number,
            r.floor,
            'available',
            r.is_available,
            r.special_notes,
          ],
        );
      }
    }

    console.log('✅ Rooms seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await seedUsers();
    await seedHotels();
    await seedRoomTypes();
    await seedRooms();

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
