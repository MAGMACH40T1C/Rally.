import { Pressable, ScrollView, Text, View } from 'react-native';
import { Badge, Button, C, Header, ageLine, s } from '../ui';

export default function ResultsScreen({ result, openPlace, go, goBack }) {
  return (
    <View style={s.screen}>
      <Header title="Your matches" onBack={goBack} />
      <ScrollView contentContainerStyle={s.pad}>
        <View style={[s.card, { backgroundColor: C.brand, borderColor: C.brand }]}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 27 }}>{result.intro}</Text>
        </View>

        {result.matches.map(({ place, why }, i) => (
          <Pressable key={place.id} onPress={() => openPlace(place.id)} style={s.card}>
            <Badge text={i === 0 ? '⭐ TOP PICK FOR YOU' : '✨ PICKED FOR YOU BY AI'} />
            <Text style={{ fontSize: 19, fontWeight: '800', color: C.ink }}>
              {place.emoji} {place.name}
            </Text>
            <Text style={[s.body, { marginTop: 6 }]}>{why}</Text>
            <Text style={{ marginTop: 8, color: C.green, fontWeight: '700' }}>✅ Trusted · {ageLine(place)}</Text>
            <Text style={{ marginTop: 8, color: C.brand, fontWeight: '800' }}>Read more ›</Text>
          </Pressable>
        ))}

        <View style={[s.card, { backgroundColor: C.accentSoft, borderColor: C.accentSoft }]}>
          <Text style={{ fontWeight: '800', color: C.ink, marginBottom: 4 }}>🛡️ Safety tip</Text>
          <Text style={s.body}>{result.tip}</Text>
        </View>

        <Button title="🛡️ All safety tips" kind="accent" onPress={() => go('safety')} />
        <Button title="Change my answers" kind="ghost" onPress={goBack} />
      </ScrollView>
    </View>
  );
}
