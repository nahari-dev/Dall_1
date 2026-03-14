import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { memoryEngine } from '@/lib/memory'
import AppShell from '@/components/layout/AppShell'
import CalculatorClient from './CalculatorClient'

export const metadata = {
  title: 'حاسبة القبول — Dall Academy',
  description: 'احسب درجتك في البورد السعودي للتخصصات الصحية وفق معادلة SCFHS الرسمية',
}

export default async function CalculatorPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const mem = await memoryEngine.getMemory(session.user.id)
  if (!mem.onboardingDone) redirect('/onboarding')

  return (
    <AppShell userName={mem.displayName ?? session.user.name ?? undefined}>
      <CalculatorClient />
    </AppShell>
  )
}
