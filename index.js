
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

app.post('/upload', async (req, res) => {
  const { patients, orders, studies, convenios } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const p of patients) {
      await client.query('INSERT INTO patients (id, name, last_name, phone) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', 
        [p.id, p.name, p.lastName, p.phone]);
    }

    for (const s of studies) {
      await client.query('INSERT INTO studies (id, name, category, price) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [s.id, s.name, s.category, s.price]);
    }

    for (const c of convenios) {
      await client.query('INSERT INTO convenios (id, name, porcentaje) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [c.id, c.name, c.porcentaje]);
    }

    for (const o of orders) {
      await client.query(`INSERT INTO orders (id, patient_id, convenio_id, date, time)
                          VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
                          [o.id, o.patientId, o.convenioId, o.date, o.time]);

      for (const pkg of o.packages) {
        for (const est of pkg.studies) {
          await client.query(`INSERT INTO order_studies (order_id, study_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [o.id, est.id]);
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).send({ message: "Datos guardados correctamente." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send({ error: "Error al guardar los datos." });
  } finally {
    client.release();
  }
});

app.get('/', (req, res) => {
  res.send("Servidor activo");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
