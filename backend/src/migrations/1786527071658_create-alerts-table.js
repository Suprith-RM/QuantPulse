/**
 * Migration: Create Alerts Table
 *
 * STATUS ENUM WHY:
 *   We constrain status to specific values using a CHECK constraint.
 *   This is better than a raw VARCHAR because:
 *   - The database enforces valid values (no typos like "Actve" slip in)
 *   - It self-documents the valid states
 *   - Query optimizers can use this information
 *
 * CONDITION ENUM:
 *   'above' = trigger when price rises above target_price
 *   'below' = trigger when price falls below target_price
 */
exports.up = (pgm) => {
  pgm.createTable('alerts', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    symbol: {
      type: 'varchar(20)',
      notNull: true,
    },
    target_price: {
      type: 'numeric(15, 4)',   // numeric(precision, scale) — exact decimal for financial data
      notNull: true,            // NEVER use float for money/prices — floating point imprecision
    },
    condition: {
      type: 'varchar(10)',
      notNull: true,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'active',
    },
    triggered_at: {
      type: 'timestamptz',
      notNull: false,           // NULL until the alert fires
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Enforce valid condition values at the database level
  pgm.addConstraint('alerts', 'alerts_condition_check',
    "CHECK (condition IN ('above', 'below'))"
  );

  // Enforce valid status values
  pgm.addConstraint('alerts', 'alerts_status_check',
    "CHECK (status IN ('active', 'triggered', 'paused', 'deleted'))"
  );

  // Index: fast lookup of alerts for a specific user
  pgm.createIndex('alerts', 'user_id');

  // Index: fast lookup of all active alerts for a specific stock symbol
  // This is critical for Phase 9 (alert processing) when we check
  // "which alerts should fire given AAPL just crossed $185?"
  pgm.createIndex('alerts', ['symbol', 'status']);
};

exports.down = (pgm) => {
  pgm.dropTable('alerts');
};
