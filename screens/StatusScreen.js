import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Share
} from 'react-native';

export default function StatusScreen({ route, navigation }) {
  const { checkInData } = route.params;

  const getStatusConfig = (status) => {
    const configs = {
      safe: { color: '#27ae60', emoji: '✅', label: 'Safe' },
      help: { color: '#e74c3c', emoji: '🆘', label: 'Need Help' },
      emergency: { color: '#c0392b', emoji: '🚨', label: 'Emergency' },
      traveling: { color: '#3498db', emoji: '✈️', label: 'Traveling' },
    };
    return configs[status] || configs.safe;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const shareCheckIn = async () => {
    const statusConfig = getStatusConfig(checkInData.status);
    const shareMessage = `SafeCheck Update: ${statusConfig.emoji} ${statusConfig.label}
    
Location: ${checkInData.location?.address || 'Unknown'}
Time: ${formatTimestamp(checkInData.timestamp)}
${checkInData.message ? `\nMessage: ${checkInData.message}` : ''}

Sent via SafeCheck App`;

    try {
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const statusConfig = getStatusConfig(checkInData.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.statusIcon, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusEmoji}>{statusConfig.emoji}</Text>
        </View>
        <Text style={styles.title}>Check-In Sent!</Text>
        <Text style={styles.subtitle}>Your safety status has been recorded</Text>
      </View>

      <View style={styles.content}>
        {/* Status Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Status Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {statusConfig.emoji} {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>
              {formatTimestamp(checkInData.timestamp)}
            </Text>
          </View>

          {checkInData.location && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Location:</Text>
              <Text style={styles.summaryValue}>
                {checkInData.location.address}
              </Text>
            </View>
          )}

          {checkInData.location && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Coordinates:</Text>
              <Text style={styles.summaryValue}>
                {checkInData.location.latitude.toFixed(4)}, {checkInData.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {checkInData.photo && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Photo:</Text>
              <Text style={styles.summaryValue}>📸 Attached</Text>
            </View>
          )}

          {checkInData.message && (
            <View style={styles.messageSection}>
              <Text style={styles.summaryLabel}>Message:</Text>
              <Text style={styles.messageText}>{checkInData.message}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareCheckIn}
          >
            <Text style={styles.shareButtonText}>📤 Share Status</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.newCheckInButton}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Text style={styles.newCheckInButtonText}>New Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Safety Tips</Text>
          <Text style={styles.tipsText}>
            • Keep your emergency contacts updated{'\n'}
            • Share your location with trusted contacts when traveling{'\n'}
            • Regular check-ins help others know you're safe{'\n'}
            • In real emergencies, always call local emergency services first
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    flex: 2,
    alignItems: 'flex-end',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  messageSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  messageText: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  newCheckInButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  newCheckInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
