'use strict';

/**
 * Migration to clean up rich text components and prepare for blocks migration
 */

async function up(trx) {
  // Clean up any orphaned rich text components that might have invalid JSON
  // This works for both SQLite and PostgreSQL
  await trx.raw(`
    DELETE FROM components_shared_rich_texts 
    WHERE body IS NOT NULL 
    AND (
      body = '' 
      OR body IS NULL
      OR (body NOT LIKE '[%' AND body NOT LIKE '{%')
    )
  `);
  
  // For any remaining entries, try to convert them to empty blocks format
  // Use JSON format that works for both SQLite and PostgreSQL
  await trx.raw(`
    UPDATE components_shared_rich_texts 
    SET body = '[]'
    WHERE body IS NOT NULL 
    AND body != '[]'
  `);
}

async function down(trx) {
  // Rollback: convert back to empty strings
  await trx.raw(`
    UPDATE components_shared_rich_texts 
    SET body = '' 
    WHERE body = '[]'
  `);
}

module.exports = { up, down };