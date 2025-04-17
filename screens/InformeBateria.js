import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InformeBateria() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Informe de Batería</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 