import { ScrollView, Text, View } from 'react-native';
import { C, Header, s } from '../ui';

const TIPS = [
  ['👨‍👩‍👧', 'Bring a trusted adult', 'A parent, guardian, or teacher should go with you, or at least know exactly where you are and when you’ll be back.'],
  ['✅', 'Check the age rules first', 'Every place has its own minimum age. Ask before you go so you’re not turned away.'],
  ['🏢', 'Stick to real organizations', 'Volunteer with known groups like libraries, food banks, and shelters, never with a stranger you met online.'],
  ['🔒', 'Keep your info private', 'Don’t share your home address, phone number, or passwords with people you don’t know. Let your adult handle sign-up forms.'],
  ['🧑‍🤝‍🧑', 'Stay where people can see you', 'Volunteer in open, public areas. You never have to go somewhere alone with an adult you don’t know.'],
  ['📱', 'Have a check-in plan', 'Agree on a pickup time and keep your phone charged so you can reach your trusted adult.'],
  ['✋', 'It’s OK to say no', 'If anything feels wrong or unsafe, stop, leave, and tell your trusted adult right away.'],
  ['📝', 'Track your hours', 'Ask the volunteer leader to sign or confirm your hours before you leave, so they count for school.'],
];

export default function SafetyScreen({ goBack }) {
  return (
    <View style={s.screen}>
      <Header title="Safety tips" onBack={goBack} />
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.body}>Volunteering is fun when you feel safe. Follow these every time.</Text>
        <View style={{ height: 14 }} />
        {TIPS.map(([emoji, title, text]) => (
          <View key={title} style={[s.card, { flexDirection: 'row' }]}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>{emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: C.ink }}>{title}</Text>
              <Text style={[s.body, { marginTop: 4 }]}>{text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
