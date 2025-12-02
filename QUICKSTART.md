# ⚡ QUICKSTART - Yuno SDK Example

## 🎯 Setup en 3 Pasos

### 1️⃣ Instalar Dependencias

```bash
cd example
npm install
```

### 2️⃣ Compilar el SDK

```bash
cd ..
npm install
npm run prepack
cd example
```

### 3️⃣ Ejecutar

**Android:**
```bash
npm run android
```

**iOS:** (solo macOS)
```bash
cd ios && pod install && cd ..
npm run ios
```

---

## 🎮 Uso de la App

### 1. Inicializar

Al abrir la app:
1. Ingresa tu **API Key** de Yuno
2. Ingresa el **Country Code** (ej: CO)
3. Presiona **"Inicializar SDK"**

### 2. Configurar Sesiones

Obtén desde tu backend:
- **Customer Session**: Para enrollment
- **Checkout Session**: Para pagos

### 3. Probar Funcionalidades

- **💳 Iniciar Pago**: Flujo completo
- **⚡ Payment Lite**: Pago rápido
- **📝 Enrollment**: Guardar método de pago
- **🎯 Seamless**: Pago en background

---

## 🐛 Problemas Comunes

### Metro bundler no inicia
```bash
npm start -- --reset-cache
```

### Error de build en Android
```bash
cd android && ./gradlew clean && cd ..
```

### Error de pods en iOS
```bash
cd ios && rm -rf Pods && pod install && cd ..
```

---

## 📚 Más Info

- `README.md` - Documentación completa
- `SETUP.md` - Guía de instalación detallada
- `EXAMPLE_APP_COMPLETE.md` - Información técnica

---

**¿Listo? ¡Ejecuta `npm run android` o `npm run ios`! 🚀**

