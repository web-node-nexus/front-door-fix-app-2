import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../config';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import KeyboardTextInput from '../../components/KeyboardTextInput';
import { useFeedback } from '../../context/FeedbackContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const CATEGORIES = ['Booking Issue', 'Payment Problem', 'Service Quality', 'Technician Delay', 'Other'];

export default function RaiseTicketScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding({ extraTop: 8, extraBottom: 32 });
  const { showSuccess, showWarning } = useFeedback();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!subject.trim() || !description.trim()) {
      showWarning('Missing info', 'Please enter subject and description');
      return;
    }
    const id = `TK${Math.floor(100000 + Math.random() * 900000)}`;
    showSuccess(
      'Ticket raised',
      `Your ticket #${id} has been submitted. We will respond within 2 hours.`,
      [
        { label: 'View Tickets', variant: 'primary', onPress: () => nav.navigate('SupportTickets') },
        { label: 'Done', variant: 'ghost', onPress: () => nav.goBack() },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Raise a Ticket</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScroll
        contentContainerStyle={[
          styles.content,
          { paddingTop: pad.paddingTop + 12, paddingBottom: pad.paddingBottom + 140 },
        ]}
        extraScrollOffset={140}
      >
        <Text style={[styles.label, styles.firstLabel]}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)}>
              {category === c ? (
                <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.chipActive}>
                  <Text style={styles.chipTextActive}>{c}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Subject</Text>
        <KeyboardTextInput
          style={styles.input}
          placeholder="Brief description of issue"
          placeholderTextColor={BRAND.light}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Description</Text>
        <KeyboardTextInput
          style={[styles.input, styles.area]}
          placeholder="Describe your issue in detail..."
          placeholderTextColor={BRAND.light}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Pressable onPress={submit}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
            <Ionicons name="ticket-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Submit Ticket</Text>
          </LinearGradient>
        </Pressable>
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: BRAND.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: BRAND.ink,
  },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 20, backgroundColor: BRAND.surface, flexGrow: 1 },
  label: { fontSize: 14, fontWeight: '700', color: BRAND.muted, marginBottom: 8, marginTop: 12 },
  firstLabel: { marginTop: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BRAND.canvas,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  chipActive: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '600', color: BRAND.muted },
  chipTextActive: { fontSize: 12, fontWeight: '700', color: '#fff' },
  input: {
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    fontSize: 15,
  },
  area: { minHeight: 120, textAlignVertical: 'top' },
  btn: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
