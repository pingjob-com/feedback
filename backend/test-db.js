import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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
  };
};

try {
  const pool = mysql.createPool(parseConnectionString(process.env.DATABASE_URL));
  const connection = await pool.getConnection();
  const [results] = await connection.execute('SELECT NOW() as timestamp');
  console.log('? Database connected!');
  console.log('Result:', results);
  connection.release();
  process.exit(0);
} catch (error) {
  console.error('? Database error:', error.message);
  process.exit(1);
}
