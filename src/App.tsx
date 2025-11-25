/**
 * Yuno SDK React Native - Example App
 * Aplicación de ejemplo para demostrar el uso del SDK de Yuno
 * 
 * Arquitectura Clean con separación de responsabilidades:
 * - Services: Lógica de negocio e interacción con el SDK
 * - Hooks: Lógica reutilizable y manejo de estado
 * - Components: UI reutilizable y presentacional
 * - Screens: Composición de componentes y lógica de pantalla
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

