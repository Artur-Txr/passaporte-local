export type Coordenadas = { latitude: number; longitude: number };
export type MarcadorMapa = Coordenadas & { id: string; titulo: string };

export function coordenadasValidas(valor: unknown): valor is Coordenadas {
  if (!valor || typeof valor !== 'object') return false;
  const { latitude, longitude } = valor as Coordenadas;
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function urlRota(valor: unknown): string | null {
  if (!coordenadasValidas(valor)) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${valor.latitude},${valor.longitude}`)}`;
}

export function htmlMapa(marcadores: MarcadorMapa[], editavel: boolean) {
  const dados = JSON.stringify(marcadores.filter(coordenadasValidas)).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0}body{font-family:sans-serif;background:#E7EEF1}.leaflet-popup-content button{background:#123B4A;color:white;border:0;padding:12px;border-radius:8px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const pontos=${dados};
function enviar(dados){const texto=JSON.stringify(dados);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(texto);else window.parent.postMessage(texto,'*');}
window.addEventListener('error',()=>enviar({tipo:'erro'}));
const map=L.map('map').setView([-14,-52],4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
let escolha;
pontos.forEach(p=>{const marker=L.marker([p.latitude,p.longitude]).addTo(map);const conteudo=document.createElement('div');const titulo=document.createElement('p');titulo.textContent=p.titulo;conteudo.appendChild(titulo);if(!${editavel}){const botao=document.createElement('button');botao.textContent='Ver visita';botao.onclick=()=>enviar({tipo:'visita',id:p.id});conteudo.appendChild(botao);}marker.bindPopup(conteudo);if(${editavel})escolha=marker;});
if(pontos.length)map.fitBounds(pontos.map(p=>[p.latitude,p.longitude]),{padding:[35,35],maxZoom:15});
if(${editavel})map.on('click',e=>{if(escolha)map.removeLayer(escolha);escolha=L.marker(e.latlng).addTo(map);enviar({tipo:'coordenadas',latitude:e.latlng.lat,longitude:e.latlng.lng});});
</script></body></html>`;
}
