# HireRankerAI

## Local Development Setup

To run this project locally, you need to set up your environment variables:

1. Copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your Supabase credentials in `.env.local`:
   - Get your Supabase URL and keys from your Supabase project dashboard
   - Add your email credentials for SMTP (Gmail app password recommended)

3. Make sure your Supabase database has the required tables (run the SQL scripts if needed)

## Troubleshooting

If you get "Internal server error" during email verification:

1. **Check Environment Variables**: Ensure all Supabase variables are set in `.env.local`
2. **Check Database Connection**: Verify your Supabase project is active and accessible
3. **Check Email Configuration**: Ensure EMAIL_USER and EMAIL_PASS are correct
4. **Check Console Logs**: Look for  debug messages in your terminal

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail app password
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for local)

testing branch 
