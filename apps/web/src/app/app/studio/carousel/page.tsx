'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type Slide = {
  id: string;
  title: string;
  content: string;
  order: number;
};

export default function CarouselBuilderPage() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'Slide 1', content: '', order: 1 },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  function addSlide() {
    const next = slides.length + 1;
    setSlides((s) => [...s, { id: String(Date.now()), title: `Slide ${next}`, content: '', order: next }]);
    setActiveIndex(slides.length);
  }

  function removeSlide(id: string) {
    if (slides.length <= 1) return;
    const idx = slides.findIndex((s) => s.id === id);
    setSlides((s) => s.filter((s) => s.id !== id));
    setActiveIndex(Math.max(0, idx - 1));
  }

  function updateSlide(id: string, updates: Partial<Slide>) {
    setSlides((s) => s.map((slide) => (slide.id === id ? { ...slide, ...updates } : slide)));
  }

  function exportOutline() {
    const outline = slides.map((s, i) => ({
      order: i + 1,
      title: s.title,
      content: s.content,
    }));
    const blob = new Blob([JSON.stringify(outline, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carousel-outline.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/app/studio" className="text-sm text-muted-foreground hover:text-foreground">
            ← Studio
          </Link>
          <h1 className="text-2xl font-semibold mt-1">Carousel Builder</h1>
          <p className="text-muted-foreground text-sm">
            Slide-by-slide generator with preview and export
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportOutline}>
            <Download className="h-4 w-4 mr-1" />
            Export outline
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {previewMode ? 'Slide preview' : `Slide ${activeIndex + 1}`}
              </CardTitle>
              {!previewMode && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                    disabled={activeIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveIndex(Math.min(slides.length - 1, activeIndex + 1))}
                    disabled={activeIndex === slides.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center p-8 bg-muted/30">
                  <p className="text-2xl font-bold text-center">{activeSlide?.title}</p>
                  <p className="text-muted-foreground text-center mt-2">{activeSlide?.content || 'Add content…'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={activeSlide?.title ?? ''}
                      onChange={(e) => activeSlide && updateSlide(activeSlide.id, { title: e.target.value })}
                      placeholder="Slide title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Content</label>
                    <textarea
                      className="mt-1 min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={activeSlide?.content ?? ''}
                      onChange={(e) => activeSlide && updateSlide(activeSlide.id, { content: e.target.value })}
                      placeholder="Main point for this slide"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Slides</CardTitle>
              <CardDescription>Click to edit, drag to reorder (coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className={`flex items-center justify-between rounded-md border p-2 cursor-pointer transition-colors ${
                    i === activeIndex ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                  }`}
                  onClick={() => setActiveIndex(i)}
                >
                  <span className="text-sm font-medium">Slide {i + 1}</span>
                  {slides.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlide(slide.id);
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={addSlide}>
                <Plus className="h-4 w-4 mr-1" />
                Add slide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
