import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL for mysql2
const parseConnectionString = (connectionString) => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: parseInt(url.port) || 3306,
    ssl: {
      rejectUnauthorized: false,
    },
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
  };
};

const pool = mysql.createPool(parseConnectionString(process.env.DATABASE_URL));

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(text, params);
    connection.release();
    const duration = Date.now() - start;
    
    // For SELECT queries, results is an array
    // For INSERT/UPDATE/DELETE, results is metadata object with insertId, affectedRows, etc.
    const isSelect = text.trim().toUpperCase().startsWith('SELECT');
    
    if (isSelect) {
      console.log('Executed query', { duration, rows: results.length || 0 });
      return { rows: results, rowCount: results.length };
    } else {
      console.log('Executed query', { duration, affectedRows: results.affectedRows || 0 });
      return { 
        rows: [{ id: results.insertId, affectedRows: results.affectedRows }], 
        rowCount: results.affectedRows,
        insertId: results.insertId,
        affectedRows: results.affectedRows
      };
    }
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
};

export default pool;