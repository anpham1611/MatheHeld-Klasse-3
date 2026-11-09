import React, { Component, Suspense, lazy, useEffect, useState } from 'react';
import { Box, Grid2X2, ZoomIn, ZoomOut } from 'lucide-react';
import type { Round } from './engine';
import { AccessibleBoard } from './GameUI';

const Board3D = lazy(() => import('./Board3D'));

class SceneBoundary extends Component<{ children: React.ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function BoardPanel({ round, enabled, reducedMotion, onMove }: {
  round: Round; enabled: boolean; reducedMotion: boolean; onMove: (index: number) => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [flat, setFlat] = useState(false);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      setSupported(!!context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setSupported(false); }
  }, []);
  useEffect(() => { setZoom(1); }, [round.size]);
  const show3D = supported && !flat;
  return <section className="ttt-board-panel ttt-card" aria-label="Spielfeld">
    <div className="ttt-board-toolbar">
      <span><span aria-hidden="true">✦</span> {round.size}×{round.size} · {round.target} in einer Reihe</span>
      <div>
        {show3D && <>
          <button type="button" title="Verkleinern" aria-label="Spielfeld verkleinern" disabled={zoom <= 1} onClick={() => setZoom(n => Math.max(1, n - .2))}><ZoomOut size={18} /></button>
          <button type="button" title="Vergrößern" aria-label="Spielfeld vergrößern" disabled={zoom >= 1.8} onClick={() => setZoom(n => Math.min(1.8, n + .2))}><ZoomIn size={18} /></button>
        </>}
        <button type="button" className="ttt-view-button" onClick={() => setFlat(value => !value)} disabled={supported === false}
          aria-pressed={!show3D} aria-label={show3D ? 'Tastatur-Spielfeld anzeigen' : '3D-Spielfeld anzeigen'}>
          {show3D ? <Grid2X2 size={16} /> : <Box size={16} />}{show3D ? '2D / Tastatur' : '3D'}</button>
      </div>
    </div>
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
