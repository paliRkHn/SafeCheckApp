import React, { useState, useEffect, useRef } from 'react';
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
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CheckInScreen({ navigation }) {
  // State for screen dimensions (will update on orientation change)
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

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
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (!permission?.granted) {
      Alert.alert('Camera Permission', 'Please grant camera permission to take photos');
      return;
    }
    
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhoto(photo);
        setShowCamera(false);
        console.log(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };


  useEffect(() => {
    requestPermission();
  }, []);
  if (!permission?.granted) return null;

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

    // Get the selected status details for the confirmation
    const selectedStatus = getSelectedStatus();
    const statusEmoji = selectedStatus?.emoji || '❓';
    const statusLabel = selectedStatus?.label || 'Unknown';

    Alert.alert(
      'Confirm Check-In',
      `Are you sure you want to send a "${statusLabel}" check-in?\n\n${statusEmoji} Status: ${statusLabel}\n📍 Location: ${location?.address || 'Not available'}\n📸 Photo: ${photo ? 'Included' : 'None'}\n💬 Message: ${message ? 'Included' : 'None'}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Check-In',
          onPress: () => navigation.navigate('Status', { checkInData }),
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  // Extract current dimensions
  const { width: screenWidth, height: screenHeight } = screenData;
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  
  // Create dynamic styles
  const styles = createStyles(screenWidth, screenHeight, statusBarHeight);

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
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoOverlayText}>📸 Photo captured</Text>
                <Text style={styles.photoOverlaySubtext}>Tap to retake</Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoEmoji}>📷</Text>
              <Text style={styles.photoText}>Take Photo</Text>
              <Text style={styles.photoHint}>Capture a photo for your check-in</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Camera Modal */}
      {showCamera && (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            {/* Camera Header */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Take Photo</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Camera Guidelines */}
            <View style={styles.cameraGuidelines}>
              <View style={styles.guidelineHorizontal} />
              <View style={styles.guidelineVertical} />
            </View>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={takePicture}
              >
                <View style={styles.captureButtonOuter}>
                  <View style={styles.captureButtonInner} />
                </View>
              </TouchableOpacity>

              <View style={styles.controlsSpacer} />
            </View>
          </CameraView>
        </View>
      )}

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

// Function to create styles based on screen dimensions
const createStyles = (screenWidth, screenHeight, statusBarHeight) => StyleSheet.create({
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
    minHeight: Math.max(screenHeight * 0.18, 140),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: Math.max(screenHeight * 0.025, 20),
    paddingHorizontal: Math.max(screenWidth * 0.05, 16),
  },
  photoPreview: {
    position: 'relative',
    width: '100%',
    minHeight: Math.max(screenHeight * 0.25, 200),
  },
  photoEmoji: {
    fontSize: Math.max(Math.min(screenWidth * 0.12, 48), 32),
    marginBottom: Math.max(screenHeight * 0.02, 15),
    opacity: 0.7,
  },
  photoText: {
    fontSize: Math.max(Math.min(screenWidth * 0.045, 18), 14),
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  photoSubtext: {
    fontSize: Math.max(Math.min(screenWidth * 0.035, 14), 11),
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: Math.max(Math.min(screenWidth * 0.05, 20), 16),
  },
  photoHint: {
    fontSize: Math.max(Math.min(screenWidth * 0.032, 13), 10),
    color: '#95a5a6',
    marginTop: Math.max(screenHeight * 0.008, 5),
    fontStyle: 'italic',
    textAlign: 'center',
  },
  photoImage: {
    width: '100%',
    height: Math.max(screenHeight * 0.25, 200),
    borderRadius: 8,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: Math.max(screenHeight * 0.012, 10),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#ffffff',
    fontSize: Math.max(Math.min(screenWidth * 0.04, 16), 12),
    fontWeight: '600',
    textAlign: 'center',
  },
  photoOverlaySubtext: {
    color: '#ffffff',
    fontSize: Math.max(Math.min(screenWidth * 0.03, 12), 10),
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
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
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
    width: screenWidth,
    height: screenHeight,
  },
  camera: {
    width: screenWidth,
    height: screenHeight,
  },
  cameraHeader: {
    position: 'absolute',
    top: statusBarHeight,
    left: 0,
    right: 0,
    width: screenWidth,
    height: screenHeight * 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1002,
  },
  closeButton: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.05,
    fontWeight: 'bold',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: screenWidth * 0.12,
  },
  cameraControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.02,
    left: 0,
    right: 0,
    width: screenWidth,
    height: screenHeight * 0.15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.05,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1002,
  },
  cancelButton: {
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.015,
    borderRadius: screenWidth * 0.08,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    minWidth: screenWidth * 0.22,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: screenWidth * 0.04,
    fontWeight: '600',
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonOuter: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    borderRadius: screenWidth * 0.1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: screenWidth * 0.075,
    backgroundColor: '#fff',
  },
  controlsSpacer: {
    width: screenWidth * 0.22,
  },
  cameraGuidelines: {
    position: 'absolute',
    top: statusBarHeight + (screenHeight * 0.1),
    left: 0,
    right: 0,
    bottom: screenHeight * 0.15 + (Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.02),
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 1001,
  },
  guidelineHorizontal: {
    position: 'absolute',
    left: screenWidth * 0.1,
    right: screenWidth * 0.1,
    width: screenWidth * 0.8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: '33%',
  },
  guidelineVertical: {
    position: 'absolute',
    top: '10%',
    bottom: '10%',
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    left: '50%',
    marginLeft: -0.5,
  },
  photoImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
});
