import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRound } from './engine';

const ui = await import('./GameUI').catch(() => undefined);
function api() { assert.ok(ui, 'Game controls and accessible board must exist'); return ui; }

test('accessible board exposes each coordinate, animal, and winning cell without WebGL', () => {
  const { AccessibleBoard } = api();
  const round = createRound(5);
  round.board[0] = 'kitten';
  const markup = renderToStaticMarkup(<AccessibleBoard round={round} enabled={false} winning={[0]} onMove={() => {}} />);
  assert.equal((markup.match(/role="gridcell"/g) ?? []).length, 25);
  assert.ok(markup.includes('Zeile 1, Spalte 1: Kätzchen'));
  assert.ok(markup.includes('Zeile 5, Spalte 5: frei'));
  assert.ok(markup.includes('Gewinnfeld'));
  assert.ok(markup.includes('aria-disabled="true"'));
});

test('setup exposes board selection and robot difficulties', () => {
  const { SetupPanel } = api();
  const markup = renderToStaticMarkup(<SetupPanel mode="robot" size={3} difficulty="hard" configured={false} busy={false}
    roomCode="" onRoomCode={() => {}} onMode={() => {}} onSize={() => {}} onDifficulty={() => {}}
    onStart={() => {}} onCreate={() => {}} onJoin={() => {}} />);
  for (const label of ['3×3', '5×5', '10×10', 'Eigene Größe', 'Leicht', 'Mittel', 'Knifflig', 'Los geht']) assert.ok(markup.includes(label));
});

test('unconfigured online mode explains the missing backend and disables room actions', () => {
  const { SetupPanel } = api();
  const markup = renderToStaticMarkup(<SetupPanel mode="online" size={3} difficulty="easy" configured={false} busy={false}
    roomCode="ROOM" onRoomCode={() => {}} onMode={() => {}} onSize={() => {}} onDifficulty={() => {}}
    onStart={() => {}} onCreate={() => {}} onJoin={() => {}} />);
  assert.ok(markup.includes('noch nicht verbunden'));
  assert.ok(markup.includes('Raum erstellen'));
  assert.ok(markup.includes('Raum beitreten'));
  assert.ok((markup.match(/disabled=""/g) ?? []).length >= 3);
});
