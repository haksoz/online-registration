const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Existing registration types data
const registrationTypesData = [
  {
    value: 'dernek_uyesi',
    label: 'Dernek Üyesi',
    fee: 9500,
    description: 'Dernek üyesi olan katılımcılar için özel ücret'
  },
  {
    value: 'dernek_uyesi_degil', 
    label: 'Dernek Üyesi Olmayan',
    fee: 10500,
    description: 'Dernek üyesi olmayan katılımcılar için standart ücret'
  },
  {
    value: 'ogrenci',
    label: 'Öğrenci',
    fee: 3000,
    description: 'Lisans öğrencisi veya herhangi bir yerde çalışmadığını dilekçe ile beyan eden yüksek lisans / doktora öğrencisi'
  }
];

async function createRegistrationTypesTable() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root", 
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DB || "form_wizard",
    port: Number(process.env.MYSQL_PORT) || 3306,
  });

  try {
    console.log('🔄 Creating registration_types table...');
    
    // Create table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS registration_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        value VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(100) NOT NULL,
        fee DECIMAL(10,2) NOT NULL,
        description TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created successfully');

    // Check if data already exists
    const [existingRows] = await connection.execute('SELECT COUNT(*) as count FROM registration_types');
    const count = existingRows[0].count;
    
    if (count > 0) {
      console.log(`ℹ️  Table already contains ${count} records. Skipping data migration.`);
      return;
    }

    console.log('🔄 Migrating existing registration types data...');
    
    // Insert existing data
    for (const type of registrationTypesData) {
      await connection.execute(
        'INSERT INTO registration_types (value, label, fee, description) VALUES (?, ?, ?, ?)',
        [type.value, type.label, type.fee, type.description]
      );
      console.log(`✅ Migrated: ${type.label}`);
    }

    // Add indexes for performance
    console.log('🔄 Adding indexes...');
    await connection.execute('CREATE INDEX idx_registration_types_value ON registration_types(value)');
    await connection.execute('CREATE INDEX idx_registration_types_active ON registration_types(is_active)');
    console.log('✅ Indexes added successfully');

    // Verify data
    const [verifyRows] = await connection.execute('SELECT * FROM registration_types ORDER BY id');
    console.log('\n📊 Migration completed! Current data:');
    console.table(verifyRows);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration
createRegistrationTypesTable()
  .then(() => {
    console.log('\n🎉 Registration types migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });