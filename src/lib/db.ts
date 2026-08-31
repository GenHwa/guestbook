import "server-only";

import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

function optional(newName: string, oldName: string): string | undefined {
  return process.env[newName] ?? process.env[oldName];
}

function required(newName: string, oldName: string): string {
  const value = optional(newName, oldName);
  if (!value) {
    throw new Error(`${newName} is not set`);
  }
  return value;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: required("MYSQL_HOST", "DB_HOST"),
    port: Number(optional("MYSQL_PORT", "DB_PORT") ?? 3306),
    user: required("MYSQL_USER", "DB_USER"),
    password: required("MYSQL_PASSWORD", "DB_PASSWORD"),
    database: required("MYSQL_DATABASE", "DB_NAME"),
    timezone: "Z",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
  });
}

export const db: mysql.Pool = globalForDb.mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = db;
}

type Params = mysql.ExecuteValues[];

export async function query<T = mysql.RowDataPacket>(
  sql: string,
  params: Params = [],
): Promise<T[]> {
  const [rows] = await db.execute(sql, params);
  return rows as T[];
}

export async function execute(
  sql: string,
  params: Params = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await db.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export async function pingDatabase() {
  const [rows] = await db.query("SELECT 1 AS ok");
  return rows;
}
