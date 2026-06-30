import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getStats } from '../../api/scan';

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.log('Stats error', err);
    }
  }

  useEffect(() => { loadStats(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Community stats</Text>
        <Text style={styles.subtitle}>Live numbers from ScamShield's database</Text>

        <View style={styles.grid}>
          <StatCard icon="shield-outline" num={stats?.totalScamsBlocked ?? '—'} label="Scams blocked" color={Colors.scam.badge} />
          <StatCard icon="warning-outline" num={stats?.totalSuspicious ?? '—'} label="Suspicious flagged" color={Colors.suspicious.badge} />
          <StatCard icon="people-outline" num={stats?.totalUserReports ?? '—'} label="User reports" color={Colors.primary} />
          <StatCard icon="checkmark-circle-outline" num="98%" label="Detection accuracy" color={Colors.safe.badge} />
        </View>

        <Text style={styles.sectionTitle}>Latest activity</Text>
        {stats?.recentActivity?.length === 0 || !stats?.recentActivity ? (
          <Text style={{ color: Colors.textTertiary, fontSize: 12 }}>No activity yet.</Text>
        ) : (
          stats.recentActivity.map((item: any, i: number) => (
            <View key={i} style={styles.activityRow}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.textTertiary} />
              <Text style={styles.activityText} numberOfLines={1}>{item.value}</Text>
              <Text style={styles.activityTime}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, num, label, color }: any) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 13, color: Colors.textTertiary, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: Colors.white, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: Colors.border },
  statNum: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  statLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 0.5, borderColor: Colors.border },
  activityText: { flex: 1, fontSize: 12, color: Colors.textPrimary },
  activityTime: { fontSize: 10, color: Colors.textTertiary },
});