import { ScrollView, Text, View } from 'react-native';
import { Badge, Button, C, Header, ageLine, s } from '../ui';
import { getPlace } from '../data/places';

export default function PlaceScreen({ placeId, go, goBack }) {
  const p = getPlace(placeId);
  if (!p) return null;
  return (
    <View style={s.screen}>
      <Header title={`${p.emoji} ${p.name}`} onBack={goBack} />
      <ScrollView contentContainerStyle={s.pad}>
        <Badge text="✅ TRUSTED PLACE" color={C.green} bg={C.greenSoft} />

        <Text style={s.h2}>What you’ll do</Text>
        <Text style={[s.body, { color: C.ink }]}>{p.description}</Text>

        <Text style={s.h2}>Minimum age</Text>
        <View style={[s.card, { backgroundColor: C.greenSoft, borderColor: C.greenSoft }]}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink }}>{ageLine(p)}</Text>
          <Text style={[s.body, { marginTop: 4, fontSize: 14 }]}>
            Every location sets its own rules, so always check with the place first.
          </Text>
        </View>

        <Text style={s.h2}>How to start</Text>
        <Text style={[s.body, { color: C.ink }]}>{p.howToStart}</Text>

        <View style={[s.card, { backgroundColor: C.accentSoft, borderColor: C.accentSoft, marginTop: 18 }]}>
          <Text style={{ fontWeight: '800', color: C.ink }}>
            🛡️ Make sure a trusted adult is always with you or knows exactly where you are.
          </Text>
        </View>

        <Button title="🛡️ Safety tips" kind="accent" onPress={() => go('safety')} />
      </ScrollView>
    </View>
  );
}
