import { useState } from 'react';
import { Icon } from './icons';
import { sampleList } from '../data';
import type { BusinessProfile, SampleId } from '../types';

interface QuestionnaireProps {
  onSubmit: (profile: BusinessProfile, sampleId: SampleId) => void;
}

export function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const [sampleId, setSampleId] = useState<SampleId | null>('perfume');
  const [form, setForm] = useState<BusinessProfile>(sampleList.find((s) => s.id === 'perfume')!.profile);

  const emptyForm: BusinessProfile = {
    businessName: '',
    idea: '',
    industry: '',
    productsServices: [],
    targetCustomers: '',
    geography: '',
    pricing: '',
    businessModel: '',
    competitors: [],
    differentiators: '',
    researchGoals: [],
  };

  const update = <K extends keyof BusinessProfile>(k: K, v: BusinessProfile[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const switchSample = (id: SampleId) => {
    setSampleId(id);
    setForm(sampleList.find((s) => s.id === id)!.profile);
  };

  const clearForm = () => {
    setSampleId(null);
    setForm(emptyForm);
  };

  const [competitorInput, setCompetitorInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const addCompetitor = () => {
    const v = competitorInput.trim();
    if (!v) return;
    update('competitors', [...(form.competitors ?? []), v]);
    setCompetitorInput('');
  };
  const removeCompetitor = (i: number) =>
    update('competitors', (form.competitors ?? []).filter((_c: string, idx: number) => idx !== i));

  const addGoal = () => {
    const v = goalInput.trim();
    if (!v) return;
    update('researchGoals', [...(form.researchGoals ?? []), v]);
    setGoalInput('');
  };
  const removeGoal = (i: number) =>
    update('researchGoals', (form.researchGoals ?? []).filter((_g: string, idx: number) => idx !== i));

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-10 bg-gradient-to-b from-white to-ink-50/40 dark:from-ink-900 dark:to-ink-800">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500 text-white mb-3">
            <Icon.Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-100">Tell me about your business</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-md mx-auto">
            A 60-second form. The more context you give, the sharper the analysis.
          </p>
        </div>

        <div className="card bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-3">Choose how to start</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <button
              onClick={clearForm}
              className={`text-left rounded-xl border p-3 transition ${sampleId === null ? 'border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500 dark:ring-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500 bg-white dark:bg-ink-800'}`}
            >
              <div className="flex items-center gap-2">
                <Icon.Plus className={`w-4 h-4 ${sampleId === null ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-400 dark:text-ink-500'}`} />
                <p className="text-sm font-medium text-ink-900 dark:text-ink-100">Create your own</p>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">Start with a blank form</p>
            </button>
            {sampleList.map((s) => (
              <button
                key={s.id}
                onClick={() => switchSample(s.id)}
                className={`text-left rounded-xl border p-3 transition relative ${sampleId === s.id ? 'border-ink-900 dark:border-ink-100 ring-1 ring-ink-900 dark:ring-ink-100 bg-ink-50/40 dark:bg-ink-700/50' : 'border-ink-200 dark:border-ink-600 hover:border-ink-300 dark:hover:border-ink-500 bg-white dark:bg-ink-800'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{s.label}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{s.profile.industry}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded px-1.5 py-0.5">
                    Sample
                  </span>
                </div>
                <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1.5">
                  Contains predefined data
                </p>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-500 mt-3">
            {sampleId === null ? 'Fill in your own business details below.' : 'Selecting a sample pre-fills the form so you can edit and submit.'}
          </p>
        </div>

        <form
          className="card bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-6 space-y-5"
          onSubmit={(e) => { e.preventDefault(); onSubmit(form, sampleId ?? 'perfume'); }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} required />
            </Field>
            <Field label="Business idea (1-2 sentences)">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.idea} onChange={(e) => update('idea', e.target.value)} required />
            </Field>
            <Field label="Industry">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.industry} onChange={(e) => update('industry', e.target.value)} required />
            </Field>
            <Field label="Products / services">
              <input
                className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500"
                value={form.productsServices?.join(', ') ?? ''}
                onChange={(e) => update('productsServices', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="e.g. EDP, Discovery sets, Refill program"
              />
            </Field>
            <Field label="Pricing">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.pricing ?? ''} onChange={(e) => update('pricing', e.target.value)} placeholder="₹3,500 / unit" />
            </Field>
            <Field label="Business model">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.businessModel ?? ''} onChange={(e) => update('businessModel', e.target.value)} placeholder="DTC, B2B, Subscription..." />
            </Field>
            <Field label="Location / market">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.geography ?? ''} onChange={(e) => update('geography', e.target.value)} />
            </Field>
            <Field label="Target customers">
              <input className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500" value={form.targetCustomers ?? ''} onChange={(e) => update('targetCustomers', e.target.value)} />
            </Field>
            <Field label="Differentiators" className="sm:col-span-2">
              <textarea
                className="input min-h-[80px] dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500"
                value={form.differentiators ?? ''}
                onChange={(e) => update('differentiators', e.target.value)}
                placeholder="What makes you different from competitors?"
              />
            </Field>
          </div>

          <Field label="Known competitors">
            <div className="flex gap-2">
              <input
                className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor(); } }}
                placeholder="Type a name and press Enter"
              />
              <button type="button" onClick={addCompetitor} className="btn-secondary dark:bg-ink-700 dark:border-ink-600 dark:text-ink-200 dark:hover:bg-ink-600">Add</button>
            </div>
            {(form.competitors?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.competitors ?? []).map((c: string, i: number) => (
                  <span key={`${c}-${i}`} className="pill bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-300">
                    {c}
                    <button type="button" onClick={() => removeCompetitor(i)} className="ml-1 text-ink-500 hover:text-ink-900 dark:hover:text-ink-100"><Icon.X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="What do you want to research?">
            <div className="flex gap-2">
              <input
                className="input dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100 dark:placeholder:text-ink-500"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } }}
                placeholder="e.g. Find market gaps for the next 12 months"
              />
              <button type="button" onClick={addGoal} className="btn-secondary dark:bg-ink-700 dark:border-ink-600 dark:text-ink-200 dark:hover:bg-ink-600">Add</button>
            </div>
            {(form.researchGoals?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.researchGoals ?? []).map((g: string, i: number) => (
                  <span key={`${g}-${i}`} className="pill bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    {g}
                    <button type="button" onClick={() => removeGoal(i)} className="ml-1 text-emerald-700/70 hover:text-emerald-900 dark:hover:text-emerald-300"><Icon.X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-100 dark:border-ink-700">
            <p className="text-xs text-ink-500 dark:text-ink-400">Your data is stored only in this browser session.</p>
            <button type="submit" className="btn-primary">
              <Icon.Sparkles />
              Start analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
