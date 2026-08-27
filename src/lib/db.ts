import mysql from "mysql2/promise";

/**
 * 개발 중 HMR로 모듈이 다시 평가될 때마다 풀이 새로 생기면
 * 커넥션이 계속 쌓이므로 globalThis에 캐시한다.
 */
const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`환경변수 ${name} 가 설정되지 않았습니다 (.env.local 확인)`);
  return value;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
    charset: "utf8mb4_general_ci",
    timezone: "Z",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  });
}

export const pool: mysql.Pool = globalForDb.mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}

type Params = mysql.ExecuteValues[];

/** SELECT 등 행 목록을 돌려주는 쿼리 */
export async function query<T = mysql.RowDataPacket>(
  sql: string,
  params: Params = [],
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/** INSERT / UPDATE / DELETE */
export async function execute(
  sql: string,
  params: Params = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}
