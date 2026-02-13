import { TenantProvider } from "@/components/tenant-provider"

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  return <TenantProvider slug={slug}>{children}</TenantProvider>
}
