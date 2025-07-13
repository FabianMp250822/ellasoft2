import { SuperadminLayoutClient } from "./layout-client";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SuperadminLayoutClient>
      {children}
    </SuperadminLayoutClient>
  )
}
