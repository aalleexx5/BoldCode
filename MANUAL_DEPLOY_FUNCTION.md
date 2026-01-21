# Manual Edge Function Deployment

## Prerequisites
Install Supabase CLI:
```bash
npm install -g supabase
```

## Steps

1. Login to Supabase:
```bash
supabase login
```

2. Link your project:
```bash
supabase link --project-ref doffewbwdawogxytbatb
```

3. Deploy the edge function:
```bash
supabase functions deploy send-assignment-email
```

## Verify Deployment

After deployment, you can test the function with:
```bash
curl -i --location --request POST 'https://doffewbwdawogxytbatb.supabase.co/functions/v1/send-assignment-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","requestNumber":"0001","requestTitle":"Test Request","assignedUserName":"Test User"}'
```

Replace `YOUR_ANON_KEY` with your anon key from .env file.
