import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function ReportCard({ item }: { item: any }) {
  const c = (Colors as any)[item.risk_level?.toLowerCase()] || Colors.suspicious;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.id} numberOfLines={1}>{item.value}</Text>
        <View style={[styles.badge, { backgroundColor: c.badge }]}>
          <Text style={styles.badgeText}>{item.risk_level}</Text>
        </View>
      </View>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  id: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  reason: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});