import { redirect } from 'next/navigation';

async function getConfig() {
  try {
    const res = await fetch('http://localhost:3001/api/config', {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Bridge not available
  }
  return null;
}

export default async function RootPage() {
  const config = await getConfig();

  if (config && config.onboardingComplete) {
    redirect('/office');
  }

  redirect('/onboarding');
}
