import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const protocol = source.slice(source.indexOf('const UART_CANDIDATES'), source.indexOf('/* ================= UI wiring'));
function adapter(write) {
  const context = vm.createContext({ TextDecoder, TextEncoder, setTimeout, clearTimeout,
    navigator: {}, state: { mode: null }, setStatus() {}, noteValue() {}, showConnect() {},
    sleep: () => Promise.resolve() });
  vm.runInContext(protocol + ';globalThis.adapter = obd;', context);
  const obd = context.adapter;
  obd.writeChar = { properties: { writeWithoutResponse: true }, writeValueWithoutResponse: write };
  return obd;
}
const packet = (raw) => ({ target: { value: new TextEncoder().encode(raw) } });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fastReply() {
  let obd;
  obd = adapter(async () => obd.onData(packet('410D28\r>')));
  assert.equal(await obd.cmd('010D', 30), '410D28');
}
async function ecuError() {
  const obd = adapter(async () => {});
  const result = obd.cmd('010D', 30);
  await wait(0);
  assert.doesNotThrow(() => obd.onData(packet('NO DATA\r>')));
  await assert.rejects(result, /ECU: NO DATA/);
  assert.equal(obd.busy, false);
}
async function disconnect() {
  const obd = adapter(async () => {});
  const first = assert.rejects(obd.cmd('010D', 30), /disconnected/i);
  const second = assert.rejects(obd.cmd('010C', 30), /disconnected/i);
  await wait(0);
  await obd.disconnect();
  await Promise.all([first, second]);
  assert.equal(obd.pending, null);
  assert.equal(obd.queue.length, 0);
  assert.equal(obd.writeChar, null);
}
async function queuedAfterError() {
  const writes = [];
  const obd = adapter(async (bytes) => writes.push(new TextDecoder().decode(bytes)));
  const first = assert.rejects(obd.cmd('010D', 30), /NO DATA/);
  const second = obd.cmd('010C', 30);
  await wait(0);
  obd.onData(packet('NO DATA\r>'));
  await wait(0);
  obd.onData(packet('410C1000\r>'));
  await first;
  assert.equal(await second, '410C1000');
  assert.deepEqual(writes, ['010D\r', '010C\r']);
}
async function timeoutAndWriteFailure() {
  let writes = 0;
  const obd = adapter(async () => { if (++writes === 2) throw new Error('write failed'); });
  await assert.rejects(obd.cmd('010D', 10), /timeout/);
  await assert.rejects(obd.cmd('010C', 10), /write failed/);
  assert.equal(obd.pending, null);
  assert.equal(obd.busy, false);
}
let failed = 0;
for (const test of [fastReply, ecuError, disconnect, queuedAfterError, timeoutAndWriteFailure]) {
  try { await test(); console.log('PASS', test.name); }
  catch (error) { failed++; console.error('FAIL', test.name, error.message); }
}
if (failed) process.exitCode = 1;
