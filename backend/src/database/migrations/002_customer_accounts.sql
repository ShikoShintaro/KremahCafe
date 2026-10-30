-- KremahCafe customer accounts and commerce foundation.
-- Migration 002: preserve all existing admin and order records.

PRAGMA foreign_keys = ON;

-- Customer accounts
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_status
    ON customers(status);

CREATE INDEX idx_customers_created
    ON customers(created_at);

-- Independent customer sessions
CREATE TABLE customer_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL
        REFERENCES customers(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_sessions_user
    ON customer_sessions(customer_id);

CREATE INDEX idx_customer_sessions_expiry
    ON customer_sessions(expires_at);

-- Saved delivery addresses
CREATE TABLE customer_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL
        REFERENCES customers(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line TEXT NOT NULL,
    barangay TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    delivery_instructions TEXT NOT NULL DEFAULT '',
    is_default INTEGER NOT NULL DEFAULT 0
        CHECK (is_default IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_addresses_customer
    ON customer_addresses(customer_id);

CREATE UNIQUE INDEX idx_customer_default_address
    ON customer_addresses(customer_id)
    WHERE is_default = 1;

-- Link existing and future orders to customer accounts.
-- Existing guest orders remain valid because customer_id is nullable.
ALTER TABLE orders
    ADD COLUMN customer_id INTEGER
    REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE orders
    ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'online'));

ALTER TABLE orders
    ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
        payment_status IN (
            'pending',
            'paid',
            'failed',
            'refunded'
        )
    );

CREATE INDEX idx_orders_customer
    ON orders(customer_id);

CREATE INDEX idx_orders_payment
    ON orders(payment_method, payment_status);

-- Payment attempts and provider confirmations.
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_reference TEXT UNIQUE,
    amount_cents INTEGER NOT NULL
        CHECK (amount_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'PHP',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),
    metadata_json TEXT
        CHECK (
            metadata_json IS NULL
            OR json_valid(metadata_json)
        ),
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order
    ON payments(order_id);

CREATE INDEX idx_payments_status
    ON payments(status);

-- Full order status history.
CREATE TABLE order_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    actor_type TEXT NOT NULL DEFAULT 'system'
        CHECK (
            actor_type IN ('system', 'customer', 'admin')
        ),
    actor_id INTEGER,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_history_order
    ON order_status_history(order_id, created_at);

-- Preserve the current status of orders created before this migration.
INSERT INTO order_status_history (
    order_id,
    previous_status,
    new_status,
    actor_type,
    note,
    created_at
)
SELECT
    id,
    NULL,
    status,
    'system',
    'Existing order status recorded during migration',
    created_at
FROM orders;
