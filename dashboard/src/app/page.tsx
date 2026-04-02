import { redirect } from 'next/navigation';
import * as fs from 'fs';
import * as path from 'path';

function getConfigFromDisk(): { onboardingComplete?: boolean } | null {
  try {
    const configPath = path.resolve(process.cwd(), '..', 'config.json');
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data) as { onboardingComplete?: boolean };
  } catch {
    return null;
  }
}

export default function RootPage() {
  const config = getConfigFromDisk();

  if (config && config.onboardingComplete) {
    redirect('/office');
  }

  redirect('/onboarding');
}
