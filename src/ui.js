// Shared colors and small building blocks for every Rally. screen.
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const C = {
  bg: '#FFF8F0',
  card: '#FFFFFF',
  ink: '#1F2340',
  soft: '#5B6080',
  brand: '#5B3FD9',
  brandSoft: '#ECE7FF',
  accent: '#FF7A45',
  accentSoft: '#FFE9DF',
  green: '#1F9D6B',
  greenSoft: '#E2F6EE',
  line: '#E8E2D9',
};

export function Button({ title, onPress, disabled, kind = 'primary', style }) {
  const bg = kind === 'primary' ? C.brand : kind === 'accent' ? C.accent : C.card;
  const color = kind === 'ghost' ? C.brand : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        kind === 'ghost' && { borderWidth: 2, borderColor: C.brand },
        style,
      ]}
    >
      <Text style={[s.btnText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[s.chip, selected && { backgroundColor: C.brand, borderColor: C.brand }]}
    >
      <Text style={[s.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Header({ title, onBack }) {
  return (
    <View style={s.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button">
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
      ) : null}
      <Text style={s.headerTitle}>{title}</Text>
    </View>
  );
}

export function Badge({ text, color = C.brand, bg = C.brandSoft }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export function ageLine(p) {
  return p.minAgeAlone > p.minAgeWithAdult
    ? `Ages ${p.minAgeWithAdult}+ with an adult · ${p.minAgeAlone}+ on your own`
    : `Ages ${p.minAgeWithAdult}+`;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, paddingBottom: 48 },
  h1: { fontSize: 30, fontWeight: '800', color: C.ink },
  h2: { fontSize: 20, fontWeight: '800', color: C.ink, marginTop: 22, marginBottom: 10 },
  body: { fontSize: 16, color: C.soft, lineHeight: 23 },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  btn: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  btnText: { fontSize: 17, fontWeight: '800' },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.card,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 15, fontWeight: '700', color: C.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  back: { fontSize: 17, color: C.brand, fontWeight: '700', marginBottom: 6 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.ink },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, marginBottom: 8 },
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
});
