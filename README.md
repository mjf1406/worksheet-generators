# NextJs Template

This starts with [create t3-app](https://create.t3.gg/) and adds boilerplate for the dependencies if necessary.

## First Steps

1. npm install
2. Fill out the keys in .env
3. Uncomment `.env` in `.gitignore`
4. Uncomment `next-env.d.ts` in `.gitignore`
5. npm run dev
6. Start up ngrok to use the route in `~/app/api/webhooks/route.ts`

### Second Steps

1. Update APP_NAME in `~/lib/constants.ts`
2. Update FAQ in `~/app/page.tsx`
3. Get some colors from [RealtimeColors](https://www.realtimecolors.com/?colors=def2e7-050e09-89ddb0-1f824d-2bd579&fonts=Poppins-Poppins) and paste them into `~/styles/global.css`
4. Set up [Turso](https://turso.tech/)
5. Set up [Clerk](https://clerk.com/)
6. Set up [Clerk Webhook](https://clerk.com/docs/integrations/webhooks/sync-data)
7. Set up your schema in `~/server/db/schema.ts`

## Dependencies

- Hosted on [Vercel](https://vercel.com/)
- CSS made easy thanks to [TailwindCSS](https://tailwindcss.com/)
- Hosted on [Vercel](https://vercel.com/)
- Database by [Turso](https://turso.tech/)
- Auth by [Clerk](https://clerk.com/)
- ORM by [Drizzle](https://orm.drizzle.team/)
- Colors from [RealtimeColors](https://www.realtimecolors.com/?colors=def2e7-050e09-89ddb0-1f824d-2bd579&fonts=Poppins-Poppins)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- []()
