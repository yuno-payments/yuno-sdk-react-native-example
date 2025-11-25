# Yuno SDK React Native - Aplicación de Ejemplo

Esta es una aplicación de ejemplo que demuestra cómo usar el SDK de Yuno para React Native.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 16
- React Native development environment configurado
- Para iOS: Xcode y CocoaPods
- Para Android: Android Studio y JDK 11

### Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Para iOS - Instalar pods:**

```bash
cd ios && pod install && cd ..
```

3. **Compilar el SDK principal (si es necesario):**

```bash
cd .. && npm run prepack && cd example
```

## ▶️ Ejecutar la Aplicación

### Android

```bash
npm run android
```

O desde Android Studio:
1. Abre `android/` en Android Studio
2. Ejecuta la app en un emulador o dispositivo

### iOS

```bash
npm run ios
```

O desde Xcode:
1. Abre `ios/YunoSDKExample.xcworkspace` en Xcode
2. Selecciona un simulador o dispositivo
3. Presiona el botón Run

## 🎯 Uso de la Aplicación

### 1. Configuración Inicial

Al abrir la app, verás una pantalla de configuración donde debes:

- **API Key**: Ingresa tu API key de Yuno
- **Country Code**: Código del país (ej: CO para Colombia)

Presiona "Inicializar SDK" para comenzar.

### 2. Sesiones

Para usar las funcionalidades de pago, necesitas proporcionar:

- **Customer Session**: Token de sesión del cliente
- **Checkout Session**: Token de sesión de checkout

Estos tokens los obtienes desde tu backend usando la API de Yuno.

### 3. Funcionalidades Disponibles

#### 💳 Iniciar Pago
Inicia el flujo completo de pago con la UI de Yuno.

#### ⚡ Payment Lite
Flujo de pago simplificado usando un método de pago previamente guardado.

#### 📝 Enrollment
Permite al usuario guardar un nuevo método de pago.

#### 🎯 Seamless Payment
Flujo de pago seamless (sin UI) para procesar pagos en segundo plano.

#### 🚫 Ocultar Loader
Oculta manualmente el loader de Yuno.

## 📱 Características de la App

### UI Amigable
- Interfaz moderna y fácil de usar
- Indicadores de estado en tiempo real
- Mensajes de error claros

### Monitoreo de Estado
La app muestra en tiempo real:
- Estado del SDK (inicializado o no)
- Estado del último pago
- Estado del enrollment
- Tokens OTT generados

### Logs Detallados
Todos los eventos se registran en la consola:
- Android: `adb logcat | grep -i yuno`
- iOS: Ver consola en Xcode

## 🔧 Configuración Avanzada

### Modificar Configuración de Yuno

En `App.tsx`, puedes modificar la configuración del SDK:

```typescript
await YunoSdk.initialize({
  apiKey: apiKey,
  countryCode: countryCode,
  yunoConfig: {
    lang: YunoLanguage.ES,  // Idioma de la UI
    cardFlow: CardFlow.MULTI_STEP,  // Flujo de tarjetas
    saveCardEnabled: true,  // Permitir guardar tarjetas
    keepLoader: false,  // Mantener loader visible
    isDynamicViewEnabled: true,  // Vistas dinámicas
  },
});
```

### Personalizar UI

Puedes modificar los estilos en `App.tsx`. La app usa StyleSheet de React Native.

## 🐛 Troubleshooting

### Error: "Cannot find module '@y.uno/yuno-sdk-react-native'"

**Solución:**
```bash
cd ..
npm run prepack
cd example
rm -rf node_modules
npm install
```

### Error de compilación en Android

**Solución:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Error de pod install en iOS

**Solución:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### La app se cierra al inicializar

Verifica que:
1. El API Key sea válido
2. Tengas conexión a internet
3. Los repositorios de Yuno estén accesibles

## 📚 Documentación

- [Documentación del SDK](../README.md)
- [Arquitectura](../ARCHITECTURE.md)
- [API de Yuno](https://docs.y.uno)

## 🤝 Contribuir

Si encuentras un problema o tienes una sugerencia, por favor abre un issue en el repositorio.

## 📄 Licencia

MIT - Ver [LICENSE](../LICENSE) para más detalles.

---

**Hecho con ❤️ usando React Native**

