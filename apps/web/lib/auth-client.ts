import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  basePath: "/auth",
  plugins: [organizationClient(), adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});
