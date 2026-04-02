'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Check, Users, Building2, Crown, Cpu, Shield, Plug, Users2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import PixelCharacter from '@/components/office/PixelCharacter';

export default function ReviewLaunch() {
  const router = useRouter();
  const {
    companyInfo,
    ceoConfig,
    executives,
    providerSetup,
    mcpSetup,
    firstTeam,
    governanceSetup,
    finishOnboarding,
  } = useOnboardingStore();

  const [launching, setLaunching] = useState(false);

  const enabledExecs = executives.filter((e) => e.enabled);

  const sections = [
    {
      icon: <Building2 className="w-4 h-4" />,
      title: 'Company',
      complete: !!companyInfo.name && !!companyInfo.industry,
      details: companyInfo.name
        ? `${companyInfo.name} (${companyInfo.industry})`
        : 'Not configured',
    },
    {
      icon: <Crown className="w-4 h-4" />,
      title: 'CEO',
      complete: !!ceoConfig.name,
      details: ceoConfig.name || 'Not configured',
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: 'Executives',
      complete: enabledExecs.length > 0,
      details:
        enabledExecs.length > 0
          ? `${enabledExecs.length} executive(s) hired`
          : 'None hired (optional)',
    },
    {
      icon: <Cpu className="w-4 h-4" />,
      title: 'Providers',
      complete: providerSetup.providers.length > 0,
      details:
        providerSetup.providers.length > 0
          ? `${providerSetup.providers.length} provider(s) configured`
          : 'None configured',
    },
    {
      icon: <Plug className="w-4 h-4" />,
      title: 'MCP Connections',
      complete: mcpSetup.connections.length > 0,
      details:
        mcpSetup.connections.length > 0
          ? `${mcpSetup.connections.length} connection(s)`
          : 'None configured (optional)',
    },
    {
      icon: <Users2 className="w-4 h-4" />,
      title: 'First Team',
      complete: !!firstTeam.name,
      details: firstTeam.name
        ? `${firstTeam.name} (${1 + firstTeam.agents.length} members)`
        : 'Not configured',
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: 'Governance',
      complete: governanceSetup.rules.length > 0,
      details:
        governanceSetup.rules.length > 0
          ? `${governanceSetup.rules.length} rule(s) enabled`
          : 'No rules (optional)',
    },
  ];

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await finishOnboarding();
      // Short delay for dramatic effect
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.push('/office');
    } catch {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Ready to Launch
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Review your configuration and launch BaroHQ.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Team Preview */}
        {ceoConfig.name && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <PixelCharacter appearance={ceoConfig.appearance} size={56} />
              <p className="text-xs text-slate-300 mt-1 font-bold">
                {ceoConfig.name}
              </p>
              <p className="text-[10px] text-amber-400">CEO</p>
            </div>
            {enabledExecs.map((exec) => (
              <div key={exec.id} className="flex flex-col items-center">
                <PixelCharacter appearance={exec.appearance} size={44} />
                <p className="text-xs text-slate-300 mt-1">
                  {exec.name || exec.role}
                </p>
                <p className="text-[10px] text-purple-400">
                  {exec.role.split(' ').pop()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg"
            >
              <div
                className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                  section.complete
                    ? 'bg-emerald-600/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {section.complete ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  section.icon
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">
                  {section.title}
                </p>
                <p className="text-xs text-slate-500">{section.details}</p>
              </div>
              {section.complete && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  Ready
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Launch Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLaunch}
            disabled={launching}
            className={`
              px-8 py-3 rounded-sm font-bold text-white text-lg transition-all
              ${
                launching
                  ? 'bg-blue-800 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95'
              }
            `}
          >
            {launching ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Launching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Launch BaroHQ
              </span>
            )}
          </button>
          <p className="text-xs text-slate-600 mt-3">
            You can change any of these settings later in the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
