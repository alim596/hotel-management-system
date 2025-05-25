import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Update enum to match database values
enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
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

async function seedUsers() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hashed password created:', hashedPassword);

    // Create admin user
    await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      ['admin@hotel.com', hashedPassword, 'Admin', 'User', UserRole.ADMIN],
    );

    // Create hotel manager
    await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [
        'manager@hotel.com',
        hashedPassword,
        'Hotel',
        'Manager',
        UserRole.MANAGER,
      ],
    );

    // Create regular user
    await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      ['user@hotel.com', hashedPassword, 'Regular', 'User', UserRole.GUEST],
    );

    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
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
        image_url: 'https://example.com/grand-hotel.jpg',
        average_rating: 4.5,
      },
      {
        name: 'Beach Resort',
        description: 'Beautiful beachfront resort',
        city: 'Miami',
        country: 'USA',
        address: '456 Ocean Drive',
        image_url: 'https://example.com/beach-resort.jpg',
        average_rating: 4.2,
      },
    ];

    for (const hotel of hotels) {
      await pool.query(
        `
        INSERT INTO hotels (
          name,
          description,
          city,
          country,
          address,
          image_url,
          average_rating,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        ) ON CONFLICT (name) DO NOTHING
        `,
        [
          hotel.name,
          hotel.description,
          hotel.city,
          hotel.country,
          hotel.address,
          hotel.image_url,
          hotel.average_rating,
        ],
      );
    }

    console.log('Hotels seeded successfully');
  } catch (error) {
    console.error('Error seeding hotels:', error);
    throw error;
  }
}

enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
}

async function seedRooms() {
  try {
    // Get hotel IDs
    const { rows: hotels } = await pool.query<{ id: number }>(
      'SELECT id FROM hotels',
    );

    for (const hotel of hotels) {
      const rooms = [
        {
          name: 'Standard Room',
          description: 'Comfortable room with basic amenities',
          capacity: 2,
          price_per_night: 100,
          room_type: RoomType.STANDARD,
          is_available: true,
        },
        {
          name: 'Deluxe Room',
          description: 'Spacious room with premium amenities',
          capacity: 3,
          price_per_night: 200,
          room_type: RoomType.DELUXE,
          is_available: true,
        },
        {
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          capacity: 4,
          price_per_night: 300,
          room_type: RoomType.SUITE,
          is_available: true,
        },
      ];

      for (const room of rooms) {
        await pool.query(
          `
          INSERT INTO rooms (
            hotel_id,
            name,
            description,
            capacity,
            price_per_night,
            room_type,
            is_available,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
          )
          `,
          [
            hotel.id,
            room.name,
            room.description,
            room.capacity,
            room.price_per_night,
            room.room_type,
            room.is_available,
          ],
        );
      }
    }

    console.log('Rooms seeded successfully');
  } catch (error) {
    console.error('Error seeding rooms:', error);
    throw error;
  }
}

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await seedUsers();
    await seedHotels();
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
