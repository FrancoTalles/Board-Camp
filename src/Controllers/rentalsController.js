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
