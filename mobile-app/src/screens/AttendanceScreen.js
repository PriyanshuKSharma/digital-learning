import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiService } from '../services/apiService';

const AttendanceScreen = ({ route, navigation }) => {
  const { classId } = route.params;
  const [attendance, setAttendance] = useState([]);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchClassData();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await apiService.get(`/virtual-class/${classId}/attendance`);
      setAttendance(response.data.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchClassData = async () => {
    try {
      const response = await apiService.get(`/virtual-class/${classId}`);
      setClassData(response.data.data);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const markAttendance = async (studentId, isPresent) => {
    try {
      await apiService.patch(`/virtual-class/${classId}/attendance/mark`, {
        studentId,
        isPresent,
      });
      fetchAttendance();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const formatDuration = (joinedAt, leftAt) => {
    if (!joinedAt) return 'N/A';
    
    const start = new Date(joinedAt);
    const end = leftAt ? new Date(leftAt) : new Date();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return `${minutes} min`;
  };

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <View style={styles.studentInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.student?.fullName?.charAt(0) || 'S'}
          </Text>
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.student?.fullName}</Text>
          <Text style={styles.studentEmail}>{item.student?.email}</Text>
          <Text style={styles.duration}>
            Duration: {formatDuration(item.joinedAt, item.leftAt)}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceStatus}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isPresent ? '#10b981' : '#ef4444' }
        ]}>
          <Text style={styles.statusText}>
            {item.isPresent ? 'Present' : 'Absent'}
          </Text>
        </View>

        <View style={styles.attendanceActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.presentButton]}
            onPress={() => markAttendance(item.student._id, true)}
          >
            <Icon name="check" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.absentButton]}
            onPress={() => markAttendance(item.student._id, false)}
          >
            <Icon name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const presentCount = attendance.filter(a => a.isPresent).length;
  const absentCount = attendance.filter(a => !a.isPresent).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Attendance</Text>
          {classData && (
            <Text style={styles.headerSubtitle}>{classData.title}</Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{attendance.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={attendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.student._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="group" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No attendance records</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  attendanceItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#137fec',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  duration: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  attendanceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  presentButton: {
    backgroundColor: '#10b981',
  },
  absentButton: {
    backgroundColor: '#ef4444',
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

export default AttendanceScreen;