'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  processOcrUpload,
  createInboxFromPaste,
  convertInboxToDraft,
  convertInboxToSample,
  convertInboxToEngagement,
} from '@/app/actions';
import { FileUp, FileText, MessageCircle, PenLine, Loader2 } from 'lucide-react';

type InboxItem = {
  id: string;
  type: string;
  title: string | null;
  source: string | null;
  rawText: string | null;
  cleanedText: string | null;
  status: string;
  createdAt: Date;
};

export function InboxClient({ initialItems }: { initialItems: InboxItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  const [uploading, setUploading] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasting, setPasting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [convertLoading, setConvertLoading] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    formData.set('type', file.type === 'application/pdf' ? 'OCR_PDF' : 'OCR_IMAGE');
    const r = await processOcrUpload(formData);
    setUploading(false);
    if (r.ok) router.refresh();
    e.target.value = '';
  }

  async function handlePaste() {
    if (!pasteText.trim()) return;
    setPasting(true);
    const r = await createInboxFromPaste(pasteText.trim());
    setPasting(false);
    if (r.ok) {
      setPasteText('');
      router.refresh();
    }
  }

  async function handleConvert(itemId: string, action: 'draft' | 'sample' | 'engagement') {
    setConvertLoading(itemId);
    if (action === 'draft') {
      const r = await convertInboxToDraft(itemId);
      if (r.ok && r.draftId) router.push(`/app/studio/${r.draftId}`);
      if (r.ok) router.refresh();
    } else if (action === 'sample') {
      const r = await convertInboxToSample(itemId);
      if (r.ok) router.refresh();
    } else {
      const r = await convertInboxToEngagement(itemId);
      if (r.ok) {
        router.push('/app/engagement');
        router.refresh();
      }
    }
    setConvertLoading(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import</CardTitle>
          <CardDescription>Upload image/PDF for OCR or paste text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              id="inbox-upload"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => document.getElementById('inbox-upload')?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileUp className="h-4 w-4 mr-2" />
              )}
              Upload image/PDF
            </Button>
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Paste text here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
            <Button size="sm" onClick={handlePaste} disabled={pasting || !pasteText.trim()}>
              {pasting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
          <CardDescription>Convert to draft, sample, or engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No items yet. Upload an image or paste text to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{item.title ?? 'Untitled'}</span>
                      <span className="text-xs text-muted-foreground capitalize">{item.type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </button>
                  {expandedId === item.id && (
                    <div className="border-t border-border p-4 space-y-3">
                      <div className="max-h-40 overflow-y-auto rounded bg-muted/30 p-3 text-sm">
                        {(item.cleanedText ?? item.rawText) || 'No text'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvert(item.id, 'draft')}
                          disabled={!!convertLoading}
                        >
                          {convertLoading === item.id ? (
                            <Loader2 className="h-3.5 w-3 animate-spin mr-1" />
                          ) : (
                            <PenLine className="h-3.5 w-3 mr-1" />
                          )}
                          Create Draft
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvert(item.id, 'sample')}
                          disabled={!!convertLoading}
                        >
                          <FileText className="h-3.5 w-3 mr-1" />
                          Save as Sample
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvert(item.id, 'engagement')}
                          disabled={!!convertLoading}
                        >
                          <MessageCircle className="h-3.5 w-3 mr-1" />
                          Create Engagement
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
