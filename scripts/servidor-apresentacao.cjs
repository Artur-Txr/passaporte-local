const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { encontrarIpLocal } = require('./ip-rede.cjs');

const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };

function criarServidor(raiz) {
  raiz = path.resolve(raiz);
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    let nome;
    try { nome = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400); return res.end(); }
    if (nome.includes('\0') || nome.includes('\\') || nome.includes(':') || nome.split('/').some(p => p.startsWith('.'))) {
      res.writeHead(403); return res.end();
    }
    let arquivo = path.resolve(raiz, '.' + nome);
    if (!arquivo.startsWith(raiz + path.sep) && arquivo !== raiz) { res.writeHead(403); return res.end(); }
    try {
      if (fs.statSync(arquivo).isDirectory()) arquivo = path.join(arquivo, 'index.html');
    } catch {
      if (!path.extname(nome)) arquivo = path.join(raiz, 'index.html');
    }
    fs.stat(arquivo, (erro, info) => {
      if (erro || !info.isFile()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(arquivo).on('error', () => res.destroy()).pipe(res);
    });
  });
}

if (require.main === module) {
  const raiz = path.resolve(__dirname, '../web');
  if (!fs.existsSync(path.join(raiz, 'index.html'))) {
    console.error('Falta a pasta web. Extraia o pacote Apresentacao-PC completo antes de executar.');
    process.exitCode = 1;
  } else {
    const rede = process.argv.includes('--rede');
    const porta = 8090;
    const servidor = criarServidor(raiz);
    servidor.on('error', erro => {
      console.error(erro.code === 'EADDRINUSE' ? 'A porta 8090 ja esta em uso. Feche a apresentacao anterior com Ctrl+C e tente novamente.' : `Nao foi possivel iniciar: ${erro.message}`);
      process.exitCode = 1;
    });
    servidor.listen(porta, rede ? '0.0.0.0' : '127.0.0.1', () => {
      console.log('\nPASSAPORTE LOCAL - APRESENTACAO\n');
      console.log(`Abra no navegador: http://localhost:${porta}`);
      console.log('Nao precisa de Expo, npm ou VS Code. Login, visitas e fotos precisam de internet.');
      console.log('Mantenha esta janela aberta. Para encerrar, pressione Ctrl+C.');
      if (rede) {
        const ip = encontrarIpLocal();
        if (ip) console.log(`Celular no mesmo roteador, pelo navegador: http://${ip}:${porta}`);
        console.log('A rede/firewall precisa permitir a conexao. Para testar camera nativa no celular, use Expo Go.');
      }
      if (process.platform === 'win32' && !process.argv.includes('--nao-abrir')) {
        spawn('cmd.exe', ['/d', '/c', 'start', '', `http://localhost:${porta}`], { windowsHide: true, stdio: 'ignore' }).on('error', () => {});
      }
    });
  }
}
module.exports = { criarServidor };
