import postgres from 'postgres'

// Lazy singleton Postgres client against the Supabase pooler. Connects directly
// to the custom `ingetin` schema (tables are schema-qualified in every query),
// so no PostgREST "exposed schema" config is needed.
let _sql: postgres.Sql | null = null

export function getSql(): postgres.Sql {
  if (_sql) return _sql
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('Missing DATABASE_URL')

  // Drop Prisma-only "?schema=" param; we qualify table names explicitly.
  const url = raw.split('?')[0]

  _sql = postgres(url, {
    ssl: 'require',
    prepare: false, // safe for Supabase transaction pooler (pgbouncer)
    max: 1, // serverless: one connection per invocation
    idle_timeout: 20,
    types: {
      // Return date/timestamp columns as ISO-ish strings instead of JS Date,
      // so no timezone conversion happens (the frontend parses by string).
      datetime: {
        to: 1184,
        from: [1082, 1114, 1184],
        serialize: (x: unknown) => x as string,
        parse: (x: unknown) => (typeof x === 'string' ? x.replace(' ', 'T') : x),
      },
    },
  })
  return _sql
}

/* ───────────── Users ───────────── */

export async function findUserByEmail(email: string): Promise<any | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM ingetin."User" WHERE email = ${email} LIMIT 1`
  return rows[0] || null
}

export async function createUser(u: {
  name: string
  email: string
  password?: string | null
  avatar?: string | null
}): Promise<any> {
  const sql = getSql()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO ingetin."User" (id, name, email, password, avatar, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${u.name}, ${u.email}, ${u.password ?? null}, ${u.avatar ?? null}, ${now}, ${now})
    RETURNING *`
  return rows[0]
}

/* ───────────── Notes (with embedded category) ───────────── */

// Returns categoryId only if it's a real category owned by the user, else null.
// Compares id as text so a non-UUID value (e.g. a preset id) can't throw.
async function safeCategoryId(userId: string, categoryId?: string | null): Promise<string | null> {
  if (!categoryId) return null
  const sql = getSql()
  const rows = await sql`
    SELECT id FROM ingetin."Category"
    WHERE id::text = ${categoryId} AND "userId" = ${userId} LIMIT 1`
  return rows.length ? categoryId : null
}

const noteCols = (sql: postgres.Sql) => sql`
  n.id, n."userId", n."categoryId", n.title, n.note,
  n."scheduledAt", n."isDone", n."type", n."items", n."createdAt", n."updatedAt",
  CASE WHEN c.id IS NOT NULL THEN to_jsonb(c.*) ELSE NULL END AS category`

export async function getNote(id: string): Promise<any | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT ${noteCols(sql)}
    FROM ingetin."Note" n
    LEFT JOIN ingetin."Category" c ON c.id = n."categoryId"
    WHERE n.id = ${id} LIMIT 1`
  return rows[0] || null
}

export async function listNotes(
  userId: string,
  f: { category?: string | null; date?: string | null; done?: string | null },
): Promise<any[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT ${noteCols(sql)}
    FROM ingetin."Note" n
    LEFT JOIN ingetin."Category" c ON c.id = n."categoryId"
    WHERE n."userId" = ${userId}
    ${f.category ? sql`AND n."categoryId" = ${f.category}` : sql``}
    ${f.done !== undefined && f.done !== null ? sql`AND n."isDone" = ${f.done === 'true'}` : sql``}
    ${
      f.date
        ? sql`AND n."scheduledAt" >= ${`${f.date}T00:00:00.000`} AND n."scheduledAt" <= ${`${f.date}T23:59:59.999`}`
        : sql``
    }
    ORDER BY n."scheduledAt" ASC NULLS LAST`
  return rows
}

export async function createNote(
  userId: string,
  d: {
    title: string
    note?: string
    scheduledAt?: string
    categoryId?: string
    isDone?: boolean
    type?: string
    items?: any[]
  },
): Promise<any> {
  const sql = getSql()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const categoryId = await safeCategoryId(userId, d.categoryId)
  const type = d.type === 'todo' ? 'todo' : 'text'
  const items = type === 'todo' && Array.isArray(d.items) ? d.items : null
  await sql`
    INSERT INTO ingetin."Note" (id, "userId", title, note, "scheduledAt", "categoryId", "isDone", "type", "items", "createdAt", "updatedAt")
    VALUES (${id}, ${userId}, ${d.title}, ${d.note ?? null}, ${d.scheduledAt || null}, ${categoryId}, ${d.isDone ?? false}, ${type}, ${items ? sql.json(items) : null}, ${now}, ${now})`
  return getNote(id)
}

export async function updateNote(id: string, current: any, body: any): Promise<any> {
  const sql = getSql()
  const merged = {
    title: 'title' in body ? body.title : current.title,
    note: 'note' in body ? body.note ?? null : current.note,
    scheduledAt: 'scheduledAt' in body ? body.scheduledAt || null : current.scheduledAt,
    categoryId:
      'categoryId' in body
        ? await safeCategoryId(current.userId, body.categoryId)
        : current.categoryId,
    isDone: 'isDone' in body ? body.isDone : current.isDone,
    type: 'type' in body ? (body.type === 'todo' ? 'todo' : 'text') : current.type,
    items: 'items' in body ? body.items : current.items,
  }
  const items = Array.isArray(merged.items) ? merged.items : null
  await sql`
    UPDATE ingetin."Note" SET
      title = ${merged.title},
      note = ${merged.note},
      "scheduledAt" = ${merged.scheduledAt},
      "categoryId" = ${merged.categoryId},
      "isDone" = ${merged.isDone},
      "type" = ${merged.type},
      "items" = ${items ? sql.json(items) : null},
      "updatedAt" = ${new Date().toISOString()}
    WHERE id = ${id}`
  return getNote(id)
}

export async function toggleNote(id: string, current: any): Promise<any> {
  const sql = getSql()
  await sql`
    UPDATE ingetin."Note" SET "isDone" = ${!current.isDone}, "updatedAt" = ${new Date().toISOString()}
    WHERE id = ${id}`
  return getNote(id)
}

export async function deleteNote(id: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM ingetin."Note" WHERE id = ${id}`
}

/* ───────────── Categories ───────────── */

export async function listCategories(userId: string): Promise<any[]> {
  const sql = getSql()
  return sql`SELECT * FROM ingetin."Category" WHERE "userId" = ${userId} ORDER BY "createdAt" ASC`
}

export async function getCategory(id: string): Promise<any | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM ingetin."Category" WHERE id = ${id} LIMIT 1`
  return rows[0] || null
}

export async function createCategory(
  userId: string,
  d: { name: string; color?: string },
): Promise<any> {
  const sql = getSql()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO ingetin."Category" (id, "userId", name, color, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${userId}, ${d.name}, ${d.color || '#9CA3AF'}, ${now}, ${now})
    RETURNING *`
  return rows[0]
}

export async function updateCategory(id: string, current: any, body: any): Promise<any> {
  const sql = getSql()
  const name = 'name' in body ? body.name : current.name
  const color = 'color' in body ? body.color : current.color
  const rows = await sql`
    UPDATE ingetin."Category" SET name = ${name}, color = ${color}, "updatedAt" = ${new Date().toISOString()}
    WHERE id = ${id} RETURNING *`
  return rows[0]
}

export async function deleteCategory(id: string): Promise<void> {
  const sql = getSql()
  await sql`DELETE FROM ingetin."Category" WHERE id = ${id}`
}
