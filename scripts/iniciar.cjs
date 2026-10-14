const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawnSync } = require('node:child_process');
const { perfilInicializacao, dependenciasPresentes } = require('./inicio-projeto.cjs');
const { encontrarIpLocal } = require('./ip-rede.cjs');
const raiz = path.resolve(__dirname, '..');
process.chdir(raiz);

function falhar(mensagem) { console.error('\n' + mensagem); process.exitCode = 1; }
async function iniciar() {
  if (Number(process.versions.node.split('.')[0]) < 24) return falhar('Instale o Node.js 24 ou superior. Para apresentar sem instalar dependencias, use o pacote Apresentacao-PC.');
  const modo = process.argv[2] || 'pc';
  const perfil = perfilInicializacao(modo, process.env, encontrarIpLocal());
  perfil.env.PATH = path.dirname(process.execPath) + path.delimiter + (perfil.env.PATH || '');
  console.log('\nPASSAPORTE LOCAL - ' + perfil.nome);
  console.log('Pasta: ' + raiz);
  if (!fs.existsSync(path.join(raiz, '.env.local'))) return falhar('Falta o arquivo .env.local. Extraia o ZIP completo do projeto, que inclui a configuracao publica do cliente.');
  if (!dependenciasPresentes(raiz, fs.existsSync)) {
    console.log('\nInstalando as dependencias do projeto. Esta primeira etapa precisa de internet.');
    const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
    if (!fs.existsSync(npmCli)) return falhar('O npm nao foi encontrado. Reinstale Node.js com npm ou use o pacote Apresentacao-PC.');
    const instalacao = spawnSync(process.execPath, [npmCli, 'ci', '--include=dev', '--no-audit', '--no-fund'], { cwd: raiz, env: perfil.env, stdio: 'inherit' });
    if (instalacao.status !== 0 || !dependenciasPresentes(raiz, fs.existsSync)) return falhar('A instalacao nao terminou. Confira a internet e abra este iniciador novamente.');
  }
  const disponivel = await new Promise(resolve => {
    const servidor = net.createServer();
    servidor.once('error', () => resolve(false));
    servidor.listen(perfil.porta, '0.0.0.0', () => servidor.close(() => resolve(true)));
  });
  if (!disponivel) return falhar(`A porta ${perfil.porta} ja esta ocupada ou indisponivel. Feche com Ctrl+C o terminal anterior deste modo e tente novamente. Nenhum processo foi encerrado automaticamente.`);
  if (process.argv.includes('--verificar')) {
    const verificacao = spawnSync(process.execPath, [path.join(raiz, 'node_modules/expo/bin/cli'), '--version'], { cwd: raiz, env: perfil.env, stdio: 'inherit' });
    if (verificacao.status !== 0) return falhar('O arquivo local do Expo nao executou corretamente.');
    console.log(`Verificacao concluida: dependencias presentes, Expo executavel e porta ${perfil.porta} disponivel.`);
    return;
  }
  if (modo === 'wifi') {
    console.log('PC e celular devem usar o mesmo roteador. Escaneie o NOVO QR pelo Expo Go.');
    if (perfil.env.REACT_NATIVE_PACKAGER_HOSTNAME) console.log(`Endereco esperado: exp://${perfil.env.REACT_NATIVE_PACKAGER_HOSTNAME}:${perfil.porta}`);
  }
  if (modo === 'celular') console.log('O tunel depende do servico externo. Se falhar, use Iniciar-Celular-WiFi.cmd.');
  if (modo === 'bluestacks') console.log(`No emulador: exp://10.0.2.2:${perfil.porta}. Este endereco nao serve para celular fisico.`);
  if (modo === 'pc') console.log(`Navegador: http://localhost:${perfil.porta}`);
  console.log('Mantenha este terminal aberto. Para parar, pressione Ctrl+C.\n');
  // Chamar o arquivo real evita depender do atalho node_modules/.bin/expo.cmd.
  const resultado = spawnSync(process.execPath, [path.join(raiz, 'node_modules/expo/bin/cli'), ...perfil.argumentos], { cwd: raiz, env: perfil.env, stdio: 'inherit' });
  if (resultado.error || resultado.status) falhar('O Expo nao iniciou ou foi encerrado com erro. Leia a mensagem acima. Para a apresentacao no PC, use o pacote Apresentacao-PC.');
}
iniciar().catch(erro => falhar(erro.message));
