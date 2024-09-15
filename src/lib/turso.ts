import { createClient } from "@libsql/client";

import fs from 'fs/promises';

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});