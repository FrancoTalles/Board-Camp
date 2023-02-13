import { db } from "../Database/databaseConnection.js";
import dayjs from "dayjs";

export async function buscarAlugueis(req, res) {
  try {
    const rentals = await db.query(
      `SELECT rentals.*, customers.id AS "idCustomer", customers.name AS "nameCustomer", games.id AS "idGame", games.name AS "gameName" FROM rentals JOIN customers ON rentals."customerId" = customers.id JOIN games ON rentals."gameId" = games.id;`
    );

    const auxFormat = rentals.rows?.map((elemento) => {
      return {
        id: elemento.id,
        customerId: elemento.customerId,
        gameId: elemento.gameId,
        rentDate: elemento.rentDate,
        daysRented: elemento.daysRented,
        returnDate: elemento.returnDate,
        originalPrice: elemento.originalPrice,
        delayFee: elemento.delayFee,
        customer: {
          id: elemento.idCustomer,
          name: elemento.nameCustomer,
        },
        game: {
          id: elemento.idGame,
          name: elemento.gameName,
          categoryId: elemento.categoryIdGame,
          categoryName: elemento.categoryName,
        },
      };
    });

    res.send(auxFormat);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function inserirAluguel(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  try {
    const queryCustomerExistente = `SELECT * FROM customers WHERE id = $1;`;
    const customerExistente = await db.query(queryCustomerExistente, [
      customerId,
    ]);

    const queryGameExistente = `SELECT * FROM games WHERE id = $1;`;
    const gameExistente = await db.query(queryGameExistente, [gameId]);

    const queryGameRentals = `SELECT * FROM rentals WHERE "gameId" = $1;`;
    const gameRentals = await db.query(queryGameRentals, [gameId]);

    if (
      customerExistente.rowCount === 0 ||
      gameExistente.rowCount === 0 ||
      gameRentals.rowCount >= gameExistente.rows[0].stockTotal
    ) {
      return res.sendStatus(400);
    }

    const preco = daysRented * gameExistente.rows[0].pricePerDay;

    const data = dayjs().format("YYYY-MM-DD");

    const rentalObject = {
      customerId,
      gameId,
      rentDate: data,
      daysRented,
      returnDate: null,
      originalPrice: preco,
      delayFee: null,
    };

    const queryInsercao = `INSERT INTO rentals 
    ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") 
    VALUES ($1, $2, $3, $4, $5, $6, $7);`;

    const insercao = await db.query(queryInsercao, [
      rentalObject.customerId,
      rentalObject.gameId,
      rentalObject.rentDate,
      rentalObject.daysRented,
      rentalObject.returnDate,
      rentalObject.originalPrice,
      rentalObject.delayFee,
    ]);

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function apagarAluguel(req, res) {
  const { id } = req.params;

  const queryExistente = `SELECT * FROM rentals WHERE id = $1;`;
  const rentalExistente = await db.query(queryExistente, [id]);

  if (rentalExistente.rowCount === 0) {
    return res.sendStatus(404);
  }

  if (rentalExistente.rows[0].returnDate === null) {
    return res.sendStatus(400);
  }

  const queryApagar = `DELETE FROM rentals WHERE id = $1;`;
  const apagar = await db.query(queryApagar, [id]);

  res.sendStatus(200);
}

export async function finalizarAluguel(req, res) {
  const id = parseInt(req.params.id);
  const data = dayjs().format("YYYY-MM-DD");

  try {
    const queryAluguel = `SELECT rentals.*, games."pricePerDay" 
    FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals.id = $1`;
    const aluguel = await db.query(queryAluguel, [id]);

    if (aluguel.rows.length === 0) {
      return res.sendStatus(404);
    }

    if (aluguel.rows[0].returnDate !== null) {
      return res.sendStatus(400);
    }

    aluguel.rows[0].returnDate = data;
    aluguel.rows[0].rentDate = dayjs(aluguel.rows[0].rentDate);

    const aux = aluguel.rows[0].rentDate.add(aluguel.rows[0].daysRented, "day");

    if (aux.isBefore(aluguel.rows[0].returnDate)) {
      aluguel.rows[0].delayFee = -(
        aux.diff(aluguel.rows[0].returnDate, "days") *
        aluguel.rows[0].pricePerDay
      );
    } else {
      aluguel.rows[0].delayFee = 0;
    }

    const queryInsercao = `UPDATE rentals 
    SET "delayFee" = $1, "rentDate" = $2, "returnDate" = $3 
    WHERE id = $4`;

    const insercao = await db.query(queryInsercao, [
      aluguel.rows[0].delayFee,
      aluguel.rows[0].rentDate,
      aluguel.rows[0].returnDate,
      aluguel.rows[0].id,
    ]);

    res.status(200).send("");
  } catch (error) {
    res.status(500).send(error.message);
  }
}
