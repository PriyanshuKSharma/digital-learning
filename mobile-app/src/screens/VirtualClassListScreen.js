import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const VirtualClassListScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const endpoint = user.role === 'teacher' 
        ? '/virtual-class/teacher/classes'
        : '/virtual-class/student/available';
      
      const response = await apiService.get(endpoint);
      setClasses(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const startClass = async (classId) => {
    try {
      await apiService.patch(`/virtual-class/${classId}/start`);
      navigation.navigate('VirtualClassRoom', { classId });
    } catch (error) {
      Alert.alert('Error', 'Failed to start class');
    }
  };

  const joinClass = async (classId) => {
    try {
      await apiService.post(`/virtual-class/${classId}/join`);
      navigation.navigate('VirtualClassRoom', { classId });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to join class');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#f59e0b';
      case 'live': return '#10b981';
      case 'ended': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const renderClassItem = ({ item }) => (
    <View style={styles.classCard}>
      <View style={styles.classHeader}>
        <Text style={styles.classTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.classSubject}>{item.subject} - Grade {item.grade}</Text>
      <Text style={styles.classTime}>
        {new Date(item.scheduledAt).toLocaleString()}
      </Text>
      <Text style={styles.classDuration}>{item.duration} minutes</Text>

      {item.description && (
        <Text style={styles.classDescription}>{item.description}</Text>
      )}

      <View style={styles.classActions}>
        {user.role === 'teacher' ? (
          <>
            {item.status === 'scheduled' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => startClass(item._id)}
              >
                <Icon name="play-arrow" size={20} color="white" />
                <Text style={styles.actionButtonText}>Start Class</Text>
              </TouchableOpacity>
            )}
            {item.status === 'live' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => navigation.navigate('VirtualClassRoom', { classId: item._id })}
              >
                <Icon name="video-call" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Class</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'ended' || item.status === 'cancelled') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.attendanceButton]}
                onPress={() => navigation.navigate('Attendance', { classId: item._id })}
              >
                <Icon name="group" size={20} color="white" />
                <Text style={styles.actionButtonText}>Attendance</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {item.status === 'live' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={() => joinClass(item._id)}
              >
                <Icon name="video-call" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Live Class</Text>
              </TouchableOpacity>
            )}
            {item.status === 'scheduled' && (
              <View style={[styles.actionButton, styles.scheduledButton]}>
                <Icon name="schedule" size={20} color="#6b7280" />
                <Text style={[styles.actionButtonText, { color: '#6b7280' }]}>Scheduled</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="video-call" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No classes available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  listContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  classSubject: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  classTime: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  classDuration: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  classDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  joinButton: {
    backgroundColor: '#137fec',
  },
  attendanceButton: {
    backgroundColor: '#6b7280',
  },
  scheduledButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
});

export default VirtualClassListScreen;