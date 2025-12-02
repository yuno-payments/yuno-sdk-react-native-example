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

import React, {useEffect} from 'react';
import {StatusBar, NativeModules, Platform} from 'react-native';
import {HomeScreen} from './screens';
import {useTheme} from './hooks';

interface AppProps {
  countryCode?: string;
  configJson?: string;
}

function App(props: AppProps): React.JSX.Element {
  const {colors, isDark} = useTheme();

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
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />
      <HomeScreen 
        initialCountryCode={props.countryCode}
        initialConfigJson={props.configJson}
      />
    </>
  );
}

export default App;

