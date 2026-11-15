import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CampoTexto from "../componentes/CampoTexto";
import { Cabecalho, visual } from "../componentes/Design";
import Text from "../componentes/Texto";
import useProtegerFormulario from "../componentes/useProtegerFormulario";
import { useAutenticacao } from "../contextos/AutenticacaoContext";
import { supabase } from "../lib/supabase";
import Avatar from '../componentes/Avatar';
import SeletorFoto from '../componentes/SeletorFoto';
import { obterPerfilPublico } from '../servicos/comunidadeService';
import { enviarAvatar, salvarAvatar } from '../servicos/perfilService';
import { useFeedback } from '../contextos/FeedbackContext';
import type { FotoSelecionada } from '../servicos/selecaoFotoService';

export default function EditarPerfil() {
  const { sessao, carregando } = useAutenticacao();
  if (carregando) return null;
  if (!sessao) return <Redirect href="/login" />;
  const nome = sessao.user.user_metadata.nome;
  return <FormularioPerfil key={sessao.user.id} usuarioId={sessao.user.id} nomeInicial={typeof nome === "string" ? nome : ""} emailInicial={sessao.user.email ?? ""} />;
}

function FormularioPerfil({ usuarioId, nomeInicial, emailInicial }: { usuarioId: string; nomeInicial: string; emailInicial: string }) {
  const avisar = useFeedback();
  const [avatarInicial, setAvatarInicial] = useState<string | null>(null);
  const [foto, setFoto] = useState<FotoSelecionada | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [perfilPronto, setPerfilPronto] = useState(false);
  const [selecionando, setSelecionando] = useState(false);
  const [tentativa, tentar] = useState(0);
  const fotoEnviada = useRef<{ foto: FotoSelecionada; caminho: string } | null>(null);
  const [nome, setNome] = useState(nomeInicial);
  const [email, setEmail] = useState(emailInicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true;
    obterPerfilPublico(usuarioId).then(perfil => { if (ativo) { setAvatarInicial(perfil.avatar_path); setPerfilPronto(true); setErro(''); } })
      .catch(() => { if (ativo) setErro('Não foi possível carregar a foto do perfil. Toque em Tentar novamente.'); });
    return () => { ativo = false; };
  }, [usuarioId, tentativa]);
  const enviando = useRef(false);
  const novoNome = nome.trim();
  const novoEmail = email.trim();
  const mudouEmail = novoEmail.toLowerCase() !== emailInicial.toLowerCase();
  const alterado = novoNome !== nomeInicial || mudouEmail || !!foto || removerFoto;
  const bloqueado = salvando || selecionando || !perfilPronto;
  const concluir = useProtegerFormulario(alterado, salvando || selecionando);

  async function salvar() {
    if (!alterado || bloqueado || enviando.current) return;
    if (!novoNome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
      setErro("Informe seu nome e um e-mail válido.");
      return;
    }
    enviando.current = true;
    setSalvando(true);
    setErro("");
    try {
      let caminho = removerFoto ? null : avatarInicial;
      if (foto) {
        caminho = fotoEnviada.current?.foto === foto ? fotoEnviada.current.caminho : await enviarAvatar(usuarioId, foto);
        fotoEnviada.current = { foto, caminho };
      }
      if (foto || removerFoto) await salvarAvatar(usuarioId, caminho);
      let pendente = false;
      if (novoNome !== nomeInicial || mudouEmail) {
        const { data, error } = await supabase.auth.updateUser({
          ...(novoNome !== nomeInicial ? { data: { nome: novoNome } } : {}),
          ...(mudouEmail ? { email: novoEmail } : {}),
        });
        if (error) throw error;
        pendente = mudouEmail && data.user.email?.toLowerCase() !== novoEmail.toLowerCase();
      }
      avisar(pendente ? 'Perfil atualizado. Confira seu e-mail para confirmar a alteração.' : 'Perfil atualizado.');
      concluir(() => router.dismissTo({ pathname: "/perfil", params: { emailPendente: pendente ? "1" : "0" } }));
    } catch {
      setErro("Não foi possível salvar o perfil. Confira os dados e tente novamente.");
    } finally {
      enviando.current = false;
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={visual.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={visual.content} keyboardShouldPersistTaps="handled">
          <Cabecalho titulo="Editar perfil" voltar />
          <Text accessibilityRole="header" style={visual.title}>Seu nome, sua coleção.</Text>
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            {foto ? <Image source={{ uri: foto.uri }} style={{ width: 80, height: 80, borderRadius: 40 }} /> : <Avatar nome={nome} caminho={removerFoto ? null : avatarInicial} tamanho={80} />}
          </View>
          <SeletorFoto foto={null} fotoAtual={!!avatarInicial || !!foto} desabilitado={bloqueado} onSelecionandoChange={setSelecionando}
            onChange={escolhida => { if (escolhida) { setFoto(escolhida); setRemoverFoto(false); } }} />
          {!!(avatarInicial || foto) && <Pressable accessibilityRole="button" disabled={bloqueado} onPress={() => { setFoto(null); setRemoverFoto(!!avatarInicial); }} style={{ paddingVertical: 12 }}><Text style={visual.link}>Remover foto de perfil</Text></Pressable>}
          {!perfilPronto && !!erro && <Pressable accessibilityRole="button" onPress={() => tentar(valor => valor + 1)} style={{ paddingVertical: 12 }}><Text style={visual.link}>Tentar novamente</Text></Pressable>}
          <View style={{ gap: 10, marginTop: 20 }}>
            <Text style={visual.section}>Nome</Text>
            <CampoTexto icone="perfil" accessibilityLabel="Nome" value={nome} onChangeText={setNome} maxLength={80} editable={!bloqueado} />
            <Text style={visual.section}>E-mail</Text>
            <CampoTexto icone="email" accessibilityLabel="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!bloqueado} />
            {mudouEmail && <Text style={visual.subtitle}>A mudança de e-mail pode exigir confirmação.</Text>}
            {!!erro && <Text accessibilityRole="alert" style={visual.subtitle}>{erro}</Text>}
          </View>
        </ScrollView>
        <View style={{ width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 22, paddingBottom: 8 }}>
          <Pressable accessibilityRole="button" disabled={!alterado || bloqueado} onPress={salvar}
            style={[visual.button, (!alterado || bloqueado) && { opacity: 0.5 }]}>
            <Text style={visual.buttonText}>{salvando ? "Salvando…" : "Salvar perfil"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
