import 'dotenv/config';
import { Pool as PgPool, PoolClient } from 'pg';
import {
  Pool as MySQLPool,
  PoolConnection,
  createPool as createMySqlPool,
} from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { seedDatabase } from './seeders';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hotel_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Determine database type from environment
const dbType = process.env.DB_TYPE?.toLowerCase() || 'postgres';

// Create appropriate pool based on database type
const createPool = (): PgPool | MySQLPool => {
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
};

export const pool = createPool();

async function initializeDatabase() {
  let pgClient: PoolClient | null = null;
  let mysqlConnection: PoolConnection | null = null;

  try {
    console.log('Starting database initialization...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    if (dbType === 'mysql') {
      const mysqlPool = pool as MySQLPool;
      mysqlConnection = await mysqlPool.getConnection();

      // Split the schema into individual statements
      const statements = schema
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      // Execute each statement
      for (const statement of statements) {
        await mysqlConnection.query(statement);
      }
      console.log('Schema created successfully');

      // Seed the database
      await seedDatabase();
    } else {
      const pgPool = pool as PgPool;
      pgClient = await pgPool.connect();

      await pgClient.query('BEGIN');
      await pgClient.query(schema);
      await pgClient.query('COMMIT');
      console.log('Schema created successfully');

      // Seed the database
      await seedDatabase();
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    if (pgClient) {
      await pgClient.query('ROLLBACK').catch(console.error);
    }
    console.error('Error initializing database:', error);
    throw error;
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
