"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getOrganizationBySlug,
  type Organization,
} from "@/lib/api-client";

type TenantContextValue = {
  slug: string;
  organization: Organization | null;
  organizationId: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrg = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const org = await getOrganizationBySlug(slug);
      setOrganization(org);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load organization");
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const value: TenantContextValue = {
    slug,
    organization,
    organizationId: organization?.id ?? null,
    isLoading,
    error,
    refetch: fetchOrg,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}
