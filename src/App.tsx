/**
 * Yuno SDK React Native - Example App
 * Example application to demonstrate Yuno SDK usage
 * 
 * Clean Architecture with separation of concerns:
 * - Services: Business logic and SDK interaction
 * - Hooks: Reusable logic and state management
 * - Components: Reusable and presentational UI
 * - Screens: Component composition and screen logic
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, NativeModules, Platform, View, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {HomeScreen, HeadlessPaymentScreen} from './screens';
import {useTheme} from './hooks';

interface AppProps {
  countryCode?: string;
  configJson?: string;
}

type Screen = 'home' | 'headless';

function App(props: AppProps): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  useEffect(() => {
    // DEBUG: Verificar si el módulo nativo está disponible
    console.log('🔍 Platform:', Platform.OS);
    console.log('🔍 NativeModules.YunoSdk =>', NativeModules.YunoSdk);
    console.log('🔍 YunoSdk methods:', NativeModules.YunoSdk ? Object.keys(NativeModules.YunoSdk) : 'UNDEFINED');
    
    if (props.countryCode || props.configJson) {
      console.log('📦 App received initial props from native:');
      console.log('  - Country Code:', props.countryCode);
      console.log('  - Config JSON:', props.configJson?.substring(0, 100) + '...');
    }
  }, [props.countryCode, props.configJson]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.headerBackground}
        />

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, currentScreen === 'home' && styles.tabActive]}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={[styles.tabText, currentScreen === 'home' && styles.tabTextActive]}>
              Payment Full
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentScreen === 'headless' && styles.tabActive]}
            onPress={() => setCurrentScreen('headless')}
          >
            <Text style={[styles.tabText, currentScreen === 'headless' && styles.tabTextActive]}>
              Headless
            </Text>
          </TouchableOpacity>
        </View>

        {/* Screen Content with KeyboardAvoidingView */}
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {currentScreen === 'home' ? (
            <HomeScreen
              initialCountryCode={props.countryCode}
              initialConfigJson={props.configJson}
            />
          ) : (
            <HeadlessPaymentScreen
              initialCountryCode={props.countryCode}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#00A86B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#00A86B',
  },
});

export default App;

