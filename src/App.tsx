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
import {StatusBar} from 'react-native';
import {HomeScreen} from './screens';
import {colors} from './theme';

interface AppProps {
  countryCode?: string;
  configJson?: string;
}

function App(props: AppProps): React.JSX.Element {
  useEffect(() => {
    if (props.countryCode || props.configJson) {
      console.log('📦 App received initial props from native:');
      console.log('  - Country Code:', props.countryCode);
      console.log('  - Config JSON:', props.configJson?.substring(0, 100) + '...');
    }
  }, [props.countryCode, props.configJson]);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />
      <HomeScreen 
        initialCountryCode={props.countryCode}
        initialConfigJson={props.configJson}
      />
    </>
  );
}

export default App;

