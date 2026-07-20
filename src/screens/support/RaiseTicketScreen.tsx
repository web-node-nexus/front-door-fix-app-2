import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import KeyboardTextInput from '../../components/KeyboardTextInput';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const CATEGORIES = ['Booking Issue', 'Payment Problem', 'Service Quality', 'Technician Delay', 'Other'];

export default function RaiseTicketScreen() {
  const nav = useNavigation();
  const pad = useScreenPadding();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing info', 'Please enter subject and description');
      return;
    }
    const id = `TK${Math.floor(100000 + Math.random() * 900000)}`;
    Alert.alert('Ticket Raised', `Your ticket #${id} has been submitted. We will respond within 2 hours.`, [
      { text: 'OK', onPress: () => nav.goBack() },
    ]);
  };

  return (
    <KeyboardAwareScroll contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]} extraScrollOffset={72}>
      <Text style={styles.label}>Category</Text>
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
      <KeyboardTextInput style={styles.input} placeholder="Brief description of issue" placeholderTextColor={BRAND.light} value={subject} onChangeText={setSubject} />

      <Text style={styles.label}>Description</Text>
      <KeyboardTextInput style={[styles.input, styles.area]} placeholder="Describe your issue in detail..." placeholderTextColor={BRAND.light} value={description} onChangeText={setDescription} multiline />

      <Pressable onPress={submit}>
        <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
          <Ionicons name="ticket-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Submit Ticket</Text>
        </LinearGradient>
      </Pressable>
    </KeyboardAwareScroll>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  label: { fontSize: 14, fontWeight: '700', color: BRAND.muted, marginBottom: 8, marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: BRAND.canvas, borderWidth: 1, borderColor: BRAND.border },
  chipActive: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '600', color: BRAND.muted },
  chipTextActive: { fontSize: 12, fontWeight: '700', color: '#fff' },
  input: { backgroundColor: BRAND.canvas, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: BRAND.border, fontSize: 15 },
  area: { minHeight: 120, textAlignVertical: 'top' },
  btn: { flexDirection: 'row', gap: 8, marginTop: 24, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
