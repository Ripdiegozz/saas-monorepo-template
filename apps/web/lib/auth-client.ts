import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Polar plugin adds checkout/customer methods; type inference references internal paths
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient: any = createAuthClient({
  baseURL: apiUrl,
  basePath: "/auth",
  plugins: [organizationClient(), adminClient(), polarClient()],
  fetchOptions: {
    credentials: "include",
  },
});
