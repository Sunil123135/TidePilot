const BASE = 'http://localhost:3000';
const routes = [
  { path: '/app/narrative', name: 'Narrative Engine', expect: ['Narrative Engine'] },
  { path: '/app/ideas', name: 'Idea Mining Engine', expect: ['Idea Mining Engine'] },
  { path: '/app/simulator', name: 'Growth Simulator', expect: ['Growth Strategy Simulator'] },
];

async function test() {
  console.log('Testing Narrative, Ideas, Simulator\n');
  let passed = 0;
  for (const r of routes) {
    try {
      const res = await fetch(BASE + r.path);
      const html = await res.text();
      const contentOk = r.expect.every((s) => html.includes(s));
      const ok = res.ok && contentOk;
      if (ok) passed++;
      console.log((ok ? '✓' : '✗') + ' ' + r.name + ' - ' + res.status + (contentOk ? '' : ' (missing content)'));
    } catch (e) {
      console.log('✗ ' + r.name + ' - ' + e.message);
    }
  }
  console.log('\n' + passed + '/' + routes.length + ' passed');
  process.exit(passed === routes.length ? 0 : 1);
}
test();
