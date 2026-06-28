import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';

export default function HomeScreen() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    axios.get(`${process.env.EXPO_PUBLIC_API_URL}/`)
      .then(res => setStatus(res.data.status))
      .catch(err => setStatus('Could not connect: ' + err.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ScamShield 🛡️</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
});