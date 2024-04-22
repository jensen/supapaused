# Supapaused

Supapaused is a project that allows supabase users to track their paused Supabase instances.

## Technical

### Dependencies

- Next.js
- Supabase
- D3
- tailwind
- no UI library

### Extensions

- pg_cron
- pg_net

### Supabase Features

**Authentication**

> The application is not verified by Google, so it will not allow people to register. Allowing access to email is risky in general.

We can use Google as a provider to authenticate users with a basic scope of creating reading email, name and avatar. Once a user signs in, they can click the Sync button to elevate their privileges and scan their email.

**Realtime & Functions**

Scanning emails uses a queue. The request limit for each user retrieving a message is approximately 50/second. An edge function synchronizes the projects found in the user's email to an `events` table. As the queue updates the `events` table, we can update the graph in real time.

**Storage & Functions**

When a user authenticates with Google an edge function fetches and stores their avatar in a `profiles` bucket.

## Demo

https://github.com/jensen/supapaused/assets/14803/5eb8f979-257f-4feb-8de2-6451599fe478
