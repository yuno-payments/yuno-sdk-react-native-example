# CLAUDE.MD — React Native Projects (Apps & Libraries)

> Este documento es la fuente de verdad para cualquier agente que trabaje en este proyecto.
> Aplica tanto a **aplicaciones** como a **librerías** de React Native (incluyendo native modules/bridges).
> Ninguna tarea debe ejecutarse sin haber leído y comprendido completamente este archivo.

---

## 0. FLUJO OBLIGATORIO DEL AGENTE — ANTES DE ESCRIBIR UNA SOLA LÍNEA

### 0.1 Plan Mode (OBLIGATORIO)

Toda tarea, sin excepción, debe ejecutarse primero en **plan mode**:

1. **Leer** el issue/tarea completo.
2. **Analizar** el código existente relacionado (buscar en todo el proyecto).
3. **Redactar un plan** con: objetivo, archivos afectados, dependencias, riesgos, y criterios de aceptación.
4. **Esperar aprobación** del plan antes de escribir código.
5. Si durante la implementación el plan cambia, **detener, actualizar el plan, y solicitar re-aprobación**.

### 0.2 Agent Teams (OBLIGATORIO)

Cada tarea debe resolverse usando **AgentTeams**. Definir roles claros:

| Rol | Responsabilidad | Nombre máx. |
|-----|----------------|-------------|
| **Architect** | Diseña la solución, define contratos/interfaces, valida que se respeten los principios SOLID y Clean Architecture. | ≤ 100 chars |
| **Implementer** | Escribe el código siguiendo el plan del Architect. No toma decisiones de arquitectura. | ≤ 100 chars |
| **Reviewer** | Revisa el código contra este CLAUDE.MD, busca code smells, duplicación, race conditions, y violaciones de principios. | ≤ 100 chars |
| **Tester** | Escribe y ejecuta tests. Valida edge cases, concurrencia, y contratos. | ≤ 100 chars |

> **Regla**: Ningún nombre de teammate puede exceder **100 caracteres**.

### 0.3 Cero Duplicación — Reutilizar Siempre

Antes de escribir cualquier función, hook, utilidad, componente o módulo nativo:

1. **Buscar en todo el proyecto** si ya existe algo que resuelva el 100% del problema.
2. Si existe → **reutilizarlo**. No reinventar la rueda.
3. Si existe algo que resuelve el 80%+ → **extenderlo** en lugar de crear algo nuevo.
4. Si no existe nada → crear, pero verificar que no se duplique lógica existente.
5. **Documentar** la decisión en el plan si se crea algo nuevo.

---

## 1. PRINCIPIOS DE INGENIERÍA DE SOFTWARE

### 1.1 SOLID

Aplicar donde corresponda (no forzar en código trivial):

- **S — Single Responsibility**: Cada módulo, clase, hook o componente tiene UNA razón para cambiar. Un componente no debe mezclar lógica de negocio con presentación. Un native module no debe mezclar lógica de plataforma con lógica de aplicación.
- **O — Open/Closed**: Las entidades deben ser abiertas para extensión, cerradas para modificación. Usar composición sobre herencia. Preferir patrones como Strategy, Observer, o Decorator cuando se necesite extender comportamiento.
- **L — Liskov Substitution**: Las implementaciones concretas deben ser intercambiables sin romper el contrato. Toda interfaz/tipo exportado debe poder ser implementado por terceros sin sorpresas.
- **I — Interface Segregation**: No forzar a los consumidores a depender de interfaces que no usan. En librerías: exports granulares. En apps: props mínimas y específicas por componente.
- **D — Dependency Inversion**: Los módulos de alto nivel no dependen de módulos de bajo nivel; ambos dependen de abstracciones. Inyectar dependencias a través de props, contextos, o factories. Nunca importar directamente implementaciones concretas de infraestructura en la capa de dominio.

### 1.2 Clean Architecture

Organizar el código en capas con dependencias unidireccionales (de afuera hacia adentro):

```
┌─────────────────────────────────────────┐
│           Presentation / UI             │  ← Componentes, Screens, Hooks de UI
├─────────────────────────────────────────┤
│           Application / Use Cases       │  ← Orquestación, lógica de aplicación
├─────────────────────────────────────────┤
│           Domain / Business Logic       │  ← Entidades, reglas de negocio, interfaces
├─────────────────────────────────────────┤
│           Infrastructure / Data         │  ← API clients, storage, native modules
└─────────────────────────────────────────┘
```

**Reglas inviolables**:
- La capa de **Domain** NO importa nada de las capas externas.
- La capa de **Infrastructure** implementa interfaces definidas en Domain.
- La capa de **Presentation** consume Use Cases, nunca Infrastructure directamente.
- En **librerías**: la API pública es la capa de Presentation; el bridge nativo es Infrastructure.

### 1.3 Principios Adicionales

- **DRY** (Don't Repeat Yourself): Pero no a costa de abstracciones forzadas. Duplicar es mejor que una mala abstracción. La regla de tres aplica: si se repite 3 veces, abstraer.
- **KISS** (Keep It Simple, Stupid): La solución más simple que resuelva el problema correctamente es la mejor.
- **YAGNI** (You Aren't Gonna Need It): No implementar funcionalidad especulativa. Solo lo que se necesita ahora.
- **Composition over Inheritance**: Siempre. React ya lo favorece naturalmente.
- **Fail Fast**: Validar entradas temprano. Lanzar errores descriptivos. No propagar estados inválidos.
- **Principle of Least Surprise**: El código debe comportarse como el lector espera. Nombres claros, efectos secundarios explícitos.

---

## 2. REACT & REACT NATIVE — REGLAS ESPECÍFICAS

### 2.1 Componentes

- Componentes funcionales siempre. No class components (excepto Error Boundaries si se requiere).
- Un componente = un archivo. Si un componente crece más de ~200 líneas, dividirlo.
- Props tipadas siempre con TypeScript. No `any`, no `as` excepto en casos justificados y documentados.
- Separar **componentes presentacionales** (solo UI) de **componentes contenedores** (lógica + estado).
- Memoización (`React.memo`, `useMemo`, `useCallback`) solo cuando hay un problema de rendimiento medido, no preventivamente. Excepciones: callbacks pasados a listas largas o componentes nativos costosos.
- No lógica de negocio dentro de componentes. Extraer a hooks custom o use cases.

### 2.2 Hooks

- Hooks custom deben tener UNA responsabilidad.
- Prefijo `use` obligatorio.
- No hooks que mezclen fetching + transformación + caching + UI state. Separar.
- Documentar el contrato: qué recibe, qué retorna, qué efectos secundarios tiene.
- Los hooks no deben manejar errores silenciosamente. Propagar errores al consumidor.

### 2.3 Estado

- Estado local (`useState`) para estado de UI efímero.
- Estado global solo cuando múltiples componentes no relacionados jerárquicamente necesitan el mismo dato.
- Evitar estado derivado. Si un valor se puede calcular a partir de otro estado, calcularlo, no almacenarlo.
- Nunca mutar estado directamente. Inmutabilidad siempre.

### 2.4 Efectos

- `useEffect` es el último recurso, no el primero. Preferir event handlers.
- Cada `useEffect` debe tener una sola responsabilidad.
- Cleanup obligatorio para subscriptions, timers, listeners, y cualquier recurso que deba liberarse.
- Dependencias del array deben ser exhaustivas. No suprimir el lint de exhaustive-deps sin justificación escrita.

### 2.5 Navegación

- La navegación es infraestructura. Abstraerla detrás de una interfaz si la complejidad lo justifica.
- Deep linking debe ser testeable y estar centralizado.
- No navegar desde fuera de la capa de presentación.

### 2.6 Estilos

- `StyleSheet.create()` siempre (no objetos inline en render, afecta rendimiento).
- Tokens de diseño centralizados (colores, espaciado, tipografía) en un theme/constants.
- Nunca hardcodear valores de plataforma. Usar `Platform.select`, `Platform.OS`, o abstracciones.

---

## 3. LIBRERÍAS REACT NATIVE (NATIVE MODULES / BRIDGES)

### 3.1 Reglas de Peso y Dependencias

- **El peso importa**. Cada dependencia debe justificarse.
- Zero dependencias es el ideal. Si se necesita una dependencia, debe ser:
  - Liviana (< 50KB gzipped ideal, evaluar caso por caso).
  - Bien mantenida (actividad reciente, issues atendidos).
  - Sin dependencias transitivas pesadas.
- No agregar dependencias que solo se usan para una función. Implementar la función directamente.
- Auditar el bundle size impact antes de agregar cualquier dependencia.
- En el `package.json`, usar `peerDependencies` para dependencias que el consumidor ya debe tener (e.g., `react`, `react-native`).

### 3.2 API Pública

- La API pública es un **contrato**. Cambios breaking requieren major version bump (semver).
- Exportar solo lo necesario. Nada interno debe ser accesible.
- Tipos TypeScript exportados para TODA la API pública. Es la documentación principal.
- Defaults razonables para todas las opciones. El caso de uso básico debe funcionar sin configuración.
- Documentar cada export público con JSDoc mínimo: descripción, params, return, throws, example.

### 3.3 Native Code (iOS / Android)

- Código nativo en su propia carpeta separada (`ios/`, `android/`).
- No lógica de negocio en código nativo. El native module solo hace el bridge y operaciones que DEBEN ser nativas.
- Manejar errores nativos y propagarlos como errores JavaScript descriptivos.
- Threading: el JS bridge es asíncrono. Nunca bloquear el main thread nativo.
- Eventos nativos → JS deben ser tipados y documentados.
- Lifecycle-aware: respetar el ciclo de vida de la app (background, foreground, destroy). Limpiar recursos.

### 3.4 Turbo Modules / Fabric (New Architecture)

- Si el proyecto soporta New Architecture, implementar Turbo Modules cuando sea posible.
- Codegen specs deben ser la fuente de verdad para la interfaz nativa.
- Mantener backward compatibility con Old Architecture si el proyecto lo requiere (bridge fallback).

---

## 4. CONCURRENCIA Y RACE CONDITIONS

### 4.1 Reglas Generales

- **Identificar** toda operación asíncrona y sus posibles interacciones.
- **Nunca asumir** orden de ejecución entre operaciones asíncronas independientes.
- Cada operación asíncrona debe ser **cancelable** (AbortController, cleanup de useEffect, subscription.unsubscribe).
- No fire-and-forget en promesas. Siempre manejar reject/catch.
- Usar patrones de concurrencia explícitos, no ad-hoc.

### 4.2 Patrones Obligatorios

```typescript
// ❌ RACE CONDITION: El componente puede desmontarse antes de que la promesa resuelva
useEffect(() => {
  fetchData().then(setData);
}, [id]);

// ✅ CORRECTO: Cancel-aware
useEffect(() => {
  let cancelled = false;
  fetchData(id).then(data => {
    if (!cancelled) setData(data);
  });
  return () => { cancelled = true; };
}, [id]);

// ✅ MEJOR: Con AbortController
useEffect(() => {
  const controller = new AbortController();
  fetchData(id, { signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') handleError(err);
    });
  return () => controller.abort();
}, [id]);
```

### 4.3 Race Conditions Comunes en React Native

| Escenario | Riesgo | Solución |
|-----------|--------|----------|
| Múltiples fetches rápidos (e.g., search-as-you-type) | Respuesta antigua sobrescribe la nueva | Debounce + cancelación de request previo |
| Navegación rápida entre screens | State update en componente desmontado | Cleanup en useEffect, cancelar operaciones |
| Eventos nativos durante background | Listener activo sin contexto | Verificar app state antes de procesar |
| Escrituras concurrentes a storage | Datos corruptos o perdidos | Queue de escritura o lock optimista |
| Animaciones + state updates | UI inconsistente, jank | Usar `runOnJS` / `runOnUI` correctamente (si se usa Reanimated) |
| Múltiples subscriptions al mismo evento nativo | Duplicación de side effects | Registro centralizado de listeners con ref counting |

### 4.4 Reglas para Native Modules

- El código nativo puede ejecutarse en threads diferentes al main thread. Documentar en qué thread corre cada operación.
- Los callbacks/promises desde nativo hacia JS siempre se resuelven en el JS thread. No asumir timing.
- Si un native module tiene estado interno, protegerlo con mecanismos de sincronización apropiados del lenguaje nativo (dispatch queues en iOS, synchronized/locks en Android).
- Eventos nativos pueden llegar en cualquier momento. El lado JS debe ser resiliente a eventos inesperados o fuera de orden.

---

## 5. TESTING

### 5.1 Filosofía

- Tests no son opcionales. Todo código nuevo debe tener tests.
- Testear **comportamiento**, no implementación. Los tests no deben romperse por refactors internos.
- La pirámide de testing aplica: muchos unit tests, algunos integration tests, pocos E2E tests.

### 5.2 Qué testear

| Tipo | Qué | Cómo |
|------|-----|------|
| **Unit** | Funciones puras, utils, transformaciones, lógica de dominio | Assertions directas, sin mocks si es posible |
| **Hook tests** | Custom hooks | `renderHook` con escenarios de happy path y error |
| **Component tests** | Interacción de usuario, renderizado condicional | Render + simulate events + assert output |
| **Integration** | Use cases completos, flujos de múltiples módulos | Mocks en las boundaries (API, storage, native) |
| **Native module tests** | Bridge correctamente conectado, tipos correctos | Tests nativos (XCTest, JUnit) + tests de integración JS |

### 5.3 Reglas

- Mocks solo en las fronteras del sistema (network, storage, native modules, tiempo). No mockear módulos internos.
- No snapshot tests excepto para componentes estrictamente presentacionales y estables.
- Cada test debe poder ejecutarse de forma aislada e independiente del orden.
- Tests deben ser determinísticos. Nada de `setTimeout` en tests, nada de dependencias de timing.
- Nombrar tests describiendo el **comportamiento esperado**, no el método: `"muestra error cuando el usuario envía formulario vacío"`, no `"test handleSubmit"`.

### 5.4 Coverage

- Coverage no es un objetivo en sí mismo, pero:
  - Lógica de dominio/negocio: **≥ 90%** coverage.
  - Hooks custom: **≥ 80%** coverage.
  - Componentes con lógica: **≥ 70%** coverage.
  - Componentes puramente presentacionales: Coverage deseable pero no obligatorio.
  - Código nativo (bridge): Tests de integración obligatorios para cada método expuesto a JS.

---

## 6. GIT FLOW Y COMMITS

### 6.1 Regla de Oro

> **1 feature = 1 commit** (en la rama de feature antes de merge).
> Si la feature es compleja, desarrollar con múltiples commits y hacer **squash** antes de merge a la rama principal.

### 6.2 Conventional Commits (obligatorio)

```
<type>(<scope>): <descripción corta en imperativo>

[cuerpo opcional: qué y por qué, no cómo]

[footer opcional: BREAKING CHANGE, closes #issue]
```

**Tipos permitidos**:
- `feat`: Nueva funcionalidad.
- `fix`: Corrección de bug.
- `refactor`: Cambio de código que no agrega funcionalidad ni corrige bug.
- `test`: Agregar o corregir tests.
- `docs`: Documentación.
- `chore`: Tareas de mantenimiento (deps, CI, config).
- `perf`: Mejora de rendimiento.
- `ci`: Cambios en CI/CD.

**Ejemplos**:
```
feat(auth): add biometric authentication support
fix(bridge): resolve race condition in event listener cleanup
refactor(hooks): extract pagination logic into usePagination
test(payments): add integration tests for refund flow
chore(deps): bump react-native to 0.76
```

### 6.3 Branch Strategy

```
main (o master)          ← Producción. Siempre estable. Solo merges de release/hotfix.
├── develop              ← Integración. Merges de features completadas.
│   ├── feature/AUTH-1   ← Una feature, un branch, un commit final (squash).
│   ├── feature/PAY-42
│   └── ...
├── release/1.2.0        ← Preparación de release. Solo fixes críticos.
└── hotfix/crash-on-boot ← Correcciones urgentes de producción.
```

### 6.4 Reglas de Branches

- Branches de feature se crean desde `develop`.
- Nombre: `feature/<TICKET-ID>-<descripcion-corta>` o `feature/<descripcion-corta>`.
- Antes de abrir PR: rebase sobre `develop`, resolver conflictos, squash commits.
- PRs requieren al menos 1 review aprobado (el Reviewer del AgentTeam).
- No force push a `main` o `develop`. Nunca.

---

## 7. MANEJO DE ERRORES

### 7.1 Filosofía

- Los errores son ciudadanos de primera clase. No ignorarlos, no silenciarlos.
- Cada capa maneja los errores que le corresponden y propaga los que no.
- Error boundaries en puntos estratégicos de UI (por screen, por feature crítica).

### 7.2 Reglas

- **No `catch` vacíos**. Siempre manejar o re-throw.
- **No `console.log` como manejo de error** en producción.
- **Errores tipados**: Crear tipos de error específicos del dominio cuando aporten claridad.
- **Errores de native modules**: Siempre incluir código de error, mensaje descriptivo, y contexto nativo relevante.
- **Errores de red**: Distinguir entre errores de conexión, timeouts, errores de servidor, y errores de cliente. Nunca mostrar stack traces o mensajes técnicos al usuario.
- **Retry**: Implementar retry con backoff exponencial solo para errores transitorios (network, 5xx). Nunca retry automático para 4xx.

```typescript
// ✅ Error tipado para librerías
export class BridgeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly nativeError?: unknown
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}
```

---

## 8. RENDIMIENTO

### 8.1 Reglas Generales

- **Medir antes de optimizar**. No optimización prematura.
- Usar herramientas de profiling (Flipper, React DevTools Profiler, systrace, Xcode Instruments, Android Studio Profiler).
- Optimizaciones deben tener un antes/después medido y documentado.

### 8.2 React Native Específico

- **FlatList** sobre ScrollView para listas de tamaño variable/grande. Implementar `getItemLayout` si los items tienen altura fija.
- **Evitar re-renders innecesarios**: Verificar con React DevTools Profiler. Las causas comunes son: objetos/arrays creados inline en render, callbacks no memoizados pasados como props, context con valor que cambia en cada render.
- **Bridge**: Minimizar la cantidad de llamadas entre JS y native. Batch cuando sea posible. En New Architecture, JSI elimina este overhead pero igual ser consciente.
- **Imágenes**: Cachear, dimensionar correctamente, usar formatos eficientes (WebP). No cargar imágenes de alta resolución en thumbnails.
- **Bundle size** (especialmente en librerías): Tree-shaking friendly. Named exports. No side effects en imports. Declarar `sideEffects: false` en package.json si aplica.
- **Startup time**: Lazy loading de módulos no críticos. No inicialización heavy en el root.
- **Animations**: Ejecutar en el UI thread cuando sea posible (Animated con `useNativeDriver: true`, o Reanimated worklets). Nunca animar en el JS thread propiedades de layout.

---

## 9. SEGURIDAD

- No almacenar secrets, tokens, o API keys en el código fuente.
- Datos sensibles en almacenamiento seguro del OS (Keychain/Keystore).
- Validar TODA entrada del usuario, tanto en JS como en código nativo.
- No evaluar código dinámico (`eval`, `new Function`). Nunca.
- En librerías: documentar claramente las implicaciones de seguridad del API público si las hay.
- Certificate pinning para comunicación con servidores propios (en apps, no en librerías).
- No loggear datos sensibles del usuario.

---

## 10. DOCUMENTACIÓN

### 10.1 Código

- El código debe ser auto-documentado. Buenos nombres > buenos comentarios.
- Comentarios solo para explicar **por qué**, nunca **qué** (el código dice qué).
- TODO/FIXME/HACK deben incluir ticket o issue reference: `// TODO(AUTH-123): migrar a biometrics API v2`.
- JSDoc completo para API pública de librerías.

### 10.2 Proyecto

- **README.md**: Setup, instalación, uso básico, contribución.
- **CHANGELOG.md**: Actualizado con cada release. Seguir Keep a Changelog.
- **CONTRIBUTING.md**: Reglas de contribución, setup de desarrollo.
- En librerías: **API Reference** generada a partir de TypeScript types/JSDoc.

---

## 11. SUGERENCIAS CONDICIONALES (SOLO EL AGENTE PUEDE SUGERIR)

### Para Aplicaciones

El agente **puede sugerir** tecnologías y librerías basándose en las necesidades del proyecto, evaluando:
- Madurez y mantenimiento activo de la librería.
- Bundle size impact.
- Compatibilidad con la versión de React Native del proyecto.
- Comunidad y soporte.
- Compatibilidad con New Architecture si el proyecto la usa.

> El agente **no debe imponer** ningún stack. Solo sugerir con justificación.

### Para Librerías

El agente **solo puede sugerir** dependencias que sean:
- **Livianas** (impacto mínimo en bundle size del consumidor).
- **Esenciales** para resolver el problema (no nice-to-have).
- **Estables** y bien mantenidas.
- Si existe una solución vanilla JS/TS que no penalice rendimiento, preferirla sobre una dependencia.

---

## 12. CHECKLIST PRE-COMMIT DEL AGENTE

Antes de considerar la tarea como completada, el agente **DEBE** verificar:

- [ ] El plan fue aprobado antes de implementar.
- [ ] No hay código duplicado con lo que ya existía en el proyecto.
- [ ] Los principios SOLID se respetan donde aplica.
- [ ] La separación de capas (Clean Architecture) se mantiene.
- [ ] No hay race conditions; toda operación async es cancelable y tiene cleanup.
- [ ] Los tests existen y pasan.
- [ ] El commit sigue Conventional Commits.
- [ ] 1 feature = 1 commit (squash si hubo múltiples commits durante desarrollo).
- [ ] No hay `any` injustificado en TypeScript.
- [ ] No hay `console.log` para debugging que no se haya eliminado.
- [ ] No hay secrets o datos sensibles en el código.
- [ ] La API pública (si es librería) tiene tipos exportados y documentación.
- [ ] Los errores se manejan correctamente en todas las capas.
- [ ] El rendimiento no se degrada (medir si la tarea es performance-sensitive).
- [ ] La documentación se actualizó si hubo cambios en API, setup, o comportamiento.

---

## 13. REGLAS ABSOLUTAS (NO NEGOCIABLES)

1. **TypeScript strict mode**. Sin excepciones.
2. **No `any`** salvo justificación documentada y aprobada.
3. **No `@ts-ignore` / `@ts-expect-error`** sin comentario explicando por qué y ticket asociado.
4. **No efectos secundarios en imports**.
5. **No lógica de negocio en componentes de UI**.
6. **No estado global para estado que puede ser local**.
7. **No mutación de estado**.
8. **No promises sin manejo de error**.
9. **No push directo a main/develop**.
10. **No dependencias sin justificación** (especialmente en librerías).
11. **No código muerto**. Si no se usa, se elimina.
12. **No magic numbers/strings**. Constantes con nombre descriptivo.
13. **No ignorar warnings del linter/compiler**. Resolverlos o justificar la excepción.
14. **El agente no implementa sin plan aprobado**.
15. **El agente no crea código nuevo sin verificar que no exista algo reutilizable**.