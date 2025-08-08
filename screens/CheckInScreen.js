import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';
import * as Location from 'expo-location';

export default function CheckInScreen({ navigation }) {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions to use this feature.',
          [{ text: 'OK' }]
        );
        setLocationLoading(false);
        return;
      }

      // Get current position
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates (reverse geocoding)
      let addressArray = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      let address = 'Unknown location';
      if (addressArray.length > 0) {
        const addr = addressArray[0];
        address = `${addr.street || ''} ${addr.name || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.trim();
        // Clean up the address (remove extra commas and spaces)
        address = address.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
      }

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: address,
        accuracy: currentLocation.coords.accuracy,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const takePhoto = () => {
    // Placeholder for camera functionality
    // This will be implemented with expo-camera
    Alert.alert('Camera', 'Camera functionality will be implemented');
    setPhoto('placeholder-photo.jpg');
  };

  const handleSubmit = () => {
    if (!status.trim()) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    const checkInData = {
      status,
      message,
      location,
      photo,
      timestamp: new Date().toISOString(),
    };

    navigation.navigate('Status', { checkInData });
  };

  const statusOptions = [
    { id: 'safe', label: 'Safe', emoji: '✅', color: '#27ae60', description: 'I am safe and secure' },
    { id: 'help', label: 'Needs Help', emoji: '🆘', color: '#e74c3c', description: 'I need assistance' },
    { id: 'emergency', label: 'Emergency', emoji: '🚨', color: '#c0392b', description: 'This is an emergency' },
    { id: 'in-transit', label: 'In Transit', emoji: '✈️', color: '#3498db', description: 'Currently traveling' },
    { id: 'arrived', label: 'Arrived Safely', emoji: '🏁', color: '#9b59b6', description: 'Reached destination safely' },
  ];

  const getSelectedStatus = () => {
    return statusOptions.find(option => option.id === status);
  };

  const handleStatusSelect = (selectedStatus) => {
    setStatus(selectedStatus.id);
    setDropdownOpen(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => dropdownOpen && setDropdownOpen(false)}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Safety Check-In</Text>
          <Text style={styles.subtitle}>Let others know you're safe</Text>
        </View>

      {/* Status Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Status</Text>
        
        {/* Status Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.dropdownButton, dropdownOpen && styles.dropdownButtonOpen]}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <View style={styles.dropdownButtonContent}>
              {status ? (
                <>
                  <Text style={styles.selectedEmoji}>{getSelectedStatus()?.emoji}</Text>
                  <View style={styles.selectedTextContainer}>
                    <Text style={styles.selectedLabel}>{getSelectedStatus()?.label}</Text>
                    <Text style={styles.selectedDescription}>{getSelectedStatus()?.description}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderEmoji}>📋</Text>
                  <Text style={styles.placeholderText}>Select your current status</Text>
                </View>
              )}
              <Text style={[styles.dropdownArrow, dropdownOpen && styles.dropdownArrowOpen]}>▼</Text>
            </View>
          </TouchableOpacity>

          {/* Dropdown Options */}
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {statusOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dropdownOption,
                    index === statusOptions.length - 1 && styles.dropdownOptionLast,
                    status === option.id && styles.dropdownOptionSelected
                  ]}
                  onPress={() => handleStatusSelect(option)}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionLabel,
                      status === option.id && styles.optionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      status === option.id && styles.optionDescriptionSelected
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                  {status === option.id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Location Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationEmoji}>📍</Text>
          <View style={styles.locationInfo}>
            {locationLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#3498db" />
                <Text style={styles.locationText}>Getting your location...</Text>
              </View>
            ) : location ? (
              <>
                <Text style={styles.locationText}>{location.address}</Text>
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
                {location.accuracy && (
                  <Text style={styles.locationAccuracy}>
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.locationText}>Location not available</Text>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, locationLoading && styles.refreshButtonDisabled]}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#7f8c8d" />
            ) : (
              <Text style={styles.refreshButtonText}>🔄</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Photo (Optional)</Text>
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          {photo ? (
            <View style={styles.photoPreview}>
              <Text style={styles.photoText}>📸 Photo captured</Text>
              <Text style={styles.photoSubtext}>Tap to retake</Text>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>📷</Text>
              <Text style={styles.photoText}>Take Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Message Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Message (Optional)</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Add any additional details..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Send Check-In</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  section: {
    margin: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusOption: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  statusEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  // Status Dropdown Styles
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonOpen: {
    borderColor: '#3498db',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  selectedEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedTextContainer: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectedDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 10,
    transform: [{ rotate: '0deg' }],
  },
  dropdownArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#3498db',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionSelected: {
    backgroundColor: '#e8f4fd',
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  optionLabelSelected: {
    color: '#3498db',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 1,
  },
  optionDescriptionSelected: {
    color: '#5dade2',
  },
  checkMark: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  locationCoords: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  refreshButton: {
    padding: 5,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  refreshButtonText: {
    fontSize: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationAccuracy: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
  },
  photoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPreview: {
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    width: '100%',
    borderRadius: 10,
    padding: 20,
  },
  photoEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  photoSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  messageInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});
