'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Download,
  Maximize2,
  Trash2,
  Cpu,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  ratio: string;
  resolution: string;
  createdAt: string;
}

export default function ImageGeneratorPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form parameters
  const [selectedBrand, setSelectedBrand] = useState('');
  const [prompt, setPrompt] = useState('Minimalist soda can packaging design on concrete table, harsh cinematic direct sunlight, raw textures, desaturated orange accent lines');
  const [selectedModel, setSelectedModel] = useState('midjourney-v6');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [selectedResolution, setSelectedResolution] = useState('8k');
  const [selectedStyle, setSelectedStyle] = useState('minimalist-photo');

  // Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const [gallery, setGallery] = useState<GeneratedImage[]>([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      prompt: 'Desaturated abstract Swiss geometric layouts, layout grid typography',
      model: 'Brandavox Synth v1',
      ratio: '16:9',
      resolution: '8k',
      createdAt: '2026-06-11 20:30'
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
      prompt: 'Minimalist brand logo vector, high contrast desaturated grey',
      model: 'Midjourney v6',
      ratio: '1:1',
      resolution: '4k',
      createdAt: '2026-06-11 18:15'
    }
  ]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch Brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        if (data.success && data.data) {
          setBrands(data.data);
          if (data.data.length > 0) {
            setSelectedBrand(data.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load active brand contexts.');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationLogs([]);

    const logs = [
      `[INTEL] Reading brand positioning guidelines for prompt optimization...`,
      `[INTEL] Enhancing input prompt with style directives...`,
      `[NEURAL] Model parameters set to: model=${selectedModel}, ratio=${selectedRatio}`,
      `[GPU] Allocating neural rendering clusters (Steps: 50, CFG: 7.5)...`,
      `[GPU] Compiling noise latents for: "${prompt.slice(0, 40)}..."`,
      `[AUDIO] Upscaling output channels to ${selectedResolution.toUpperCase()} resolution grids...`,
      `[NEURAL] Synthesized output frames complete.`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setGenerationLogs((prev) => [...prev, log]);
        if (index === logs.length - 1) {
          // Construct Pollinations.ai URL with encoded parameters
          const resolutionTag = selectedResolution === '16k' ? '16k extreme detailed' : selectedResolution === '8k' ? '8k master' : '4k ultra hd';
          const cleanedPrompt = `${prompt}, style: ${selectedStyle}, aspect ratio: ${selectedRatio}, ${resolutionTag}, desaturated, high contrast swiss modern design`;
          const encodedPrompt = encodeURIComponent(cleanedPrompt);
          const randomSeed = Math.floor(Math.random() * 1000000);
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true&seed=${randomSeed}`;

          const newId = `img-${Date.now()}`;
          const newImg: GeneratedImage = {
            id: newId,
            url: imageUrl,
            prompt: prompt,
            model: selectedModel,
            ratio: selectedRatio,
            resolution: selectedResolution,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };

          // Mark as loading initially to trigger the shimmer skeleton
          setLoadedImages((prev) => ({ ...prev, [newId]: false }));
          setGallery((prev) => [newImg, ...prev]);
          setIsGenerating(false);
        }
      }, (index + 1) * 250);
    });
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleDeleteImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGallery((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-8 font-sans text-xs">
      <PageHeader
        title="AI Image Generator"
        description="Synthesize high-fidelity 4K, 8K, and 16K product concepts, visual mockups, and layout graphics in real-time."
      />

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Guide Toolkit */}
      <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
        <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent" />
          <span>Image Generation Toolkit & How to Use</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-text-muted leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">1. Write Composition Prompt</span>
            <p>Describe your visual layout (soda packaging, concrete table, geometric shapes) in the editor. Set exact visual styles.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">2. Select Aspect Ratio & Resolution</span>
            <p>Choose 1:1, 16:9, or 9:16 and pick your resolution output (4K Ultra, 8K Master, or 16K Extreme upscale layers).</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block font-mono text-[9px] uppercase">3. Preview & Download</span>
            <p>Review the rendered images in the asset gallery. Shimmer placeholders indicate active rendering. Click any image to preview and download.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Synthesis Controls */}
        <div className="bg-surface border border-border-custom p-6 rounded-card space-y-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom">
            <ImageIcon className="w-4 h-4 text-accent" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-text-primary font-mono">
              Image Parameters
            </h3>
          </div>

          <div className="space-y-4">
            {/* Identity context */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Identity Profile Context
              </label>
              {loadingBrands ? (
                <div className="h-9 bg-background/50 border border-border-custom animate-pulse rounded-sm" />
              ) : (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Model select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                AI Synthesis Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="midjourney-v6">Midjourney v6 (Highly Detailed)</option>
                <option value="dalle-3">OpenAI DALL-E 3 (Exact Prompts)</option>
                <option value="sd-v3">Stable Diffusion v3 (Photorealistic)</option>
                <option value="brandavox-synth">Brandavox Synth v1</option>
              </select>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Resolution Quality
              </label>
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="4k">4K Ultra HD (3840 x 2160)</option>
                <option value="8k">8K Master (7680 x 4320)</option>
                <option value="16k">16K Extreme Upscale (15360 x 8640)</option>
              </select>
            </div>

            {/* Ratio selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: '1:1 Square', value: '1:1' },
                  { name: '16:9 Landscape', value: '16:9' },
                  { name: '9:16 Portrait', value: '9:16' }
                ].map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setSelectedRatio(ratio.value)}
                    className={`py-2 px-1 border font-mono text-[9px] uppercase rounded-sm cursor-pointer transition-colors ${
                      selectedRatio === ratio.value
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-border-custom text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {ratio.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Style selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Visual Aesthetic Style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border-custom text-text-primary focus:outline-none focus:border-accent rounded-sm"
              >
                <option value="minimalist-photo">Minimalist Product Photography</option>
                <option value="3d-render">Raw 3D Octane Render</option>
                <option value="vector-art">Desaturated Vector Blueprint</option>
                <option value="cyberpunk">Cyberpunk Industrial Design</option>
              </select>
            </div>

            <div className="text-[9px] text-text-muted font-mono bg-background/50 border border-border-custom/40 p-2.5 rounded-sm leading-relaxed">
              ⚡ Intercepts and optimizes prompt parameters using organization identity metrics. Est cost: ~350 credits.
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Canvas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt input */}
          <div className="bg-surface border border-border-custom p-6 rounded-card space-y-4">
            <span className="text-[10px] text-text-muted font-bold font-mono uppercase tracking-wider block">
              Image Composition Prompt
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full p-4 bg-background border border-border-custom text-text-primary text-xs font-mono focus:outline-none focus:border-accent rounded-sm resize-none leading-relaxed"
              placeholder="Describe what visual asset to generate..."
            />
          </div>

          {/* Neural Logs during rendering */}
          {isGenerating && (
            <div className="bg-surface border border-border-custom p-5 rounded-card font-mono text-[10px] space-y-2">
              <div className="flex items-center gap-2 text-text-muted pb-1.5 border-b border-border-custom/60">
                <Cpu className="w-3.5 h-3.5" />
                <span className="font-bold uppercase tracking-wider font-mono">Neural Rendering Logs</span>
              </div>
              <div className="space-y-1 text-zinc-400">
                {generationLogs.map((log, index) => (
                  <div key={index} className="font-mono">{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Gallery */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
              Asset Gallery
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.map((img) => {
                const isLoaded = loadedImages[img.id] !== false;
                return (
                  <div
                    key={img.id}
                    onClick={() => isLoaded && setPreviewImage(img.url)}
                    className="bg-surface border border-border-custom rounded-card overflow-hidden cursor-pointer group hover:border-accent/40 transition-colors relative"
                  >
                    {/* Shimmer skeleton overlay when image is not yet loaded */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-background flex flex-col items-center justify-center space-y-2 z-10">
                        <RefreshCw className="w-5 h-5 text-accent animate-spin" />
                        <span className="font-mono text-[8px] uppercase tracking-wider text-text-muted">
                          Resolving {img.resolution.toUpperCase()} grid...
                        </span>
                      </div>
                    )}

                    {/* Image wrapper */}
                    <div className="relative aspect-video bg-background overflow-hidden border-b border-border-custom">
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(img.id)}
                        loading="lazy"
                      />
                      {isLoaded && (
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(img.url, '_blank');
                            }}
                            className="p-2 bg-zinc-900 border border-border-custom rounded-sm text-text-primary hover:border-accent cursor-pointer"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteImage(img.id, e)}
                            className="p-2 bg-zinc-900 border border-border-custom rounded-sm text-red-400 hover:border-red-500 cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meta body */}
                    <div className="p-4 space-y-2">
                      <p className="font-medium text-text-primary line-clamp-2 italic font-sans text-xs">
                        "{img.prompt}"
                      </p>
                      <div className="flex justify-between text-[9px] text-text-muted font-mono uppercase">
                        <span>Model: {img.model}</span>
                        <span>Res: {img.resolution.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden border border-zinc-800 bg-zinc-950">
            <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-[80vh] object-contain" />
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>Press anywhere to close</span>
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                download="brandavox_ai_image.png"
                className="text-accent hover:underline flex items-center gap-1 font-bold uppercase text-[10px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-res</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
