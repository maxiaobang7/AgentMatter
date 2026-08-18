import "server-only";

import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | undefined;
type SqlValue = string | number | boolean | Date | Buffer | null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 未配置");
  pool ??= mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 8),
    enableKeepAlive: true,
    timezone: "Z",
    charset: "utf8mb4",
    decimalNumbers: true,
  });
  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(sql: string, values: SqlValue[] = []) {
  const [rows] = await getPool().execute<T>(sql, values);
  return rows;
}

export async function executeStatement(sql: string, values: SqlValue[] = []) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}

export async function inTransaction<T>(work: (connection: PoolConnection) => Promise<T>) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
