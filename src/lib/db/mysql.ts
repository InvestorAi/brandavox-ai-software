// Brandavox MySQL Database Adapter
// Location: src/lib/db/mysql.ts

import mysql from 'mysql2/promise';

const getMysqlConfig = () => {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || 'brandavox_db';
  const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306;

  if (host && user && password) {
    return { host, user, password, database, port };
  }
  return null;
};

export const isMysqlConfigured = (): boolean => {
  return getMysqlConfig() !== null;
};

let pool: mysql.Pool | null = null;

export const getMysqlConnection = (): mysql.Pool => {
  if (pool) return pool;

  const config = getMysqlConfig();
  if (!config) {
    throw new Error('MySQL connection parameters are missing in env variables.');
  }

  // Create connection pool
  pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
};

// Initialize Tables on startup if they do not exist
export async function initMysqlTables() {
  if (!isMysqlConfigured()) return;

  try {
    const connection = getMysqlConnection();
    console.log('[MySQL Backend] Checking and initializing database tables...');

    // 1. Create Organizations Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`organizations\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`plan\` VARCHAR(50) NOT NULL DEFAULT 'starter',
        \`owner_id\` VARCHAR(100) NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'member',
        \`organization_id\` VARCHAR(100) NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`fk_users_organization\` FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('[MySQL Backend] Tables initialized successfully.');
  } catch (err: any) {
    console.error('[MySQL Backend] Table initialization failed:', err.message);
  }
}

// Save user and organization on registration
export async function saveUserToMysql(userProfile: {
  userId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  orgId: string;
  orgName: string;
  orgSlug: string;
  plan: string;
}): Promise<boolean> {
  if (!isMysqlConfigured()) return false;

  try {
    const connection = getMysqlConnection();
    
    // Insert organization
    await connection.execute(
      `INSERT INTO \`organizations\` (id, name, slug, plan, owner_id) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE name=VALUES(name), plan=VALUES(plan)`,
      [userProfile.orgId, userProfile.orgName, userProfile.orgSlug, userProfile.plan, userProfile.userId]
    );

    // Insert user
    await connection.execute(
      `INSERT INTO \`users\` (id, email, password, full_name, role, organization_id) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role)`,
      [
        userProfile.userId,
        userProfile.email,
        userProfile.passwordHash, // Hashed password
        userProfile.fullName,
        userProfile.role,
        userProfile.orgId
      ]
    );

    console.log(`[MySQL Backend] Registered user ${userProfile.email} and organization ${userProfile.orgName} successfully.`);
    return true;
  } catch (err: any) {
    console.error('[MySQL Backend] Failed to write user registration:', err.message);
    throw err;
  }
}

// Verify credentials on login
export async function verifyUserInMysql(email: string): Promise<any | null> {
  if (!isMysqlConfigured()) return null;

  try {
    const connection = getMysqlConnection();
    const [rows]: any = await connection.execute(
      `SELECT u.id, u.email, u.password, u.full_name, u.role, u.organization_id 
       FROM \`users\` u 
       WHERE u.email = ?`,
      [email]
    );

    if (rows && rows.length > 0) {
      return rows[0]; // Returns user profile including password hash
    }
    return null;
  } catch (err: any) {
    console.error('[MySQL Backend] Failed to query user credentials:', err.message);
    return null;
  }
}
