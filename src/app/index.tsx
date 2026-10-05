import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Welcome() {
 return <SafeAreaView style={s.screen}>
  <Text style={s.label}>SEU DIÁRIO DE DESCOBERTAS</Text>
  <View style={s.content}>
   <View style={s.stamp}><Text style={s.monogram}>PL</Text></View>
   <Text style={s.title}>Passaporte{'\n'}Local</Text>
   <Text style={s.description}>Explore sua cidade.{'\n'}Guarde suas melhores histórias.</Text>
  <Pressable
  style={s.button}
  onPress={() => router.push('/inicio')}
>
  <Text style={s.buttonText}>Começar minha jornada</Text>
</Pressable>
   <View style={s.card}><Text style={s.cardTitle}>Nossa jornada começa aqui.</Text><Text style={s.cardBody}>Esta é a primeira tela de preparação do aplicativo. Login, visitas e carimbos serão desenvolvidos nas próximas etapas.</Text></View>
  </View>
  <Text style={s.footer}>ARTUR TEIXEIRA · UNIRIOS</Text>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 screen:{flex:1,backgroundColor:'#183F35',paddingHorizontal:28},
 label:{color:'#DBCEAF',fontSize:10,letterSpacing:2,marginTop:28},
 content:{flex:1,justifyContent:'center'},
 stamp:{width:76,height:76,borderRadius:38,borderWidth:2,borderColor:'#DBCEAF',justifyContent:'center',alignItems:'center',marginBottom:28},
 monogram:{color:'#DBCEAF',fontSize:26,fontWeight:'700'},
 title:{color:'#F7F1E5',fontSize:52,fontWeight:'800',letterSpacing:-2,lineHeight:57},
 description:{color:'#DBCEAF',fontSize:22,lineHeight:28,marginTop:20},
 card:{backgroundColor:'#F7F1E5',borderRadius:20,padding:22,marginTop:36},
 cardTitle:{color:'#183F35',fontSize:18,fontWeight:'700',marginBottom:10},
 cardBody:{color:'#53645B',fontSize:14,lineHeight:22},
 footer:{color:'#DBCEAF',fontSize:10,letterSpacing:1.5,paddingBottom:24},

button: {
  backgroundColor: '#C76B48',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 14,
  marginTop: 24,
  alignItems: 'center',
},
buttonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
},
});
