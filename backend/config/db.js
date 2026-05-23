const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'usermgmt',
  user: 'appuser',
  password: 'apppassword',
});

module.exports = pool;
