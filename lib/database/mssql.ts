import sql from "mssql"

const config: sql.config = {
  server: "HireRankerAI.mssql.somee.com",
  database: "HireRankerAI",
  user: "HackerMan_SQLLogin_1",
  password: "xx56hk2l58",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config)
    await pool.connect()

    pool.on("error", (err) => {
      console.error("Database pool error:", err)
      pool = null
    })
  }

  return pool
}

export async function query<T = any>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    const connection = await getConnection()
    const request = connection.request()

    // Add parameters if provided
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }

    const result = await request.query(queryText)
    return result.recordset
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function execute(queryText: string, params?: any[]): Promise<any> {
  try {
    const connection = await getConnection()
    const request = connection.request()

    // Add parameters if provided
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }

    const result = await request.query(queryText)
    return result
  } catch (error) {
    console.error("Database execute error:", error)
    throw error
  }
}

// Close connection pool
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close()
    pool = null
  }
}
