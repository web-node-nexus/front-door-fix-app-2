import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import {
  availableMeasureUnits,
  categoryMeasure,
  isDualUnitService,
  MEASURE_UNITS,
  MeasureUnit,
  measureLabel,
  measureShort,
  unitPrice,
} from '../utils/measureUnits';

type Props = {
  service: Service;
  measureUnit: MeasureUnit;
  measure: string;
  estimated: number;
  onUnitChange: (unit: MeasureUnit) => void;
  onMeasureChange: (value: string) => void;
};

export default function MeasurePicker({
  service,
  measureUnit,
  measure,
  estimated,
  onUnitChange,
  onMeasureChange,
}: Props) {
  const dual = isDualUnitService(service);
  const meta = categoryMeasure(service.category?.slug);
  const unitOptions = availableMeasureUnits(service);
  const rate = unitPrice(service, measureUnit);
  const short = measureShort(measureUnit);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{dual ? 'Select unit (Aluminium & Glass)' : `Enter quantity (${meta.label})`}</Text>
      <Text style={styles.hint}>{meta.hint}</Text>

      {dual ? (
        <View style={styles.unitRow}>
          {MEASURE_UNITS.filter((u) => unitOptions.includes(u.value)).map((u) => {
            const active = measureUnit === u.value;
            return (
              <Pressable
                key={u.value}
                style={[styles.unitChip, active && styles.unitChipActive]}
                onPress={() => onUnitChange(u.value)}
              >
                <Text style={[styles.unitChipText, active && styles.unitChipTextActive]}>{u.label}</Text>
                <Text style={[styles.unitRate, active && styles.unitChipTextActive]}>
                  ₹{unitPrice(service, u.value).toLocaleString('en-IN')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>
        {dual ? `Enter ${measureLabel(measureUnit).toLowerCase()}` : `Quantity (${short})`}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={measure}
          onChangeText={onMeasureChange}
          keyboardType="decimal-pad"
          placeholder={meta.placeholder}
          placeholderTextColor={BRAND.light}
        />
        <Text style={styles.unitTag}>{measureLabel(measureUnit)}</Text>
      </View>
      <Text style={styles.estimate}>
        {Number(measure) > 0 ? `${measure} ${short} × ₹${rate.toLocaleString('en-IN')}/${short} = ` : 'Enter quantity · '}
        <Text style={styles.estimateValue}>₹{estimated.toLocaleString('en-IN')}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  title: { fontSize: 14, fontWeight: '800', color: BRAND.ink, marginBottom: 6 },
  hint: { fontSize: 12, color: BRAND.muted, lineHeight: 17, marginBottom: 12 },
  unitRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  unitChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
  },
  unitChipActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  unitChipText: { fontSize: 13, fontWeight: '700', color: BRAND.muted },
  unitChipTextActive: { color: BRAND.primary },
  unitRate: { fontSize: 11, fontWeight: '700', color: BRAND.muted, marginTop: 2 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: BRAND.muted, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    color: BRAND.ink,
    backgroundColor: BRAND.surface,
  },
  unitTag: { fontSize: 13, fontWeight: '800', color: BRAND.ink, minWidth: 48 },
  estimate: { marginTop: 10, fontSize: 13, color: BRAND.muted, fontWeight: '600' },
  estimateValue: { color: BRAND.primary, fontWeight: '800' },
});
