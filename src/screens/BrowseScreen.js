import { Pressable, ScrollView, Text, View } from 'react-native';
import { Badge, C, Header, ageLine, s } from '../ui';
import { PLACES } from '../data/places';

export default function BrowseScreen({ openPlace, goBack }) {
  return (
    <View style={s.screen}>
      <Header title="Trusted places near you" onBack={goBack} />
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.body}>
          Rally. only lists supervised kinds of places that most towns have. Ask a trusted adult to help you find the one closest to you.
        </Text>
        <View style={{ height: 14 }} />
        {PLACES.map((p) => (
          <Pressable key={p.id} onPress={() => openPlace(p.id)} style={s.card}>
            <Badge text="✅ TRUSTED" color={C.green} bg={C.greenSoft} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>
              {p.emoji} {p.name}
            </Text>
            <Text style={[s.body, { marginTop: 4, fontSize: 14 }]}>{ageLine(p)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
