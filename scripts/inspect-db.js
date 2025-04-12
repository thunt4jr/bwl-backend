// scripts/inspect-db.js
"use strict";

const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Path to the SQLite database
const dbFile = ".tmp/data.db";
const dbPath = path.resolve(process.cwd(), dbFile);

if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

console.log(`Using SQLite database at: ${dbPath}`);

// Connect to the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }
  console.log("Connected to the database");
});

// Function to inspect a table's schema
function inspectTable(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      console.log(`\n--- Table: ${tableName} ---`);
      if (rows.length === 0) {
        console.log(`Table ${tableName} does not exist`);
      } else {
        rows.forEach((row) => {
          console.log(
            `Column: ${row.name}, Type: ${row.type}, NotNull: ${row.notnull}, DefaultValue: ${row.dflt_value}, PK: ${row.pk}`
          );
        });
      }
      resolve();
    });
  });
}

// List all tables in the database
function listTables() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      (err, tables) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("\n--- All Tables ---");
        tables.forEach((table) => {
          console.log(table.name);
        });
        resolve(tables.map((t) => t.name));
      }
    );
  });
}

// Find role and permission-related tables
async function inspectRolesAndPermissions() {
  try {
    const tables = await listTables();

    // Look for tables related to roles and permissions
    const roleTables = tables.filter((t) => t.toLowerCase().includes("role"));
    const permissionTables = tables.filter((t) =>
      t.toLowerCase().includes("permission")
    );

    console.log("\n--- Role-related Tables ---");
    console.log(roleTables);

    console.log("\n--- Permission-related Tables ---");
    console.log(permissionTables);

    // Inspect role and permission tables
    for (const table of [...roleTables, ...permissionTables]) {
      await inspectTable(table);
    }

    // Close the database connection
    db.close();
  } catch (error) {
    console.error("Error inspecting database:", error);
    db.close();
  }
}

// Run the inspection
inspectRolesAndPermissions();
