export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No sidebar padding — onboarding is a standalone full-screen flow
  return <div className="flex min-h-dvh flex-col bg-canvas md:min-h-screen">{children}</div>
}
