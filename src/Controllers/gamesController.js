import { db } from "../Database/databaseConnection.js";

export async function buscarJogos(req, res) {
  try {
    const games = await db.query("SELECT * FROM games");

    res.send(games.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function criarJogo(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;

  try {
    if (stockTotal <= 0 || pricePerDay <= 0) {
      return res.sendStatus(400);
    }

    const existe = await db.query(`SELECT * FROM games WHERE name = $1`, [
      name,
    ]);

    if (existe.rowCount >= 1) {
      return res.sendStatus(409);
    }

    const game = await db.query(
      `INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);`,
      [name, image, stockTotal, pricePerDay]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
