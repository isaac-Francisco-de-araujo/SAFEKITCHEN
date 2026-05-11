import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Caminhos
const dbPath = path.resolve(process.cwd(), "database.db");
const schemaPath = path.resolve(
  process.cwd(),
  "src/Database/schema.sql"
);

// Criar conexão
const db = new Database(dbPath);

// Ler schema
const schema = fs.readFileSync(schemaPath, "utf-8");

// Executar schema
db.exec(schema);

export default db;