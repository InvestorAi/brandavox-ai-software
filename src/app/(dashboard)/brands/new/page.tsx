// Brandavox Register Brand Step Wizard Form
// Location: src/app/(dashboard)/brands/new/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Check, Target, Info, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const brandFormSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  website: z.string().url('Invalid website URL').or(z.string().length(0)),
  industry: z.string().min(1, 'Industry category is required'),
  mission: z.string(),
  vision: z.string(),
  rawValues: z.string(),
  sliderFormal: z.number().min(1).max(100),
  sliderTechnical: z.number().min(1).max(100),
  sliderBold: z.number().min(1).max(100),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

export default function NewBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      mission: '',
      vision: '',
      rawValues: '',
      sliderFormal: 50,
      sliderTechnical: 50,
      sliderBold: 50,
    },
  });

  const formValues = watch();

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1 && (!formValues.name || !formValues.industry)) return;
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const compileTone = (formal: number, technical: number, bold: number): string => {
    const f = formal > 60 ? 'formal & professional' : formal < 40 ? 'casual & conversational' : 'balanced';
    const t = technical > 60 ? 'technical & precise' : technical < 40 ? 'simple & plain-spoken' : 'clear & direct';
    const b = bold > 60 ? 'bold & authority-driven' : bold < 40 ? 'understated & reserved' : 'balanced';
    return `Brand voice characteristics: ${f}, ${t}, and ${b}.`;
  };

  const onSubmit = async (values: BrandFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Process raw values into array
    const valuesArray = values.rawValues
      ? values.rawValues
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
      : [];

    const compiledTone = compileTone(
      values.sliderFormal,
      values.sliderTechnical,
      values.sliderBold
    );

    const payload = {
      name: values.name,
      website: values.website,
      industry: values.industry,
      mission: values.mission,
      vision: values.vision,
      values: valuesArray,
      tone: compiledTone,
    };

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // Redirect to detail console of the brand
        router.push(`/brands/${json.data.id}`);
        router.refresh();
      } else {
        setSubmitError(json.error || 'Failed to save brand record');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Identity Profile', 'Philosophy & Values', 'Voice Parameters'];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Back to list hook */}
      <div>
        <button
          onClick={() => router.push('/brands')}
          className="flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      <PageHeader
        title="Register Identity"
        description="Bootstrap a brand's strategic parameters for memory capture and content alignment."
      />

      {/* Stepper indicator */}
      <div className="bg-surface border border-border-custom rounded-card p-6 space-y-4">
        <div className="flex justify-between text-xs font-mono font-medium text-text-muted uppercase">
          <span>Step {step} of 3</span>
          <span className="text-text-primary font-bold">{stepLabels[step - 1]}</span>
        </div>
        <div className="w-full h-1 bg-border-custom rounded-full flex gap-1">
          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-accent' : 'bg-border-custom/40'}`} />
          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-accent' : 'bg-border-custom/40'}`} />
          <div className={`h-full flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-accent' : 'bg-border-custom/40'}`} />
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border-custom rounded-card p-8 space-y-8">
        
        {/* STEP 1: IDENTITY PROFILE */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold font-display uppercase tracking-widest text-text-primary border-b border-border-custom pb-2">
              Brand Coordinates
            </h3>
            
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Brand Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Linear, Acme Corp, Pulse"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs font-mono text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label htmlFor="industry" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Industry Category *
              </label>
              <input
                id="industry"
                type="text"
                placeholder="e.g. E-Commerce Checkout, B2B SaaS, HealthTech"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                {...register('industry')}
              />
              {errors.industry && (
                <p className="text-xs font-mono text-red-400 mt-1">{errors.industry.message}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label htmlFor="website" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Website URL
              </label>
              <input
                id="website"
                type="text"
                placeholder="e.g. https://acme.com"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                {...register('website')}
              />
              {errors.website && (
                <p className="text-xs font-mono text-red-400 mt-1">{errors.website.message}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: PHILOSOPHY & VALUES */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold font-display uppercase tracking-widest text-text-primary border-b border-border-custom pb-2">
              Philosophical Coordinates
            </h3>

            {/* Mission */}
            <div className="space-y-2">
              <label htmlFor="mission" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Mission Statement
              </label>
              <textarea
                id="mission"
                rows={3}
                placeholder="What is the core purpose of this brand? What specific issue does it solve?"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65 resize-none"
                {...register('mission')}
              />
            </div>

            {/* Vision */}
            <div className="space-y-2">
              <label htmlFor="vision" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Vision Statement
              </label>
              <textarea
                id="vision"
                rows={3}
                placeholder="Where does this brand want to go in the long term? What is its future state?"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65 resize-none"
                {...register('vision')}
              />
            </div>

            {/* Values */}
            <div className="space-y-2">
              <label htmlFor="rawValues" className="block text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                Key Values (Comma Separated)
              </label>
              <input
                id="rawValues"
                type="text"
                placeholder="e.g. Transparency, Precision, Security, Aesthetic Integrity"
                className="w-full bg-background border border-border-custom rounded px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none placeholder-text-muted/65"
                {...register('rawValues')}
              />
              <p className="text-[10px] text-text-muted font-mono">
                Provide comma-separated values to seed the AI strategy engine.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: VOICE PARAMETERS */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold font-display uppercase tracking-widest text-text-primary border-b border-border-custom pb-2">
              Voice Coordinates
            </h3>

            {/* Slider 1: Formal vs Conversational */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                <span>Conversational</span>
                <span className="text-accent">{formValues.sliderFormal}%</span>
                <span>Formal</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                value={formValues.sliderFormal}
                onChange={(e) => setValue('sliderFormal', parseInt(e.target.value))}
              />
            </div>

            {/* Slider 2: Simple vs Technical */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                <span>Plain-spoken</span>
                <span className="text-accent">{formValues.sliderTechnical}%</span>
                <span>Technical</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                value={formValues.sliderTechnical}
                onChange={(e) => setValue('sliderTechnical', parseInt(e.target.value))}
              />
            </div>

            {/* Slider 3: Reserved vs Bold */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
                <span>Reserved</span>
                <span className="text-accent">{formValues.sliderBold}%</span>
                <span>Bold & Authority</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent"
                value={formValues.sliderBold}
                onChange={(e) => setValue('sliderBold', parseInt(e.target.value))}
              />
            </div>

            {/* Tone Preview Block */}
            <div className="p-4 bg-background border border-border-custom rounded flex items-start gap-3 mt-6">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest block">
                  Tone Compiler Preview
                </span>
                <p className="text-xs font-sans text-text-primary italic leading-relaxed">
                  "{compileTone(formValues.sliderFormal, formValues.sliderTechnical, formValues.sliderBold)}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action errors */}
        {submitError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Error: {submitError}</span>
          </div>
        )}

        {/* Stepper Navigation Actions */}
        <div className="flex justify-between border-t border-border-custom pt-6">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="bg-surface border border-border-custom hover:border-text-primary text-text-muted hover:text-text-primary font-mono text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/brands')}
              className="bg-surface border border-border-custom text-text-muted hover:text-text-primary font-mono text-xs px-4 py-2.5 rounded-badge transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!formValues.name || !formValues.industry)}
              className="bg-accent hover:bg-accent-hover text-white disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs px-4 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent-hover text-white disabled:opacity-50 font-mono text-xs px-5 py-2.5 rounded-badge flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Initialize Identity</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
