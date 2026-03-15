const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function resetPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const email = 'hr@gss.com';
  const newPassword = 'hr123';
  
  console.log(`Resetting password for ${email} to ${newPassword}...`);

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ password_hash: hashedPassword })
    .eq('email', email);

  if (error) {
    console.error('Error updating password:', error.message);
  } else {
    console.log('Password updated successfully!');
  }
}

resetPassword();
