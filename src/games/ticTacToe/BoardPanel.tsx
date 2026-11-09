import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Box, Grid2X2, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import type { Round } from './engine';
import { AccessibleBoard } from './GameUI';

const Board3D = lazy(() => import('./Board3D'));

class SceneBoundary extends Component<{ children: React.ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function BoardPanel({ round, enabled, reducedMotion, onMove, status, seconds }: {
  round: Round; enabled: boolean; reducedMotion: boolean; onMove: (index: number) => void; status?: string; seconds?: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [flat, setFlat] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (flat || supported !== null) return;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      setSupported(!!context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setSupported(false); }
  }, [flat, supported]);
  useEffect(() => { setZoom(1); }, [round.size]);
  useEffect(() => {
    const element = panel.current;
    const changed = () => setExpanded(document.fullscreenElement === element);
    document.addEventListener('fullscreenchange', changed);
    return () => {
      document.removeEventListener('fullscreenchange', changed);
      if (document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
    };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fullscreenButton.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setExpanded(false);
        if (document.fullscreenElement === panel.current) void document.exitFullscreen().catch(() => {});
      } else if (event.key === 'Tab') {
        const focusable = [...(panel.current?.querySelectorAll<HTMLElement>('button, [tabindex]') ?? [])].filter(element => element.tabIndex >= 0 && !element.hasAttribute('disabled'));
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keys);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keys); fullscreenButton.current?.focus(); };
  }, [expanded]);
  async function toggleFullscreen() {
    if (expanded) {
      if (document.fullscreenElement === panel.current) await document.exitFullscreen().catch(() => {});
      setExpanded(false);
    } else {
      // CSS expansion remains usable on browsers/iframes without Fullscreen API.
      setExpanded(true);
      try { await panel.current?.requestFullscreen?.(); } catch { /* Use the viewport-sized fallback. */ }
    }
  }
  const show3D = supported && !flat;
  return <section ref={panel} className={`ttt-board-panel ttt-card ${expanded ? 'ttt-expanded' : ''}`} aria-label="Spielfeld"
    role={expanded ? 'dialog' : undefined} aria-modal={expanded || undefined}>
    <div className="ttt-board-toolbar">
      <span><span aria-hidden="true">✦</span> {round.size}×{round.size} · {round.target} in einer Reihe</span>
      <div>
        {show3D && <>
          <button type="button" title="Verkleinern" aria-label="Spielfeld verkleinern" disabled={zoom <= 1} onClick={() => setZoom(n => Math.max(1, n - .2))}><ZoomOut size={18} /></button>
          <button type="button" title="Vergrößern" aria-label="Spielfeld vergrößern" disabled={zoom >= 1.8} onClick={() => setZoom(n => Math.min(1.8, n + .2))}><ZoomIn size={18} /></button>
        </>}
        <button type="button" className="ttt-view-button" onClick={() => setFlat(value => !value)} disabled={supported === false}
          aria-pressed={!!show3D} aria-label={show3D ? 'Tastatur-Spielfeld anzeigen' : '3D-Spielfeld anzeigen'}>
          {show3D ? <Grid2X2 size={16} /> : <Box size={16} />}{show3D ? '2D / Tastatur' : '3D'}</button>
        <button ref={fullscreenButton} type="button" className="ttt-fullscreen-button" onClick={toggleFullscreen}
          aria-label={expanded ? 'Vollbild verlassen' : 'Spielfeld im Vollbild öffnen'} aria-pressed={expanded}>
          {expanded ? <Minimize size={17} /> : <Maximize size={17} />}<span>{expanded ? 'Schließen' : 'Vollbild'}</span>
        </button>
      </div>
    </div>
    {expanded && <div className="ttt-fullscreen-status"><span role="status">{status ?? (enabled ? 'Du bist dran!' : 'Spielfeld')}</span>
      {seconds !== undefined && <span className="ttt-fullscreen-clock" aria-label={`${seconds} Sekunden verbleiben`}>{seconds}s</span>}</div>}
    {show3D ? <>
      <div className={`ttt-scene ${enabled ? 'playable' : ''}`}>
        <SceneBoundary onFailure={() => setSupported(false)}>
          <Suspense fallback={<div className="ttt-scene-loading">Dein 3D-Spielfeld wird aufgebaut … ✨</div>}>
            <Board3D round={round} enabled={enabled} reducedMotion={reducedMotion} zoom={zoom} onMove={onMove} onFailure={() => setSupported(false)} />
          </Suspense>
        </SceneBoundary>
      </div>
      <p className="ttt-help">Tippe auf ein freies Feld. Für Pfeiltasten wechsle zu „2D / Tastatur“.</p>
    </> : <>
      {supported === false && <p className="ttt-help">3D ist hier nicht verfügbar. Du kannst auf diesem Spielfeld genauso spielen!</p>}
      <AccessibleBoard round={round} enabled={enabled} winning={round.result?.line ?? []} onMove={onMove} />
    </>}
  </section>;
}
