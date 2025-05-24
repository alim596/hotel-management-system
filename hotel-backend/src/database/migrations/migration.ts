import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations(dataSource: DataSource) {
  try {
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sqlContent = fs.readFileSync(path.join(__dirname, file), 'utf8');

      // Split the SQL content by delimiter to handle triggers
      const statements = sqlContent.split('DELIMITER //');

      for (const statement of statements) {
        if (statement.includes('DELIMITER ;')) {
          // Handle trigger definitions
          const triggerParts = statement.split('DELIMITER ;');
          const triggers = triggerParts[0].split('END//');

          for (const trigger of triggers) {
            if (trigger.trim()) {
              await dataSource.query(trigger.trim() + 'END');
            }
          }

          // Handle remaining SQL after DELIMITER ;
          if (triggerParts[1]) {
            const remainingSQL = triggerParts[1].trim();
            if (remainingSQL) {
              await dataSource.query(remainingSQL);
            }
          }
        } else {
          // Handle regular SQL statements
          const queries = statement
            .split(';')
            .map((query) => query.trim())
            .filter((query) => query.length > 0);

          for (const query of queries) {
            await dataSource.query(query);
          }
        }
      }

      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
