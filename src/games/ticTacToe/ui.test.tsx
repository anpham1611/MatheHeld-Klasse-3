import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRound } from './engine';
import { BoardPanel } from './BoardPanel';

const ui = await import('./GameUI').catch(() => undefined);
function api() { assert.ok(ui, 'Game controls and accessible board must exist'); return ui; }

test('accessible board exposes X/O pieces and winning cells without animal icons or WebGL', () => {
  const { AccessibleBoard } = api();
  const round = createRound(5);
  round.board[0] = 'kitten';
  round.board[1] = 'puppy';
  const markup = renderToStaticMarkup(<AccessibleBoard round={round} enabled={false} winning={[0]} onMove={() => {}} />);
  assert.equal((markup.match(/role="gridcell"/g) ?? []).length, 25);
  assert.ok(markup.includes('Zeile 1, Spalte 1: X'));
  assert.ok(markup.includes('Zeile 1, Spalte 2: O'));
  assert.ok(!markup.includes('🐱') && !markup.includes('🐶'));
  assert.ok(markup.includes('Zeile 5, Spalte 5: frei'));
  assert.ok(markup.includes('Gewinnfeld'));
  assert.ok(markup.includes('aria-disabled="true"'));
});

test('setup exposes board selection and robot difficulties', () => {
  const { SetupPanel } = api();
  const markup = renderToStaticMarkup(<SetupPanel mode="robot" size={3} difficulty="hard" configured={false} busy={false}
    roomCode="" onRoomCode={() => {}} onMode={() => {}} onSize={() => {}} onDifficulty={() => {}}
    symbol="X" onSymbol={() => {}} onStart={() => {}} onCreate={() => {}} onJoin={() => {}} />);
  for (const label of ['3×3', '5×5', '10×10', 'Eigene Größe', 'Leicht', 'Mittel', 'Knifflig', 'Los geht']) assert.ok(markup.includes(label));
});

test('unconfigured online mode explains the missing backend and disables room actions', () => {
  const { SetupPanel } = api();
  const markup = renderToStaticMarkup(<SetupPanel mode="online" size={3} difficulty="easy" configured={false} busy={false}
    roomCode="ROOM" onRoomCode={() => {}} onMode={() => {}} onSize={() => {}} onDifficulty={() => {}}
    symbol="O" onSymbol={() => {}} onStart={() => {}} onCreate={() => {}} onJoin={() => {}} />);
  assert.ok(markup.includes('noch nicht verbunden'));
  assert.ok(markup.includes('Raum erstellen'));
  assert.ok(markup.includes('Raum beitreten'));
  assert.ok((markup.match(/disabled=""/g) ?? []).length >= 3);
});

test('symbol selection exposes both choices and explains who moves first', () => {
  const { SetupPanel } = api();
  const render = (symbol: 'X' | 'O') => renderToStaticMarkup(<SetupPanel mode="robot" size={3} difficulty="hard" configured={false} busy={false}
    roomCode="" onRoomCode={() => {}} onMode={() => {}} onSize={() => {}} onDifficulty={() => {}}
    symbol={symbol} onSymbol={() => {}} onStart={() => {}} onCreate={() => {}} onJoin={() => {}} />);
  const x = render('X');
  const o = render('O');
  assert.ok(x.includes('aria-label="Als X spielen" aria-pressed="true"'));
  assert.ok(o.includes('aria-label="Als O spielen" aria-pressed="true"'));
  assert.ok(x.includes('Du beginnst mit X.'));
  assert.ok(o.includes('Der Roboter beginnt mit X. Du spielst O.'));
});

test('board starts with the accessible 2D grid and offers matrix fullscreen', () => {
  const markup = renderToStaticMarkup(<BoardPanel round={createRound(3)} enabled reducedMotion={false} onMove={() => {}} />);
  assert.equal((markup.match(/role="gridcell"/g) ?? []).length, 9);
  assert.ok(markup.includes('aria-label="Spielfeld im Vollbild öffnen"'));
});
