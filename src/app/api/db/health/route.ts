import { query } from "@/lib/db";

type HealthRow = {
  version: string;
  db: string | null;
  now: Date;
};

export async function GET() {
  try {
    const [row] = await query<HealthRow>(
      "SELECT VERSION() AS version, DATABASE() AS db, NOW() AS now",
    );
    const tables = await query<{ name: string }>(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name",
    );

    return Response.json({
      ok: true,
      version: row.version,
      database: row.db,
      serverTime: row.now,
      tables: tables.map((t) => t.name),
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
