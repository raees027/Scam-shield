import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { scanEntry } from '../../api/scan';

const CHIPS = [
  { label: 'UPI ID', type: 'upi', placeholder: 'e.g. paytm-support@ybl' },
  { label: 'Phone', type: 'phone', placeholder: 'e.g. 9876543210' },
  { label: 'URL', type: 'url', placeholder: 'e.g. pay.fake-site.com' },
];

export default function HomeScreen() {
  const [activeChip, setActiveChip] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleScan() {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await scanEntry(input.trim(), CHIPS[activeChip].type);
      setResult(data);
    } catch (err) {
      Alert.alert('Error', 'Could not reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const resultColor = result ? (Colors as any)[result.riskLevel?.toLowerCase()] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
          <Text style={styles.logoText}>ScamShield</Text>
        </View>
        <Text style={styles.logoSub}>Protect yourself from UPI fraud</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Check before you pay</Text>

          <View style={styles.chipRow}>
            {CHIPS.map((chip, i) => (
              <TouchableOpacity
                key={chip.type}
                style={[styles.chip, activeChip === i && styles.chipActive]}
                onPress={() => { setActiveChip(i); setInput(''); setResult(null); }}
              >
                <Text style={[styles.chipText, activeChip === i && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={CHIPS[activeChip].placeholder}
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleScan}
            />
            <TouchableOpacity
              style={[styles.scanBtn, loading && { opacity: 0.7 }]}
              onPress={handleScan}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="search" size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </View>

        {result && resultColor && (
          <View style={[styles.resultCard, { backgroundColor: resultColor.bg, borderColor: resultColor.border }]}>
            <View style={styles.resultTop}>
              <View style={[styles.badge, { backgroundColor: resultColor.badge }]}>
                <Text style={styles.badgeText}>{result.riskLevel}</Text>
              </View>
              <Text style={[styles.scoreText, { color: resultColor.text }]}>{result.riskScore}/100</Text>
            </View>
            <Text style={[styles.resultValue, { color: resultColor.text }]}>{result.value}</Text>
            <Text style={[styles.resultReason, { color: resultColor.text }]}>{result.reason}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  logoSub: { color: '#B5D4F4', fontSize: 12, marginTop: 2 },
  body: { flex: 1, backgroundColor: Colors.bg, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  searchCard: { backgroundColor: Colors.white, padding: 16, margin: 16, borderRadius: 14 },
  searchLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: '#F5F5F5' },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 12, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryDark, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, height: 42, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: '#F5F5F5', paddingHorizontal: 12, fontSize: 13, color: Colors.textPrimary },
  scanBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  resultCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  resultTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  scoreText: { fontSize: 13, fontWeight: '600' },
  resultValue: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  resultReason: { fontSize: 12, opacity: 0.85 },
});