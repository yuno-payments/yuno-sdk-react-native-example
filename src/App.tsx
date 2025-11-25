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
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen, PaymentMethodsScreen} from './screens';
import {colors} from './theme';
import type {RootStackParamList} from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="Home">
            {(screenProps) => (
              <HomeScreen
                {...screenProps}
                initialCountryCode={props.countryCode}
                initialConfigJson={props.configJson}
              />
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;

