import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>SafeCheck</Text>
        <Text style={styles.subtitle}>Stay Safe, Stay Connected</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to SafeCheck</Text>
        <Text style={styles.description}>
          Your personal safety companion for emergencies and travel. 
          Quickly check in with your location and status to keep your 
          loved ones informed about your safety.
        </Text>

        <View style={styles.features}>
          <Text style={styles.featureTitle}>Features:</Text>
          <Text style={styles.feature}>📍 Real-time location sharing</Text>
          <Text style={styles.feature}>📸 Photo documentation</Text>
          <Text style={styles.feature}>🚨 Emergency alerts</Text>
          <Text style={styles.feature}>✅ Quick status updates</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.checkInButton}
        onPress={() => navigation.navigate('CheckIn')}
      >
        <Text style={styles.checkInButtonText}>Start Check-In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#5d6d7e',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  features: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  feature: {
    fontSize: 16,
    color: '#5d6d7e',
    marginBottom: 8,
    paddingLeft: 10,
  },
  checkInButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
