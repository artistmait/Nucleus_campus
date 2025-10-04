import { Pool } from "pg";

const pool = new Pool({
    user :process.env.DB_USER || 'postgres',
    host : process.env.DB_HOST || 'localhost',
    password : process.env.DB_PASSWORD || 'Mmp234456@',
    database:process.env.DB_NAME || 'nucleus',
    port:process.env.DB_PORT || '5432'
});

pool.on('connect',()=>{
    console.log('Connected to the server')
})


export default pool;