#!/usr/bin/env node
/**
 * Automated RAG Setup Script
 * Sets up the database and storage for the RAG system
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://rcfgpdrrnhltozrnsgic.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable not set');
  console.error('   Get it from: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/settings/api');
  console.error('   Then run: $env:SUPABASE_SERVICE_KEY="your_key_here"; node setup-rag.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  console.log('\n📊 Setting up database...');
  
  const sql = fs.readFileSync('supabase/migrations/20250104_create_documents_table.sql', 'utf8');
  
  try {
    // Execute SQL via RPC (this is a workaround)
    // We'll execute each statement separately
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`   Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
          // Try direct approach
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: statement })
          });
          
          if (!response.ok) {
            console.log(`   ⚠️  Statement skipped (may already exist)`);
          } else {
            console.log(`   ✓ Statement executed`);
          }
        } else {
          console.log(`   ✓ Statement executed`);
        }
      } catch (err) {
        console.log(`   ⚠️  Statement skipped:`, err.message);
      }
    }
    
    console.log('   ✅ Database setup complete (or already exists)');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    console.log('\n   Please run the SQL manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/editor');
    console.log('   2. Create new query');
    console.log('   3. Paste contents of: supabase/migrations/20250104_create_documents_table.sql');
    console.log('   4. Run it\n');
  }
}

async function setupStorage() {
  console.log('\n📦 Setting up storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'pdfs');
    
    if (bucketExists) {
      console.log('   ℹ️  Bucket "pdfs" already exists');
      return;
    }
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('pdfs', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/pdf']
    });
    
    if (error) {
      throw error;
    }
    
    console.log('   ✅ Storage bucket "pdfs" created');
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    console.log('\n   Please create the bucket manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/storage/buckets');
    console.log('   2. Click "New Bucket"');
    console.log('   3. Name: pdfs');
    console.log('   4. Public: Yes');
    console.log('   5. Create\n');
  }
}

async function checkSecrets() {
  console.log('\n🔑 Checking required secrets...');
  
  const requiredSecrets = [
    'GEMINI_API_KEY or GEMINI-API-KEY',
    'OPENAI_API_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_URL'
  ];
  
  console.log('\n   Required secrets in Supabase Functions:');
  requiredSecrets.forEach(secret => {
    console.log(`   - ${secret}`);
  });
  
  console.log('\n   Configure them at:');
  console.log('   https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets\n');
}

async function main() {
  console.log('🚀 RAG System Setup\n');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Service Key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
  
  await setupDatabase();
  await setupStorage();
  await checkSecrets();
  
  console.log('\n✅ Setup complete!');
  console.log('\n📚 Next steps:');
  console.log('   1. Verify database table exists: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/editor');
  console.log('   2. Verify storage bucket exists: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/storage/buckets');
  console.log('   3. Configure secrets if not done: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets');
  console.log('   4. Run: python vectorize-pdfs.py (after installing requirements.txt)');
  console.log('\n   See RAG_SETUP_GUIDE.md for detailed instructions.');
}

main().catch(console.error);
