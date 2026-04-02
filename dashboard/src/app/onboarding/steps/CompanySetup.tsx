'use client';

import { Building2, Upload } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { INDUSTRIES } from '@/lib/constants';

export default function CompanySetup() {
  const { companyInfo, setCompanyInfo } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Set Up Your Company
        </h2>
        <p className="text-slate-400 mt-2 text-sm">
          Tell us about the company your AI agents will be working for.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Company Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={companyInfo.name}
            onChange={(e) => setCompanyInfo({ name: e.target.value })}
            placeholder="Acme Corp"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Industry <span className="text-red-400">*</span>
          </label>
          <select
            value={companyInfo.industry}
            onChange={(e) => setCompanyInfo({ industry: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm appearance-none cursor-pointer"
          >
            <option value="" className="text-slate-600">
              Select an industry...
            </option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={companyInfo.description}
            onChange={(e) => setCompanyInfo({ description: e.target.value })}
            placeholder="A brief description of what your company does..."
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm resize-none"
          />
        </div>

        {/* Logo Upload Placeholder */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Company Logo
          </label>
          <div className="border-2 border-dashed border-slate-700 rounded-sm p-8 text-center hover:border-slate-600 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-600 mt-1">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
