# 🚀 Guía de Setup - Yuno SDK Example App

Esta guía te ayudará a configurar y ejecutar la aplicación de ejemplo del SDK de Yuno.

## 📋 Prerrequisitos

### Generales
- **Node.js** >= 16
- **npm** o **yarn**
- **Git**

### Para Android
- **JDK 11** o superior
- **Android Studio** (última versión estable)
- **Android SDK** con:
  - SDK Platform 33
  - Build Tools 33.0.0
  - Android SDK Command-line Tools
- **Gradle** (viene con Android Studio)
- Variables de entorno configuradas:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```

### Para iOS (solo macOS)
- **Xcode** 14.0 o superior
- **CocoaPods** >= 1.11.0
  ```bash
  sudo gem install cocoapods
  ```
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

## 🛠️ Instalación

### 1. Instalar dependencias de Node

```bash
cd /Users/sebastiangarcia/Documents/Yuno/cross-sdks/yuno-sdk-react-native/example
npm install
```

### 2. Compilar el SDK principal

El SDK debe estar compilado antes de usarlo en la app de ejemplo:

```bash
cd ..
npm install
npm run prepack
cd example
```

### 3. Configuración específica por plataforma

#### Android

1. **Configurar credenciales de Artifactory** (opcional, para acceder al SDK de Yuno):

```bash
# En tu ~/.gradle/gradle.properties o en android/gradle.properties
ARTIFACTORY_USER=tu_usuario
ARTIFACTORY_ENCRYPTED_PASSWORD=tu_password
```

2. **Sincronizar Gradle**:

```bash
cd android
./gradlew clean
./gradlew build
cd ..
```

#### iOS

1. **Instalar pods**:

```bash
cd ios
pod install
cd ..
```

Si tienes problemas, intenta:

```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install --repo-update
cd ..
```

## ▶️ Ejecutar la App

### Android

**Opción 1: Usando React Native CLI**

```bash
npm run android
```

**Opción 2: Desde Android Studio**

1. Abre Android Studio
2. File → Open → Selecciona `example/android`
3. Espera a que Gradle sincronice
4. Corre la app (botón ▶️)

**Nota:** Asegúrate de tener un emulador corriendo o un dispositivo conectado:

```bash
# Ver dispositivos disponibles
adb devices

# Iniciar emulador
emulator -avd Pixel_5_API_33
```

### iOS

**Opción 1: Usando React Native CLI**

```bash
npm run ios
```

O especificar un simulador:

```bash
npm run ios -- --simulator="iPhone 14"
```

**Opción 2: Desde Xcode**

1. Abre Xcode
2. File → Open → Selecciona `example/ios/YunoSDKExample.xcworkspace` (⚠️ NO el .xcodeproj)
3. Selecciona un simulador o dispositivo
4. Corre la app (⌘R)

## 🐛 Solución de Problemas

### Error: "Unable to resolve module"

```bash
# Limpiar caché de Metro
npm start -- --reset-cache
```

### Error: "Task :app:installDebug FAILED" (Android)

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Error: "No bundle URL present" (iOS)

```bash
# Limpiar build de iOS
cd ios
rm -rf build
xcodebuild clean
cd ..
npm run ios
```

### Metro Bundler no inicia

```bash
# Matar procesos de Metro antiguos
lsof -ti:8081 | xargs kill -9

# Iniciar manualmente
npm start
```

### Error de Gradle: "Could not resolve all artifacts"

Verifica tu conexión a internet y las credenciales de Artifactory.

### CocoaPods: "Unable to find a specification"

```bash
cd ios
pod repo update
pod install
cd ..
```

## 📱 Probar la App

### 1. Obtener credenciales de Yuno

Necesitarás:
- **API Key**: Obtenla desde el dashboard de Yuno
- **Customer Session**: Genera uno desde tu backend
- **Checkout Session**: Genera uno desde tu backend

### 2. Configurar en la app

1. Abre la app
2. Ingresa tu API Key
3. Ingresa el código de país (ej: CO, BR, MX)
4. Presiona "Inicializar SDK"
5. Ingresa las sesiones necesarias
6. Prueba los diferentes flujos

### 3. Ver logs

**Android:**
```bash
adb logcat | grep -E "Yuno|ReactNative"
```

**iOS:**
- Abre Xcode
- Window → Devices and Simulators
- Selecciona tu dispositivo/simulador
- Ver console logs

## 🔄 Hot Reload

La app soporta Fast Refresh de React Native:

- **Android**: R + R (dos veces) o Shake → Reload
- **iOS**: ⌘D → Reload o Shake → Reload

## 🏗️ Build de Producción

### Android

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/`

### iOS

1. Abre el proyecto en Xcode
2. Product → Archive
3. Sigue el asistente de distribución

## 📚 Recursos Adicionales

- [Documentación del SDK](../README.md)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Yuno API Docs](https://docs.y.uno)

## 💡 Tips

- **Metro Bundler**: Déjalo corriendo en una terminal separada
- **Emuladores**: Usa hardware moderno para mejor rendimiento
- **Hot Reload**: Guarda tiempo de desarrollo
- **Logs**: Mantén los logs abiertos para debugging

## 🆘 ¿Necesitas ayuda?

Si encuentras problemas:

1. Verifica los prerrequisitos
2. Limpia todo y reinstala
3. Revisa los logs de error
4. Consulta la documentación
5. Abre un issue en el repositorio

---

**¡Listo para desarrollar! 🎉**

