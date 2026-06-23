import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function parseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || "3306", 10),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL is not set");
    const { host, port, user, password, database } = parseUrl(raw);
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: {},
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const p = getPool();
  const [rows] = await p.execute(sql, params || []);
  return rows as T;
}

export async function getOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params?: any[]): Promise<{ insertId?: number; affectedRows: number }> {
  const p = getPool();
  const [result] = await p.execute(sql, params || []);
  return result as any;
}
