const { networkInterfaces } = require('node:os');
function encontrarIpLocal(redes = networkInterfaces()) {
const interfaces = Object.entries(redes)
  .filter(([nome]) => !/warp|loopback|virtual|vethernet|docker|tailscale|bluetooth|vmware|vpn/i.test(nome))
  .flatMap(([, valores]) => valores ?? [])
  .filter(item => item.family === 'IPv4' && !item.internal && item.netmask !== '255.255.255.255' && !item.address.startsWith('169.254.'));
const local = interfaces.find(item => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(item.address));
return local?.address || '';
}
if (require.main === module) process.stdout.write(encontrarIpLocal());
module.exports = { encontrarIpLocal };
