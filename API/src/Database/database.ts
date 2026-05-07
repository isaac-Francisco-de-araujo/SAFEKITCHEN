import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Corrige __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos
const dbPath = path.resolve(__dirname, "../../database.db");
const schemaPath = path.resolve(__dirname, "./schema.sql");

// Criar conexão
const db = new Database(dbPath);

// Ler e executar schema
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

export default db;