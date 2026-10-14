import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { perfilInicializacao, dependenciasPresentes } = require('../scripts/inicio-projeto.cjs');
const { encontrarIpLocal } = require('../scripts/ip-rede.cjs');
const { criarServidor } = require('../scripts/servidor-apresentacao.cjs');

test('celular e PC nao herdam o endereco exclusivo do BlueStacks ou um proxy antigo', () => {
  const antigo = { REACT_NATIVE_PACKAGER_HOSTNAME: '10.0.2.2', EXPO_PACKAGER_PROXY_URL: 'http://antigo', EXPO_OFFLINE: '1' };
  assert.equal(perfilInicializacao('wifi', antigo, '192.168.1.9').env.REACT_NATIVE_PACKAGER_HOSTNAME, '192.168.1.9');
  assert.equal(perfilInicializacao('celular', antigo).env.REACT_NATIVE_PACKAGER_HOSTNAME, '');
  assert.equal(perfilInicializacao('pc', antigo).env.EXPO_PACKAGER_PROXY_URL, '');
  assert.equal(perfilInicializacao('pc', antigo).env.EXPO_OFFLINE, 'false');
  assert.equal(perfilInicializacao('bluestacks', antigo).porta, 8081);
  assert.throws(() => perfilInicializacao('desconhecido'));
});

test('detecta dependencia ausente mesmo com atalho .bin presente', () => {
  assert.equal(dependenciasPresentes('/projeto', () => true), true);
  assert.equal(dependenciasPresentes('/projeto', p => !p.includes('expo-router')), false);
});

test('escolhe rede fisica e ignora WARP, rede virtual e endereco interno', () => {
  const placa = address => [{ family: 'IPv4', internal: false, netmask: '255.255.255.0', address }];
  assert.equal(encontrarIpLocal({ CloudflareWARP: placa('172.16.0.2'), 'vEthernet': placa('172.20.0.1'), Ethernet: placa('192.168.1.101') }), '192.168.1.101');
  assert.equal(encontrarIpLocal({}), '');
});

test('apresentacao serve pagina, rota direta e scripts sem npm, e bloqueia arquivos privados', async () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'passaporte-apresentacao-'));
  fs.writeFileSync(path.join(pasta, 'index.html'), '<html>Passaporte Local</html>');
  fs.writeFileSync(path.join(pasta, 'app.js'), 'console.log("app");');
  fs.writeFileSync(path.join(pasta, '.env.local'), 'nao expor');
  const servidor = criarServidor(pasta);
  await new Promise(resolve => servidor.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  try {
    assert.match(await (await fetch(url + '/')).text(), /Passaporte Local/);
    assert.equal((await fetch(url + '/inicio')).status, 200);
    assert.match((await fetch(url + '/app.js')).headers.get('content-type'), /javascript/);
    assert.equal((await fetch(url + '/.env.local')).status, 403);
    assert.equal((await fetch(url + '/inexistente.png')).status, 404);
    assert.equal((await fetch(url + '/app.js', { method: 'POST' })).status, 405);
  } finally {
    servidor.closeAllConnections();
    await new Promise(resolve => servidor.close(resolve));
    const destino = path.resolve(pasta);
    assert.equal(path.dirname(destino), path.resolve(os.tmpdir()));
    assert.ok(path.basename(destino).startsWith('passaporte-apresentacao-'));
    fs.rmSync(destino, { recursive: true });
  }
});
