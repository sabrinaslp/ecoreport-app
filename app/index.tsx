// index.tsx (Tela do Mapa)
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Index() {
  const [location, setLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [dadosCarregados, setDadosCarregados] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!dadosCarregados) return;

    const salvarDados = async () => {
      try {
        await AsyncStorage.setItem('denuncias', JSON.stringify(markers));
        console.log('Denúncias salvas:', markers);
      } catch (error) {
        console.error('Erro ao salvar denúncias:', error);
      }
    };

    salvarDados();
  }, [markers, dadosCarregados]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dadosSalvos = await AsyncStorage.getItem('denuncias');
        if (dadosSalvos) {
          const parsed = JSON.parse(dadosSalvos);
          setMarkers(parsed);
          console.log('Denúncias carregadas:', parsed);
        }
      } catch (error) {
        console.error('Erro ao carregar denúncias:', error);
      } finally {
        setDadosCarregados(true);
      }
    };

    carregarDados();
  }, []);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setNewMarkerCoords({ latitude, longitude });
    setDescricao('');
    setModalVisible(true);
  };

  const salvarDenuncia = () => {
    if (descricao && newMarkerCoords) {
      setMarkers((prev) => [
        ...prev,
        {
          latitude: newMarkerCoords.latitude,
          longitude: newMarkerCoords.longitude,
          descricao,
        },
      ]);
      setModalVisible(false);
      setDescricao('');
      setNewMarkerCoords(null);
    }
  };

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text>Carregando localização...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova denúncia</Text>
            <TextInput
              style={styles.input}
              placeholder="Descreva o descarte irregular..."
              value={descricao}
              onChangeText={setDescricao}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#aaa" />
              <Button title="Salvar" onPress={salvarDenuncia} />
            </View>
          </View>
        </View>
      </Modal>
  
      {/* Mapa */}
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Você está aqui"
            pinColor="blue"
          />
  
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={`Denúncia ${index + 1}`}
              description={marker.descricao}
            />
          ))}
        </MapView>
      </View>
  
      {/* Botão abaixo do mapa */}
      <View style={{ padding: 10 }}>
        <Button title="Ver lista de denúncias" onPress={() => router.push('/lista')} />
      </View>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
