'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Languages,
  ArrowRight,
  Globe,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Volume2
} from 'lucide-react';
import Link from 'next/link';

export default function ScriptTranslationPage() {
  const [sourceText, setSourceText] = useState(
    "Check out this amazing offer! Get 50% off on all items today only. Don't miss this opportunity to grow your business."
  );
  const [targetLang, setTargetLang] = useState('swahili');
  const [useSlang, setUseSlang] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [copied, setCopied] = useState(false);

  const slangAdapters: Record<string, string> = {
    swahili: "Sikiliza hii ofa kabambe! Pata punguzo la asilimia 50 kwa bidhaa zote leo tu. Usikose hii nafasi ya kukuza biashara yako, mwanangu!",
    yoruba: "Gbo eleyi o! Gba idaji owo kuro lori gbogbo ohun ti o ba ra loni nikan. Ma se padanu anfani yi lati je ki oja re gbilẹ, sha mase sùn!",
    japanese: "驚きの特典をチェック！本日限定で全品50%OFF。ビジネスを急成長させるこの大チャンスを絶対に見逃すな！",
    swedish: "Kolla in det här grymma erbjudandet! Få 50% rabatt på alla artiklar endast idag. Missa inte det här läget att lyfta din verksamhet, polarn!",
    spanish: "¡Mira este ofertón espectacular! Llévate 50% de descuento en todos los artículos solo por hoy. No dejes pasar esta oportunidad para hacer crecer tu negocio, ¡dale con todo!",
    pidgin: "Chook eye for this beta lowkey offer! Grab 50% awoof discount on top all items today only. No go sleep on this one if you wan make your business level up double-double!"
  };

  const standardTranslations: Record<string, string> = {
    swahili: "Tazama ofa hii ya kushangaza! Pata punguzo la 50% kwa bidhaa zote leo pekee. Usikose nafasi hii ya kukuza biashara yako.",
    yoruba: "Wo adehun iyalẹnu yii! Gba 50% kuro lori gbogbo awọn ohun kan loni nikan. Maṣe padanu aye yii lati dagba iṣowo rẹ.",
    japanese: "こちらの素晴らしい特典をご覧ください！本日限定で全商品が50%割引になります。ビジネスを拡大するこの機会をお見逃しなく。",
    swedish: "Kolla in detta fantastiska erbjudande! Få 50% rabatt på alla varor endast idag. Missa inte denna möjlighet att utveckla ditt företag.",
    spanish: "¡Echa un vistazo a esta increíble oferta! Obtén un 50% de descuento en todos los artículos solo hoy. No te pierdas esta oportunidad de hacer crecer tu negocio.",
    pidgin: "Look this amazing offer. Get 50% discount on all items today only. Do not miss this opportunity to grow your business."
  };

  const handleTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      const output = useSlang ? slangAdapters[targetLang] : standardTranslations[targetLang];
      setTranslatedText(output || standardTranslations['swahili']);
      setIsTranslating(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="Script Translation & Slang Desk"
        description="Translate and adapt marketing copy, social scripts, or voice narratives into global languages and authentic local slangs."
      />

      {/* Guide Toolkit */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Translation Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Enter Source Copy</span>
            <p>Type or paste your English marketing ad script, hooks, or captions into the editor. Keep it clear to preserve tone indicators.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Select Dialect & Slang Modifiers</span>
            <p>Pick Swahili, Yoruba, Japanese, Swedish, or Spanish. Enable the "Slang modifier" to replace stiff dictionary phrasing with natural colloquialisms.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Sync to Voice Studio</span>
            <p>Review the localized output, copy it, or redirect it immediately to the Voice Generation Studio to synthesize authentic localized voiceovers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input column */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-custom">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
                Source Script (English)
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              className="w-full p-4 bg-background border border-border-custom text-text-primary font-mono text-xs focus:outline-none focus:border-accent rounded resize-none leading-relaxed"
              placeholder="Enter your script here..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                  Target Language
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent"
                >
                  <option value="swahili">Swahili (Kiswahili)</option>
                  <option value="yoruba">Yoruba (Yorùbá)</option>
                  <option value="pidgin">Naija Pidgin (Naija Slang)</option>
                  <option value="japanese">Japanese (日本語)</option>
                  <option value="swedish">Swedish (Svenska)</option>
                  <option value="spanish">Spanish (Español)</option>
                </select>
              </div>

              {/* Slang Modifiers Toggle */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer py-2 px-3 bg-background border border-border-custom rounded-sm select-none">
                  <input
                    type="checkbox"
                    checked={useSlang}
                    onChange={(e) => setUseSlang(e.target.checked)}
                    className="accent-accent cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase font-bold text-text-primary">Apply Local Slang</span>
                    <span className="text-[8px] text-text-muted leading-tight">Inject cultural slangs & idioms</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Translating & Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Translate & Adapt Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output column */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-custom">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
                Translated Script Output
              </h3>
            </div>
            {translatedText && (
              <button
                onClick={handleCopy}
                className="py-1 px-2 border border-border-custom hover:border-accent text-text-primary rounded-sm font-mono text-[9px] uppercase flex items-center gap-1 cursor-pointer transition-all"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {translatedText ? (
              <div className="w-full min-h-[130px] p-4 bg-background border border-border-custom rounded text-text-primary font-mono text-xs leading-relaxed whitespace-pre-wrap select-all">
                {translatedText}
              </div>
            ) : (
              <div className="w-full min-h-[130px] border border-dashed border-border-custom/80 rounded flex flex-col items-center justify-center text-text-muted italic text-[10px]">
                <span>No translated script output yet.</span>
                <span>Configure options and click "Translate & Adapt" above.</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-4 border-t border-border-custom/60 flex items-center justify-between">
              <span className="text-[9px] text-text-muted font-mono uppercase">
                {useSlang ? '⚡ Cultural Adaptation Active' : '✓ Direct Translation'}
              </span>

              {translatedText && (
                <div className="flex gap-2">
                  <Link
                    href={`/voice?script=${encodeURIComponent(translatedText)}`}
                    className="py-1.5 px-3 bg-zinc-900 border border-border-custom hover:border-accent text-text-primary text-[10px] font-mono font-bold uppercase rounded-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Send to Voice Studio</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
