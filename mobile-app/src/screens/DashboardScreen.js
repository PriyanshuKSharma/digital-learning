import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    completedAssignments: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load dashboard data based on user role
      if (user?.role === 'student') {
        const response = await apiService.get('/student/dashboard');
        setStats(response.data);
      } else if (user?.role === 'teacher') {
        const response = await apiService.get('/teacher/dashboard');
        setStats(response.data);
      } else if (user?.role === 'admin') {
        const response = await apiService.get('/admin/analytics');
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getQuickActions = () => {
    if (user?.role === 'student') {
      return [
        { title: 'Join Class', icon: 'video-call', color: '#10b981', route: 'VirtualClassList' },
        { title: 'AI Tutor', icon: 'psychology', color: '#8b5cf6', route: 'AITutor' },
        { title: 'Materials', icon: 'library-books', color: '#f59e0b', route: 'Materials' },
        { title: 'Code Editor', icon: 'code', color: '#ef4444', route: 'CodeEditor' },
      ];
    } else if (user?.role === 'teacher') {
      return [
        { title: 'My Classes', icon: 'video-call', color: '#10b981', route: 'VirtualClassList' },
        { title: 'Create Quiz', icon: 'quiz', color: '#8b5cf6', route: 'CreateQuiz' },
        { title: 'Students', icon: 'people', color: '#f59e0b', route: 'Students' },
        { title: 'Analytics', icon: 'analytics', color: '#ef4444', route: 'Analytics' },
      ];
    } else {
      return [
        { title: 'Teachers', icon: 'people', color: '#10b981', route: 'Teachers' },
        { title: 'Students', icon: 'school', color: '#8b5cf6', route: 'Students' },
        { title: 'Analytics', icon: 'analytics', color: '#f59e0b', route: 'Analytics' },
        { title: 'Reports', icon: 'assessment', color: '#ef4444', route: 'Reports' },
      ];
    }
  };

  const getStatsCards = () => {
    if (user?.role === 'student') {
      return [
        { title: 'Total Classes', value: stats.totalClasses || 0, icon: 'video-call', color: '#3b82f6' },
        { title: 'Upcoming', value: stats.upcomingClasses || 0, icon: 'schedule', color: '#10b981' },
        { title: 'Assignments', value: stats.completedAssignments || 0, icon: 'assignment', color: '#f59e0b' },
        { title: 'Progress', value: '85%', icon: 'trending-up', color: '#8b5cf6' },
      ];
    } else if (user?.role === 'teacher') {
      return [
        { title: 'My Classes', value: stats.totalClasses || 0, icon: 'video-call', color: '#3b82f6' },
        { title: 'Students', value: stats.totalStudents || 0, icon: 'people', color: '#10b981' },
        { title: 'Quizzes', value: stats.totalQuizzes || 0, icon: 'quiz', color: '#f59e0b' },
        { title: 'Attendance', value: '92%', icon: 'how-to-reg', color: '#8b5cf6' },
      ];
    } else {
      return [
        { title: 'Total Users', value: stats.totalUsers || 0, icon: 'people', color: '#3b82f6' },
        { title: 'Teachers', value: stats.totalTeachers || 0, icon: 'person', color: '#10b981' },
        { title: 'Students', value: stats.totalStudents || 0, icon: 'school', color: '#f59e0b' },
        { title: 'Classes', value: stats.totalClasses || 0, icon: 'video-call', color: '#8b5cf6' },
      ];
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || user?.username}</Text>
          <Text style={styles.userRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="account-circle" size={40} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {getStatsCards().map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Icon name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {getQuickActions().map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <Icon name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="video-call" size={20} color="#10b981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Mathematics Class</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="assignment" size={20} color="#f59e0b" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Assignment Submitted</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Icon name="quiz" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Quiz Completed</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DashboardScreen;