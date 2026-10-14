// Executar depois de exportar a versao web. O pacote final nao precisa de npm.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const raiz = path.resolve(__dirname, '..');
const destino = path.resolve(raiz, '../Passaporte-Local-Apresentacao-PC');
const web = path.join(raiz, '.responsive-web');
const licencas = path.resolve(raiz, '../../work/apresentacao-licencas');
if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('Prepare este pacote em Windows x64 com Node oficial.');
if (!fs.existsSync(path.join(web, 'index.html'))) throw new Error('Exporte a versao web primeiro.');
if (!fs.existsSync(path.join(licencas, 'LICENSE-node.txt'))) throw new Error('Prepare a licenca da mesma versao do Node antes de distribuir.');
const manifesto = fs.readFileSync(path.join(licencas, 'SHASUMS256-node.txt'), 'utf8');
const hash = crypto.createHash('sha256').update(fs.readFileSync(process.execPath)).digest('hex');
if (manifesto.split(/\s+/)[0] !== hash) throw new Error('O Node nao corresponde ao manifesto verificado.');
for (const pasta of ['runtime', 'scripts', 'web', 'licencas']) fs.mkdirSync(path.join(destino, pasta), { recursive: true });
fs.cpSync(web, path.join(destino, 'web'), { recursive: true });
fs.copyFileSync(process.execPath, path.join(destino, 'runtime/node.exe'));
for (const arquivo of ['servidor-apresentacao.cjs', 'ip-rede.cjs']) fs.copyFileSync(path.join(raiz, 'scripts', arquivo), path.join(destino, 'scripts', arquivo));
for (const arquivo of ['LICENSE-node.txt', 'SHASUMS256-node.txt']) fs.copyFileSync(path.join(licencas, arquivo), path.join(destino, 'licencas', arquivo));
const avisos = [];
function coletarLicencas(pasta) {
  for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
    const arquivo = path.join(pasta, item.name);
    if (item.isDirectory()) coletarLicencas(arquivo);
    else if (item.isFile() && /^(licen[cs]e)(\.md|\.txt)?$/i.test(item.name)) avisos.push(`\n\n===== ${path.relative(raiz, arquivo)} =====\n${fs.readFileSync(arquivo, 'utf8')}`);
  }
}
coletarLicencas(path.join(raiz, 'node_modules'));
fs.writeFileSync(path.join(destino, 'licencas/DEPENDENCIAS.txt'), 'Avisos das dependencias instaladas na preparacao; nem todas integram o bundle final.\n' + avisos.join(''));
for (const [arquivo, args] of [['Abrir-App.cmd', ''], ['Abrir-App-na-Rede.cmd', ' --rede']]) {
  fs.writeFileSync(path.join(destino, arquivo), `@echo off\r\ncd /d "%~dp0"\r\n"runtime\\node.exe" "scripts\\servidor-apresentacao.cjs"${args}\r\npause\r\n`);
}
fs.copyFileSync(path.join(raiz, 'APRESENTACAO_FACULDADE.md'), path.join(destino, 'LEIA-ME.md'));
console.log('Pacote preparado em ' + destino);
