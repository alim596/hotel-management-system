import 'dotenv/config';
import { Pool as PgPool, PoolClient } from 'pg';
import {
  Pool as MySQLPool,
  PoolConnection,
  createPool as createMySqlPool,
} from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import { seedDatabase } from './seeders';

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Determine database type
const dbType = process.env.DB_TYPE?.toLowerCase() || 'postgres';

// Create appropriate pool
function createPool(): PgPool | MySQLPool {
  if (dbType === 'mysql') {
    return createMySqlPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else {
    return new PgPool(dbConfig);
  }
}

export const pool = createPool();

export async function initializeDatabase() {
  let pgClient: PoolClient | null = null;
  let mysqlConnection: PoolConnection | null = null;

  try {
    console.log('Starting database initialization...');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    if (dbType === 'mysql') {
      const mysqlPool = pool as MySQLPool;
      mysqlConnection = await mysqlPool.getConnection();

      // Drop and recreate database schema for idempotency
      await mysqlConnection.query(
        'DROP SCHEMA IF EXISTS public; CREATE SCHEMA public;',
      );
      console.log('Dropped and recreated MySQL public schema');

      // Execute all statements in schema.sql
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        await mysqlConnection.query(stmt);
      }
      console.log('MySQL schema created successfully');

      // Seed data
      await seedDatabase();
    } else {
      const pgPool = pool as PgPool;
      pgClient = await pgPool.connect();

      // Drop and recreate public schema for idempotency
      await pgClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
      console.log('Dropped and recreated Postgres public schema');

      // Run schema within transaction
      await pgClient.query('BEGIN');
      await pgClient.query(schemaSql);
      await pgClient.query('COMMIT');
      console.log('Postgres schema created successfully');

      // Seed data
      await seedDatabase();
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    if (pgClient) {
      await pgClient.query('ROLLBACK').catch(console.error);
    }
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (pgClient) {
      pgClient.release();
    }
    if (mysqlConnection) {
      mysqlConnection.release();
    }
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;
