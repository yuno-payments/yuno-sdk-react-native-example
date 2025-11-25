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

import React from 'react';
import {StatusBar} from 'react-native';
import {HomeScreen} from './screens';
import {colors} from './theme';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />
      <HomeScreen />
    </>
  );
}

export default App;

