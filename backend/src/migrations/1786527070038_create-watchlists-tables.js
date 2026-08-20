/**
 * Migration: Create Watchlists and Watchlist Symbols Tables
 *
 * WHY TWO TABLES instead of one?
 *   Option A (Wrong): Store symbols as an array column in watchlists
 *   { id: 1, name: "Tech", symbols: ["AAPL", "GOOGL", "MSFT"] }
 *
 *   This violates First Normal Form (1NF) — no repeating groups in a column.
 *   You can't index individual symbols. You can't query "which watchlists
 *   contain AAPL?" efficiently.
 *
 *   Option B (Correct): Separate junction table
 *   Each symbol is its own row with a foreign key to the watchlist.
 *   Now you can query in both directions efficiently.
 *
 * This is called "normalization" — eliminating redundancy by separating
 * data into related tables. It's a core database design principle.
 */
exports.up = (pgm) => {
  // Watchlists table
  pgm.createTable('watchlists', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',       // Foreign key to users table
      onDelete: 'CASCADE',         // If user is deleted, delete their watchlists too
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    is_default: {
      type: 'boolean',
      notNull: true,
      default: false,
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

  // Index: fast lookup of all watchlists for a specific user
  pgm.createIndex('watchlists', 'user_id');

  // Prevent a user from having two watchlists with the same name
  pgm.addConstraint(
    'watchlists',
    'unique_watchlist_name_per_user',
    'UNIQUE(user_id, name)'
  );

  // Watchlist symbols table
  pgm.createTable('watchlist_symbols', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    watchlist_id: {
      type: 'integer',
      notNull: true,
      references: '"watchlists"',
      onDelete: 'CASCADE',        // If watchlist is deleted, delete its symbols too
    },
    symbol: {
      type: 'varchar(20)',
      notNull: true,
    },
    added_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Index: fast lookup of all symbols in a watchlist
  pgm.createIndex('watchlist_symbols', 'watchlist_id');

  // Prevent the same symbol appearing twice in the same watchlist
  pgm.addConstraint(
    'watchlist_symbols',
    'unique_symbol_per_watchlist',
    'UNIQUE(watchlist_id, symbol)'
  );

  // Add updated_at trigger to watchlists
  pgm.sql(`
    CREATE TRIGGER update_watchlists_updated_at
      BEFORE UPDATE ON watchlists
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('watchlist_symbols');
  pgm.dropTable('watchlists');
};
