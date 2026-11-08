import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  normalizeAngleDeg,
  computeWheelItemLayout,
  getActiveWheelIndex,
  getShortestTargetRotation,
  filterProjects,
  evaluateSpring,
  generateGitHubPagesStandaloneHtml,
} from './portfolioLogic.ts';

test('normalizeAngleDeg wraps arbitrary positive and negative angles into [-180, 180)', () => {
  assert.equal(normalizeAngleDeg(0), 0);
  assert.equal(normalizeAngleDeg(360), 0);
  assert.equal(normalizeAngleDeg(-360), 0);
  assert.equal(normalizeAngleDeg(180), -180);
  assert.equal(normalizeAngleDeg(270), -90);
  assert.equal(normalizeAngleDeg(-90), -90);
  assert.equal(normalizeAngleDeg(540), -180);
  assert.equal(normalizeAngleDeg(Number.NaN), 0);
});

test('computeWheelItemLayout places item 0 at the 12 o clock apex (-90 deg) when rotation is 0', () => {
  const layout0 = computeWheelItemLayout(0, 8, 0, 200);
  assert.equal(layout0.x, 0);
  assert.equal(layout0.y, -200);
  assert.equal(layout0.distanceFromApexDeg, 0);
  assert.equal(layout0.isApex, true);
  assert.equal(layout0.scale, 1.04);

  // Opposite item (index 4 out of 8) is at +90 deg (6 o'clock bottom)
  const layout4 = computeWheelItemLayout(4, 8, 0, 200);
  assert.equal(layout4.x, 0);
  assert.equal(layout4.y, 200);
  assert.equal(layout4.distanceFromApexDeg, 180);
  assert.equal(layout4.isApex, false);
  assert.ok(layout4.scale < layout0.scale);
  assert.ok(layout4.opacity < layout0.opacity);
});

test('getActiveWheelIndex and getShortestTargetRotation agree on active orbital item', () => {
  const total = 8;
  for (let targetIdx = 0; targetIdx < total; targetIdx++) {
    const rotation = getShortestTargetRotation(0, targetIdx, total);
    const active = getActiveWheelIndex(total, rotation);
    assert.equal(active, targetIdx);
  }

  // Shortest path from 0 to index 7 (out of 8) should rotate by +45 deg instead of -315 deg
  const shortestToLast = getShortestTargetRotation(0, 7, 8);
  assert.equal(shortestToLast, 45);
  assert.equal(getActiveWheelIndex(8, shortestToLast), 7);
});

test('filterProjects returns all items for Todos and filters accurately by category', () => {
  const all = filterProjects(DEFAULT_PROJECTS, 'Todos');
  assert.equal(all.length, DEFAULT_PROJECTS.length);

  const saasOnly = filterProjects(DEFAULT_PROJECTS, 'SaaS');
  assert.equal(saasOnly.length, 1);
  assert.equal(saasOnly[0].id, 'nexora-dashboard');

  const mobileOnly = filterProjects(DEFAULT_PROJECTS, 'Mobile');
  assert.equal(mobileOnly.length, 1);
  assert.equal(mobileOnly[0].id, 'focus-mobile');
});

test('evaluateSpring starts at 0 and converges to 1 as time progresses', () => {
  assert.equal(evaluateSpring(0, 1.5, 0.2), 0);
  assert.equal(evaluateSpring(-1, 1.5, 0.2), 0);

  const mid = evaluateSpring(0.5, 1.2, 0.25);
  assert.ok(mid > 0.3);

  const settled = evaluateSpring(8, 1.2, 0.2);
  assert.ok(Math.abs(settled - 1) < 0.001);
});

test('generateGitHubPagesStandaloneHtml produces valid HTML containing profile and relative project assets', () => {
  const html = generateGitHubPagesStandaloneHtml(DEFAULT_PROFILE, DEFAULT_PROJECTS);
  assert.ok(html.includes('<!doctype html>'));
  assert.ok(html.includes(DEFAULT_PROFILE.name));
  assert.ok(html.includes(DEFAULT_PROFILE.email));
  assert.ok(html.includes('./work/dashboard.jpg'));
  assert.ok(html.includes('./favicon.svg'));
});
