# 🏗️ Arquitectura Clean - Yuno SDK React Native Example

## 📋 Descripción General

Esta aplicación sigue los principios de **Clean Architecture** y las **mejores prácticas de React Native**, organizando el código en capas con responsabilidades claramente definidas.

## 🗂️ Estructura de Carpetas

```
src/
├── components/          # Componentes UI reutilizables
│   ├── Button.tsx      # Botón con variantes (primary, secondary, etc.)
│   ├── Input.tsx       # Input con label y validación
│   ├── Card.tsx        # Card contenedor
│   ├── InfoRow.tsx     # Fila de información clave-valor
│   ├── ConfigForm.tsx  # Formulario de configuración
│   ├── PaymentActions.tsx  # Botones de acciones de pago
│   ├── OTTDisplay.tsx  # Visualización del OTT
│   ├── StatusDisplay.tsx   # Visualización de estados
│   └── index.ts        # Barrel export
│
├── hooks/              # Custom hooks
│   ├── useYunoSDK.ts   # Hook principal para el SDK
│   ├── useYunoEvents.ts    # Hook para eventos del SDK
│   ├── useAppStateForeground.ts  # Hook para AppState
│   └── index.ts
│
├── screens/            # Pantallas de la aplicación
│   ├── HomeScreen.tsx  # Pantalla principal
│   └── index.ts
│
├── services/           # Servicios y lógica de negocio
│   └── YunoService.ts  # Servicio para interactuar con Yuno SDK
│
├── theme/              # Tema y estilos
│   ├── colors.ts       # Paleta de colores
│   ├── spacing.ts      # Espaciados consistentes
│   ├── typography.ts   # Estilos de tipografía
│   └── index.ts
│
├── types/              # Tipos TypeScript
│   └── index.ts        # Definiciones de tipos
│
└── App.tsx             # App principal (simplificada)
```

## 🎯 Capas y Responsabilidades

### 1. **Components (Presentación)**
- **Responsabilidad**: Componentes UI puros y reutilizables
- **Características**:
  - No contienen lógica de negocio
  - Reciben datos y callbacks por props
  - Estilizados con estilos locales
  - TypeScript estricto con interfaces claras
- **Ejemplos**:
  - `Button`: Botón reutilizable con variantes y estados
  - `Input`: Campo de texto con validación visual
  - `Card`: Contenedor con sombra y padding consistente

### 2. **Hooks (Lógica Reutilizable)**
- **Responsabilidad**: Encapsular lógica reutilizable y manejo de estado
- **Características**:
  - Custom hooks para funcionalidad específica
  - Separación de concerns (eventos, estado de app, SDK)
  - Facilitan testing y mantenimiento
- **Hooks principales**:
  - `useYunoSDK`: Hook principal que orquesta todo el SDK
  - `useYunoEvents`: Maneja eventos nativos del SDK
  - `useAppStateForeground`: Detecta cuando la app vuelve al foreground

### 3. **Services (Lógica de Negocio)**
- **Responsabilidad**: Interacción con APIs y SDKs externos
- **Características**:
  - Singleton pattern para instancia única
  - Métodos async/await bien definidos
  - Logging consistente
  - Manejo de errores centralizado
- **Servicio principal**:
  - `YunoService`: Wrapper del Yuno SDK con métodos tipados

### 4. **Screens (Composición)**
- **Responsabilidad**: Componer componentes y conectar lógica
- **Características**:
  - Usan hooks para lógica
  - Ensamblan componentes
  - Manejan navegación (si aplica)
- **Screen principal**:
  - `HomeScreen`: Pantalla principal con toda la funcionalidad

### 5. **Theme (Diseño)**
- **Responsabilidad**: Constantes de diseño y estilos globales
- **Características**:
  - Colores consistentes
  - Espaciados estándar
  - Tipografía definida
  - Design tokens
- **Módulos**:
  - `colors`: Paleta de colores (primary, secondary, success, etc.)
  - `spacing`: Espaciados (xs, sm, md, lg, xl, xxl)
  - `typography`: Estilos de texto (h1, h2, body, caption, etc.)

### 6. **Types (Contratos)**
- **Responsabilidad**: Definiciones de tipos TypeScript
- **Características**:
  - Interfaces claras y bien documentadas
  - Types exportados del SDK
  - Configuraciones tipadas

## 🔄 Flujo de Datos

```
User Interaction (UI)
    ↓
Screen (HomeScreen)
    ↓
Hook (useYunoSDK)
    ↓
Service (YunoService)
    ↓
Yuno SDK (Native)
    ↓
Native Events
    ↓
Hook (useYunoEvents)
    ↓
State Update
    ↓
UI Re-render
```

## ✅ Beneficios de esta Arquitectura

### 1. **Mantenibilidad**
- Código organizado y fácil de encontrar
- Responsabilidades claras
- Fácil de extender

### 2. **Testabilidad**
- Componentes puros fáciles de testear
- Hooks aislados
- Services mockeables
- Lógica separada de la UI

### 3. **Reusabilidad**
- Componentes genéricos reutilizables
- Hooks compartibles entre pantallas
- Theme consistente

### 4. **Escalabilidad**
- Fácil agregar nuevas features
- Estructura predecible
- Onboarding rápido para nuevos desarrolladores

### 5. **Type Safety**
- TypeScript en toda la app
- Interfaces bien definidas
- Menos bugs en runtime

## 🛠️ Mejores Prácticas Aplicadas

1. **Separation of Concerns**: Cada módulo tiene una responsabilidad única
2. **DRY (Don't Repeat Yourself)**: Componentes y hooks reutilizables
3. **Single Responsibility**: Cada archivo hace una cosa bien
4. **Composition over Inheritance**: Composición de componentes
5. **Type Safety**: TypeScript estricto
6. **Consistent Styling**: Theme system centralizado
7. **Error Handling**: Manejo de errores en la capa de servicio
8. **Logging**: Console logs consistentes para debugging
9. **Code Organization**: Barrel exports para imports limpios
10. **Performance**: useCallback y useMemo donde corresponde

## 📱 Cómo Agregar Nuevas Features

### Agregar una nueva pantalla:
1. Crear archivo en `src/screens/NuevaScreen.tsx`
2. Usar hooks existentes o crear nuevos
3. Componer con componentes existentes
4. Exportar en `src/screens/index.ts`

### Agregar un nuevo componente:
1. Crear archivo en `src/components/NuevoComponente.tsx`
2. Definir props interface con TypeScript
3. Usar theme para estilos consistentes
4. Exportar en `src/components/index.ts`

### Agregar nueva funcionalidad del SDK:
1. Agregar método en `YunoService.ts`
2. Exponer en `useYunoSDK.ts` si es necesario
3. Usar desde componentes/screens

## 🧪 Testing Strategy

```
Unit Tests:
- Services: Mockear SDK nativo
- Hooks: Testing Library for React Hooks
- Utils: Jest tests simples

Integration Tests:
- Screens: React Testing Library
- Flujos completos de pago

E2E Tests:
- Detox para flujos críticos
```

## 📚 Referencias

- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Hooks Guide](https://react.dev/reference/react)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

