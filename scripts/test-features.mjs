#!/usr/bin/env node
/**
 * Feature test script for TidePilot
 * Run: node scripts/test-features.mjs
 * Requires: dev server running on http://localhost:3000 (pnpm dev)
 */

const BASE = 'http://localhost:3000';

const ROUTES = [
  { path: '/', name: 'Landing' },
  { path: '/app', name: 'Operator Brief (Home)', content: 'Operator Brief' },
  { path: '/app/studio', name: 'Studio', content: 'Studio' },
  { path: '/app/calendar', name: 'Content Calendar', content: 'Content Calendar' },
  { path: '/app/narrative', name: 'Narrative Engine', content: 'Narrative Engine' },
  { path: '/app/benchmark', name: 'Competitive Benchmark', content: 'Competitive Benchmark' },
  { path: '/app/ideas', name: 'Idea Mining Engine', content: 'Idea Mining' },
  { path: '/app/simulator', name: 'Growth Simulator', content: 'Growth Strategy Simulator' },
  { path: '/app/analytics', name: 'Analytics', content: 'Analytics' },
  { path: '/app/engagement', name: 'Engagement', content: 'Engagement' },
  { path: '/app/voice', name: 'Voice Lab', content: 'Voice' },
  { path: '/app/goals', name: 'Goals', content: 'Goals' },
  { path: '/app/strategy', name: 'Strategy', content: 'Strategy' },
  { path: '/app/settings', name: 'Settings', content: 'Settings' },
];

async function fetchRoute(path, checkContent = null) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: 'follow',
      headers: { 'Accept': 'text/html' },
    });
    const html = res.ok ? await res.text() : '';
    const contentOk = !checkContent || html.includes(checkContent);
    return {
      ok: res.ok && contentOk,
      status: res.status,
      error: !contentOk ? `Missing: "${checkContent}"` : null,
    };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function main() {
  console.log('TidePilot Feature Tests');
  console.log('======================\n');
  console.log(`Base URL: ${BASE}`);
  console.log('Ensure dev server is running: pnpm dev\n');

  let passed = 0;
  let failed = 0;

  for (const { path, name, content } of ROUTES) {
    const result = await fetchRoute(path, content);
    const status = result.ok ? '✓' : '✗';
    const statusCode = result.error || result.status || 'ERR';
    if (result.ok) passed++;
    else failed++;
    console.log(`${status} ${name.padEnd(28)} ${path.padEnd(25)} ${statusCode}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('\nIf routes failed, ensure:');
    console.log('  1. Dev server is running: pnpm dev');
    console.log('  2. Database is set up: pnpm db:push && pnpm db:seed');
    process.exit(1);
  }

  console.log('\nAll feature routes OK.');
}

main();
