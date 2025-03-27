import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ListaScreen() {
  const [denuncias, setDenuncias] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const carregar = async () => {
      const dados = await AsyncStorage.getItem('denuncias');
      if (dados) setDenuncias(JSON.parse(dados));
    };
    carregar();
  }, []);

  const excluirDenuncia = async (index) => {
    const novas = [...denuncias];
    novas.splice(index, 1);
    setDenuncias(novas);
    await AsyncStorage.setItem('denuncias', JSON.stringify(novas));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Denúncias</Text>
      <FlatList
        data={denuncias}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.desc}>{item.descricao}</Text>
            <Button title="Excluir" onPress={() => excluirDenuncia(index)} color="#d33" />
          </View>
        )}
      />
      <Button title="Voltar ao mapa" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  desc: {
    marginBottom: 5,
  },
});
