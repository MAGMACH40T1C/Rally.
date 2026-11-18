import { ScrollView, Text, View } from 'react-native';
import { Button, C, s } from '../ui';

export default function HomeScreen({ go }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad}>
      <Text style={[s.h1, { fontSize: 44, color: C.brand, marginTop: 12 }]}>Rally.</Text>
      <Text style={[s.body, { fontSize: 18, marginTop: 6 }]}>
        Find volunteer hours you’ll actually enjoy.
      </Text>

      <View style={[s.card, { marginTop: 22, backgroundColor: C.brandSoft, borderColor: C.brandSoft }]}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: C.brand, marginBottom: 8 }}>
          WHY RALLY. IS DIFFERENT
        </Text>
        <Text style={s.body}>
          <Text style={{ fontWeight: '800', color: C.ink }}>Other apps: </Text>
          you scroll through hundreds of listings and guess what you’d like.
        </Text>
        <Text style={[s.body, { marginTop: 6 }]}>
          <Text style={{ fontWeight: '800', color: C.ink }}>Rally.: </Text>
          answer a quick checklist, and AI picks trusted places chosen just for you.
        </Text>
      </View>

      <Button title="✨ Find my matches" onPress={() => go('checklist')} style={{ marginTop: 20 }} />
      <Button title="📍 Browse trusted places" kind="ghost" onPress={() => go('browse')} />
      <Button title="🛡️ Safety tips" kind="accent" onPress={() => go('safety')} />

      <Text style={[s.body, { fontSize: 13, marginTop: 24, textAlign: 'center' }]}>
        Rally. never asks for your name or address, doesn’t save chats, and has no public profiles.
      </Text>
    </ScrollView>
  );
}
