import { db } from "../Database/databaseConnection.js";

export async function buscarClientes(req, res) {
  try {
    const customer = await db.query(
      "SELECT customers.id, customers.name, customers.phone, customers.cpf, TO_CHAR(customers.birthday, 'YYYY-MM-DD') AS birthday FROM customers;"
    );

    res.send(customer.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function buscarClientePorId(req, res) {
  const { id } = req.params;
  try {
    const customer = await db.query(`SELECT customers.id, customers.name, customers.phone, customers.cpf, TO_CHAR(customers.birthday, 'YYYY-MM-DD') AS birthday FROM customers WHERE id = $1;`, [
      id,
    ]);

    if (customer.rowCount === 0) {
      return res.sendStatus(404);
    }

    res.send(customer.rows[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function criarCliente(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const existeCpf = await db.query(
      `SELECT * FROM customers WHERE cpf = $1;`,
      [cpf]
    );

    if (existeCpf.rowCount >= 1) {
      return res.sendStatus(409);
    }

    const customer = await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,
      [name, phone, cpf, birthday]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function atualizarCliente(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = req.body;

  try {
    const customerExistente = await db.query(
      `SELECT * FROM customers WHERE id = $1;`,
      [id]
    );

    if (customerExistente.rowCount === 0) {
      return res.sendStatus(404);
    }

    const cpfExistente = await db.query(
      `SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`,
      [cpf, id]
    );

    if (cpfExistente.rowCount >= 1) {
      return res.sendStatus(409);
    }

    const customer = await db.query(
      `UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,
      [name, phone, cpf, birthday, id]
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}
