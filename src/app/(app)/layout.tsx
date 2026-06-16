export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-20 md:pb-0 md:pl-64">{children}</main>
      {/* Bottom nav on mobile, sidebar on desktop — will be implemented */}
    </div>
  );
}
