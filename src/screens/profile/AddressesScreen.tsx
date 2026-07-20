import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import KeyboardTextInput from '../../components/KeyboardTextInput';
import { useFeedback } from '../../context/FeedbackContext';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function AddressesScreen() {
  const pad = useScreenPadding();
  const { addresses, addAddress } = useProfile();
  const { showSuccess, showWarning } = useFeedback();
  const [label, setLabel] = useState('');
  const [line, setLine] = useState('');

  const handleAdd = () => {
    if (!label.trim() || !line.trim()) {
      showWarning('Missing info', 'Please enter address label and full address');
      return;
    }
    addAddress(label.trim(), line.trim());
    setLabel('');
    setLine('');
    showSuccess('Address saved', 'New address added successfully.');
  };

  return (
    <KeyboardAwareScroll
      contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}
      extraScrollOffset={72}
    >
      {addresses.map((a) => (
        <View key={a.id} style={styles.card}>
          <View style={styles.cardHead}>
            <Ionicons name={a.label === 'Office' ? 'business-outline' : 'home-outline'} size={20} color={BRAND.primary} />
            <Text style={styles.label}>{a.label}</Text>
            {a.isDefault && <View style={styles.badge}><Text style={styles.badgeText}>Default</Text></View>}
          </View>
          <Text style={styles.line}>{a.line}</Text>
        </View>
      ))}

      <Text style={styles.addTitle}>Add New Address</Text>
      <KeyboardTextInput style={styles.input} placeholder="Label (Home, Office...)" placeholderTextColor={BRAND.light} value={label} onChangeText={setLabel} />
      <KeyboardTextInput style={[styles.input, styles.textArea]} placeholder="Full address" placeholderTextColor={BRAND.light} value={line} onChangeText={setLine} multiline />
      <Pressable style={styles.btn} onPress={handleAdd}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.btnText}>Add New Address</Text>
      </Pressable>
    </KeyboardAwareScroll>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BRAND.border },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '800', flex: 1 },
  badge: { backgroundColor: BRAND.lavender, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: BRAND.primary },
  line: { fontSize: 13, color: BRAND.muted, lineHeight: 20 },
  addTitle: { fontSize: 16, fontWeight: '800', marginTop: 12, marginBottom: 12 },
  input: { backgroundColor: BRAND.canvas, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BRAND.border, marginBottom: 10, fontSize: 15 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  btn: { flexDirection: 'row', gap: 8, backgroundColor: BRAND.primary, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800' },
});
