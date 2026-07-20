import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { proApi } from '../../api/pro';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';

export default function ProProfileScreen() {
  const { user, refreshProProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.professional?.bio ?? '');
  const [address, setAddress] = useState(user?.professional?.address ?? '');
  const [city, setCity] = useState(user?.professional?.city ?? '');
  const [pincode, setPincode] = useState(user?.professional?.pincode ?? '');
  const [available, setAvailable] = useState(user?.professional?.is_available ?? false);
  const [selectedCats, setSelectedCats] = useState<number[]>(user?.professional?.category_ids ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    proApi.categories().then(setCategories);
    refreshProProfile();
  }, [refreshProProfile]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setBio(user.professional?.bio ?? '');
    setAddress(user.professional?.address ?? '');
    setCity(user.professional?.city ?? '');
    setPincode(user.professional?.pincode ?? '');
    setAvailable(user.professional?.is_available ?? false);
    setSelectedCats(user.professional?.category_ids ?? []);
  }, [user]);

  function toggleCat(id: number) {
    setSelectedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function save() {
    if (!name.trim() || selectedCats.length === 0) {
      showWarning('Missing info', 'Name and at least one service category are required.');
      return;
    }
    setSaving(true);
    try {
      await proApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        is_available: available,
        category_ids: selectedCats,
      });
      await refreshProProfile();
      showSuccess('Profile saved', 'Your professional profile has been updated successfully.');
    } catch (e) {
      showError('Save failed', e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAwareScroll contentContainerStyle={styles.scroll}>
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Text style={styles.label}>Bio</Text>
      <TextInput style={[styles.input, styles.area]} value={bio} onChangeText={setBio} multiline />
      <Text style={styles.label}>Service address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} />
      <Text style={styles.label}>Pincode</Text>
      <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="number-pad" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Available for jobs</Text>
        <Switch value={available} onValueChange={setAvailable} />
      </View>

      <Text style={styles.label}>Service categories</Text>
      <View style={styles.chips}>
        {categories.map((c) => {
          const on = selectedCats.includes(c.id);
          return (
            <Pressable key={c.id} style={[styles.chip, on && styles.chipOn]} onPress={() => toggleCat(c.id)}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{c.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save profile'}</Text>
      </Pressable>
    </KeyboardAwareScroll>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, backgroundColor: '#F5F5F7' },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.muted, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, fontSize: 15 },
  area: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  chipOn: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  chipText: { fontSize: 12, fontWeight: '600', color: BRAND.muted },
  chipTextOn: { color: '#FFD600' },
  saveBtn: { backgroundColor: '#FFD600', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24, marginBottom: 24 },
  saveText: { fontWeight: '800', color: '#1A1A2E' },
});
