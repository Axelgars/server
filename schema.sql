
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    last_name TEXT,
    phone TEXT
);

CREATE TABLE IF NOT EXISTS studies (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price NUMERIC
);

CREATE TABLE IF NOT EXISTS convenios (
    id TEXT PRIMARY KEY,
    name TEXT,
    porcentaje NUMERIC
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES patients(id),
    convenio_id TEXT REFERENCES convenios(id),
    date DATE,
    time TEXT
);

CREATE TABLE IF NOT EXISTS order_studies (
    order_id TEXT REFERENCES orders(id),
    study_id TEXT REFERENCES studies(id),
    PRIMARY KEY (order_id, study_id)
);
