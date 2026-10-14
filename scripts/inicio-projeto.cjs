const path = require('node:path');

const modos = {
  wifi: { porta: 8084, argumentos: ['--go', '--lan'], nome: 'Celular na mesma rede Wi-Fi' },
  celular: { porta: 8083, argumentos: ['--go', '--tunnel'], nome: 'Celular por tunel de internet' },
  pc: { porta: 8082, argumentos: ['--web', '--localhost'], nome: 'Navegador deste computador' },
  bluestacks: { porta: 8081, argumentos: ['--go', '--lan'], nome: 'BlueStacks' },
};

function perfilInicializacao(modo, ambiente = process.env, ip = '') {
  const perfil = modos[modo];
  if (!perfil) throw new Error('Escolha pc, wifi, celular ou bluestacks.');
  const env = { ...ambiente, EXPO_OFFLINE: 'false', REACT_NATIVE_PACKAGER_HOSTNAME: '', EXPO_PACKAGER_PROXY_URL: '' };
  if (modo === 'bluestacks') env.REACT_NATIVE_PACKAGER_HOSTNAME = '10.0.2.2';
  if (modo === 'wifi' && ip) env.REACT_NATIVE_PACKAGER_HOSTNAME = ip;
  return { ...perfil, env, argumentos: ['start', ...perfil.argumentos, '--port', String(perfil.porta)] };
}

function dependenciasPresentes(raiz, existe) {
  return ['expo/bin/cli', 'expo-router/package.json', 'react/package.json', 'react-native/package.json', '@supabase/supabase-js/package.json']
    .every(arquivo => existe(path.join(raiz, 'node_modules', arquivo)));
}

module.exports = { perfilInicializacao, dependenciasPresentes };
