import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { submitReport } from '../../api/scan';

const TYPES = [
  { label: 'UPI ID', value: 'upi' },
  { label: 'Phone number', value: 'phone' },
  { label: 'Payment link / URL', value: 'url' },
];

export default function ReportScreen() {
  const [type, setType] = useState('upi');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!value.trim()) {
      Alert.alert('Missing info', 'Please enter the UPI ID, phone, or link.');
      return;
    }
    setLoading(true);
    try {
      const res = await submitReport(value.trim(), type, description.trim());
      Alert.alert(
        'Thank you! 🙏',
        `Report submitted. This has now been reported ${res.totalReports} time(s).`
      );
      setValue('');
      setDescription('');
    } catch (err) {
      Alert.alert('Error', 'Could not submit report. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Report a scam</Text>
        <Text style={styles.subtitle}>Help protect others in the community</Text>

        <Text style={styles.label}>What are you reporting?</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, type === t.value && styles.typeChipActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>UPI ID / phone / link</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="e.g. refund-help@ybl"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Describe what happened (optional)</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. They called pretending to be customer support..."
          placeholderTextColor={Colors.textTertiary}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit report</Text>
          }
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Your report is anonymous and helps protect thousands of people
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  body: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontSize: 13, color: Colors.textTertiary, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary, marginBottom: 6, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.white },
  typeChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  typeChipText: { fontSize: 12, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.primaryDark, fontWeight: '600' },
  input: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 0.5, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.textPrimary, marginBottom: 14 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footnote: { fontSize: 11, color: Colors.textTertiary, textAlign: 'center', marginTop: 12 },
});