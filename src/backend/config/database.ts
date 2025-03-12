import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from "fs";
import path from "path";

dotenv.config();

export const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

export const initializeDatabase = async () => {
    try {
        let query = fs.readFileSync(path.join(__dirname, "../db/sql/createTables.sql"), "utf8");;
        await pool.query(query);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};