// Database schema, applied in order. Never edit a migration that has shipped:
// add a new one at the end instead.
//
// Money is stored as whole NPR (integers). Dates are AD "YYYY-MM-DD"; the
// dashboard shows them in BS. Times are 24-hour "HH:MM".

export const migrations: { id: number; name: string; sql: string[] }[] = [
  {
    id: 1,
    name: 'people, clients, bookings, events, crew',
    sql: [
      `CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT UNIQUE COLLATE NOCASE,
        access TEXT NOT NULL DEFAULT 'none' CHECK (access IN ('owner', 'staff', 'none')),
        roles TEXT NOT NULL DEFAULT '[]',
        pay_type TEXT NOT NULL DEFAULT 'per_event' CHECK (pay_type IN ('salary', 'per_event', 'both')),
        monthly_salary INTEGER,
        event_rate INTEGER,
        active INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        source TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL REFERENCES clients(id),
        title TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'wedding' CHECK (kind IN ('wedding', 'prewedding', 'commercial', 'other')),
        package TEXT,
        side TEXT CHECK (side IN ('bride', 'groom', 'both')),
        total_price INTEGER,
        discount INTEGER,
        status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('tentative', 'confirmed', 'completed', 'cancelled')),
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        call_time TEXT,
        end_time TEXT,
        venue TEXT,
        map_url TEXT,
        notes TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS events_date ON events(date)`,
      `CREATE INDEX IF NOT EXISTS events_booking ON events(booking_id)`,
      `CREATE TABLE IF NOT EXISTS event_crew (
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        person_id INTEGER NOT NULL REFERENCES people(id),
        role TEXT NOT NULL CHECK (role IN ('photographer', 'cinematographer', 'drone', 'editor')),
        fee INTEGER,
        PRIMARY KEY (event_id, person_id, role)
      )`,
      `CREATE INDEX IF NOT EXISTS event_crew_person ON event_crew(person_id)`,
    ],
  },
];
