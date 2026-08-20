/**
 * Migration: Create Users Table
 *
 * WHY THIS SCHEMA DESIGN:
 *
 * - id: SERIAL (auto-increment int) vs UUID?
 *   We use SERIAL for simplicity and performance. UUIDs are better for distributed
 *   systems where multiple databases generate IDs simultaneously — not our case yet.
 *
 * - password_hash: Nullable because Google OAuth users have no password.
 *   We never store the raw password. Only a bcrypt hash. (Covered in Phase 4)
 *
 * - google_id: Nullable because email/password users don't have one.
 *   Will be populated during OAuth flow. (Phase 5)
 *
 * - role: 'user' | 'admin' — basic RBAC.
 *   The DEFAULT 'user' means every new account starts with minimal permissions.
 *
 * - updated_at: We'll create a trigger to auto-update this. This is the
 *   professional way — never rely on application code to set updated_at,
 *   because code bugs can forget to do it.
 */
exports.up = (pgm) => {
  // Create the users table
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    password_hash: {
      type: 'text',
      notNull: false, // NULL for OAuth users
    },
    avatar_url: {
      type: 'text',
      notNull: false,
    },
    google_id: {
      type: 'varchar(255)',
      notNull: false,
      unique: true,
    },
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'user',
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Index on email for fast login lookups
  pgm.createIndex('users', 'email');

  // Index on google_id for fast OAuth lookups
  pgm.createIndex('users', 'google_id');

  // Create the auto-update trigger function for updated_at
  // This runs at the DB level — no application code can forget to update it
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Attach the trigger to the users table
  pgm.sql(`
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS update_users_updated_at ON users');
  pgm.sql('DROP FUNCTION IF EXISTS update_updated_at_column');
  pgm.dropTable('users');
};
