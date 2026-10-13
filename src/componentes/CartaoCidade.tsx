import useLayoutResponsivo from "./useLayoutResponsivo";
import { Image, StyleSheet, Text, View } from 'react-native';
import Icone from './Icone';
import { identidadeCarimbo } from '../lib/carimbosUF';

export default function CartaoCidade({ nome, indice }: { nome: string; indice: number }) {
  const { compacto } = useLayoutResponsivo();
  const cor = indice % 2 ? '#BD6940' : '#6D8067';
  const identidade = identidadeCarimbo(nome.split('·').at(-1) ?? '');
  const chave = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const arte = chave.startsWith('foz do iguacu') ? require('../../assets/cidades/foz.png')
    : chave.startsWith('fernando de noronha') ? require('../../assets/cidades/noronha.png')
    : chave.startsWith('barreirinhas') ? require('../../assets/cidades/barreirinhas.png') : null;
  return <View style={[styles.cartao, { width: compacto ? "100%" : "48%", transform: [{ rotate: indice % 2 ? '2deg' : '-2deg' }] }]}>
    <Image source={require('../../assets/prototipo/papel.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
    <View style={[styles.ilustracao, { borderColor: cor }]}>
      <View style={styles.paisagem}>
        {arte ? <Image source={arte} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : (
        <View style={{ width: 104, height: 57, transform: [{ scale: 1.1 }] }}>
          {identidade.desenho.map(([x,y,w,h,tipo,rotacao = 0],i) => <View key={i} style={tipo === 'montanha' ? {
            position:'absolute',left:x,top:y,width:0,height:0,borderLeftWidth:w/2,borderRightWidth:w/2,borderBottomWidth:h,borderLeftColor:'transparent',borderRightColor:'transparent',borderBottomColor:cor,
          } : {position:'absolute',left:x,top:y,width:w,height:h,backgroundColor:cor,borderRadius:tipo === 'oval' ? Math.max(w,h)/2 : 0,transform:[{rotate:`${rotacao}deg`}]}} />)}
        </View>)}
      </View>
      <View style={[styles.voo,{borderColor:cor}]}><Icone nome="aviao" tamanho={19} cor={cor}/></View>
    </View>
    <View style={styles.ondas}><Text style={{color:cor,fontSize:21,lineHeight:15}}>∿∿∿</Text><Text style={{color:cor,fontSize:21,lineHeight:15}}>∿∿∿</Text><Text style={{color:cor,fontSize:21,lineHeight:15}}>∿∿∿</Text></View>
    <Text style={styles.nome}>{nome}</Text>
    <View style={[styles.carimbo,{borderColor:cor}]}><Text style={{fontSize:6,color:cor,fontWeight:'700'}}>VISITADO</Text><Icone nome="lugar" tamanho={15} cor={cor}/></View>
  </View>;
}
const styles = StyleSheet.create({
 cartao:{width:'48%',minHeight:144,padding:12,borderRadius:4,borderWidth:1,borderColor:'#DDD3BD',backgroundColor:'#F1E8D5',overflow:'hidden'},
 ilustracao:{width:'85%',height:83,borderWidth:1,borderStyle:'dashed',padding:4,backgroundColor:'#F7F2E5'},
 paisagem:{flex:1,overflow:'hidden',justifyContent:'center',alignItems:'center'},
 predio:{position:'absolute',bottom:8,paddingTop:4,gap:4},
 janelas:{flexDirection:'row',justifyContent:'space-evenly'},janela:{width:2,height:3,backgroundColor:'#F7F2E5'},
 colina:{position:'absolute',bottom:-17,left:65,width:90,height:48,borderRadius:50,transform:[{rotate:'-14deg'}]},
 sol:{position:'absolute',right:9,top:3,width:18,height:18,borderWidth:1,borderRadius:9},
 voo:{position:'absolute',right:-15,top:-8,width:35,height:35,borderRadius:18,borderWidth:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F4EDDE',transform:[{rotate:'-18deg'}]},
 ondas:{position:'absolute',right:-2,top:49,opacity:0.55},
 nome:{color:'#123E34',fontSize:12,lineHeight:16,fontWeight:'600',marginTop:10,paddingRight:24},
 carimbo:{position:'absolute',right:5,bottom:9,width:38,height:38,borderRadius:19,borderWidth:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F5EFDF',transform:[{rotate:'-18deg'}]},
});

