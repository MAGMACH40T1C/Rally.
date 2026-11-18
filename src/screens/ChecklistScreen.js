import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, C, Chip, Header, s } from '../ui';
import { AGE_GROUPS, COMPANY, INTERESTS, SETTINGS, TIMES, nicknameProblem } from '../data/checklist';
import { findMatches } from '../askAI';

export default function ChecklistScreen({ answers, setAnswers, onResults, goBack }) {
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');

  const toggle = (key, id) =>
    setAnswers({
      ...answers,
      [key]: answers[key].includes(id) ? answers[key].filter((x) => x !== id) : [...answers[key], id],
    });
  const pick = (key, id) => setAnswers({ ...answers, [key]: id });

  const nickError = nicknameProblem(answers.nickname);
  const missing = !answers.ageGroup ? 'Pick your age.' : answers.interests.length === 0 ? 'Pick at least one thing you like.' : '';
  const canAsk = !thinking && !missing && !nickError;

  async function ask() {
    if (!canAsk) return;
    setThinking(true);
    setError('');
    try {
      const result = await findMatches(answers);
      onResults(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setThinking(false);
    }
  }

  return (
    <View style={s.screen}>
      <Header title="Your checklist" onBack={goBack} />
      <ScrollView contentContainerStyle={s.pad}>
        <Text style={s.body}>Tap everything that sounds like you. The AI uses only these answers.</Text>

        <Text style={s.h2}>Nickname (optional)</Text>
        <TextInput
          value={answers.nickname}
          onChangeText={(t) => setAnswers({ ...answers, nickname: t })}
          placeholder="Like “Sky” — not your real name"
          placeholderTextColor="#9AA0B5"
          autoCorrect={false}
          maxLength={20}
          style={[s.card, { fontSize: 17, marginBottom: 4, color: C.ink }]}
        />
        {nickError ? <Text style={{ color: C.accent, fontWeight: '700' }}>{nickError}</Text> : null}

        <Text style={s.h2}>1. How old are you?</Text>
        <View style={s.chips}>
          {AGE_GROUPS.map((g) => (
            <Chip key={g.id} label={g.label} selected={answers.ageGroup === g.id} onPress={() => pick('ageGroup', g.id)} />
          ))}
        </View>

        <Text style={s.h2}>2. What do you like?</Text>
        <View style={s.chips}>
          {INTERESTS.map((i) => (
            <Chip key={i.id} label={i.label} selected={answers.interests.includes(i.id)} onPress={() => toggle('interests', i.id)} />
          ))}
        </View>

        <Text style={s.h2}>3. Inside or outside?</Text>
        <View style={s.chips}>
          {SETTINGS.map((i) => (
            <Chip key={i.id} label={i.label} selected={answers.setting === i.id} onPress={() => pick('setting', i.id)} />
          ))}
        </View>

        <Text style={s.h2}>4. Who do you want to go with?</Text>
        <View style={s.chips}>
          {COMPANY.map((i) => (
            <Chip key={i.id} label={i.label} selected={answers.company.includes(i.id)} onPress={() => toggle('company', i.id)} />
          ))}
        </View>

        <Text style={s.h2}>5. When are you free?</Text>
        <View style={s.chips}>
          {TIMES.map((i) => (
            <Chip key={i.id} label={i.label} selected={answers.times.includes(i.id)} onPress={() => toggle('times', i.id)} />
          ))}
        </View>

        {missing ? <Text style={[s.body, { marginTop: 18 }]}>{missing}</Text> : null}
        {error ? (
          <View style={[s.card, { backgroundColor: C.accentSoft, borderColor: C.accentSoft, marginTop: 16 }]}>
            <Text style={{ color: C.ink, fontSize: 15, lineHeight: 21 }}>😕 {error}</Text>
          </View>
        ) : null}

        <Button title={thinking ? 'Thinking…' : '✨ Find my matches'} onPress={ask} disabled={!canAsk} style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}
