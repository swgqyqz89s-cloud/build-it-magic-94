import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

type ChatMessage = { role: 'user' | 'assistant' | 'system', content: string };

export default function OllamaChat() {
  const [model, setModel] = useState('llama3');
  const [prompt, setPrompt] = useState('Sag Hallo auf Deutsch.');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  async function send() {
    setLoading(true);
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: prompt };
    setMessages((m) => [...m, userMsg]);

    try {
      if (streaming) {
        const res = await fetch('/ollama/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [...messages, userMsg],
            stream: true
          })
        });
        if (!res.ok || !res.body) throw new Error('HTTP ' + res.status);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        let assistantMsg: ChatMessage = { role: 'assistant', content: '' };
        setMessages((m) => [...m, assistantMsg]);
        let idx = messages.length + 1;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          acc += chunk;

          const lines = acc.split('\n');
          acc = lines.pop() || '';
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line);
              const delta = obj?.message?.content || '';
              assistantMsg.content += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[idx] = { ...assistantMsg };
                return copy;
              });
            } catch { /* ignore malformed line */ }
          }
        }
      } else {
        const res = await fetch('/ollama/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [...messages, userMsg],
            stream: false
          })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const assistant: ChatMessage = { 
          role: 'assistant', 
          content: data?.message?.content ?? JSON.stringify(data, null, 2) 
        };
        setMessages((m) => [...m, assistant]);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Ollama React Test</h1>
      <Card className="p-6">
        <div className="flex gap-4 mb-4 items-center">
          <div className="flex-1">
            <label htmlFor="model" className="block mb-2 font-semibold">
              Modell:
            </label>
            <Input 
              id="model" 
              value={model} 
              onChange={e => setModel(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox 
              id="streaming"
              checked={streaming} 
              onCheckedChange={(checked) => setStreaming(checked as boolean)} 
            />
            <label htmlFor="streaming">Streaming</label>
          </div>
        </div>

        <Textarea 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          className="mb-4 min-h-[100px]"
          placeholder="Gib deine Nachricht ein..."
        />

        <div className="flex gap-2 mb-4">
          <Button 
            onClick={send} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Sende...' : 'Senden'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearChat}
          >
            Leeren
          </Button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md">
            ❌ {error} — Läuft Ollama? Proxy in vite.config.ts gesetzt?
          </div>
        )}
        
        {!error && loading && (
          <div className="p-3 mb-4 bg-muted rounded-md">
            ⏳ Anfrage läuft...
          </div>
        )}

        <div className="mt-6 space-y-3">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-lg ${
                m.role === 'user' 
                  ? 'bg-primary/10 ml-8' 
                  : 'bg-secondary/50 mr-8'
              }`}
            >
              <div className="font-semibold mb-1 capitalize">{m.role}:</div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
