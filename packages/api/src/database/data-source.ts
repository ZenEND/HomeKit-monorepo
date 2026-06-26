/**
 * TypeORM DataSource for CLI usage only.
 *
 * This file is NOT imported by the application at runtime.
 * It is used exclusively by the TypeORM CLI for generating and running migrations:
 *
 *   pnpm migration:generate -- src/database/migrations/MyMigration
 *   pnpm migration:run
 *   pnpm migration:revert
 *
 * For development, you do NOT need migrations — `synchronize: true` handles
 * schema changes automatically. Use migrations only before deploying to production.
 *
 * Setup:
 *   1. Build the project first: pnpm build:api
 *   2. Run: pnpm migration:generate -- src/database/migrations/DescriptiveName
 *   3. Review the generated file in src/database/migrations/
 *   4. Commit the migration file alongside your entity changes.
 *   5. In production (NODE_ENV=production, RUN_MIGRATIONS=true) the API will
 *      run pending migrations automatically on startup.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'homekit',
  password: process.env.DB_PASSWORD ?? 'homekit',
  database: process.env.DB_NAME ?? 'homekit',
  // Point at compiled JS output (CLI runs against dist/, not src/)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  entities: [require('path').resolve(__dirname, '../**/*.entity.js')],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  migrations: [require('path').resolve(__dirname, 'migrations/*.js')],
  synchronize: false,
  logging: ['error', 'warn', 'migration'],
});
