import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { C } from './src/ui';
import { EMPTY_ANSWERS } from './src/data/checklist';
import HomeScreen from './src/screens/HomeScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import PlaceScreen from './src/screens/PlaceScreen';
import SafetyScreen from './src/screens/SafetyScreen';

// Only the checklist answers are saved on the phone. AI answers (chats) are never saved.
const SAVE_KEY = 'rally.checklist.v1';

export default function App() {
  const [stack, setStack] = useState([{ name: 'home' }]);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [result, setResult] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY)
      .then((t) => t && setAnswers({ ...EMPTY_ANSWERS, ...JSON.parse(t) }))
      .catch(() => {});
  }, []);

  function updateAnswers(next) {
    setAnswers(next);
    AsyncStorage.setItem(SAVE_KEY, JSON.stringify(next)).catch(() => {});
  }

  const go = (name, params = {}) => setStack((st) => [...st, { name, ...params }]);
  const goBack = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length]);

  const top = stack[stack.length - 1];
  const openPlace = (id) => go('place', { placeId: id });

  let screen;
  if (top.name === 'checklist')
    screen = (
      <ChecklistScreen
        answers={answers}
        setAnswers={updateAnswers}
        goBack={goBack}
        onResults={(r) => {
          setResult(r);
          go('results');
        }}
      />
    );
  else if (top.name === 'results' && result)
    screen = <ResultsScreen result={result} openPlace={openPlace} go={go} goBack={goBack} />;
  else if (top.name === 'browse') screen = <BrowseScreen openPlace={openPlace} goBack={goBack} />;
  else if (top.name === 'place') screen = <PlaceScreen placeId={top.placeId} go={go} goBack={goBack} />;
  else if (top.name === 'safety') screen = <SafetyScreen goBack={goBack} />;
  else screen = <HomeScreen go={go} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar style="dark" />
        {screen}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
