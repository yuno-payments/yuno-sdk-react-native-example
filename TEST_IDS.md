# Test IDs para Automatización

Este documento lista todos los identificadores de prueba (`testID`) disponibles en la aplicación de ejemplo para automatización con Appium y otras herramientas.

## Pantalla Inicial (Nativa)

### iOS y Android
- **`config-text-input`**: Campo de texto para ingresar el JSON de configuración
- **`button-start-sdk`**: Botón para iniciar la aplicación React Native

## Pantalla Principal (React Native)

### Campos de Configuración
- **`input-customer-session`**: Campo de texto para Customer Session
- **`input-checkout-session`**: Campo de texto para Checkout Session (requerido para pagos)
- **`input-payment-method-type`**: Campo de texto para tipo de método de pago (requerido para Payment Lite)
- **`input-vaulted-token`**: Campo de texto para Vaulted Token (opcional)

### Botones de Pago
- **`button-start-payment`**: Botón "Start Payment (Full Flow)"
- **`button-start-payment-lite`**: Botón "Start Payment Lite"
- **`button-seamless-payment`**: Botón "Seamless Payment" (el SDK crea el pago; la sesión debe tener `workflow: SDK_SEAMLESS`)
- **`button-embedded-payment`**: Botón "Embedded Payment (render)": el formulario del SDK se muestra dentro de la pantalla (`showView`)

### Botón de Enrollment
- **`button-enrollment`**: Botón "Enrollment Payment"
- **`button-enrollment-embedded`**: Botón "Enrollment (render)": el formulario de enrollment se muestra dentro de la pantalla

### One-Time Token (OTT)
- **`button-continue-payment`**: Continúa el pago después de crearlo con el OTT (resuelve `createPayment`). En Android el SDK nativo espera **60 segundos** como máximo: crear el pago y presionar este botón dentro de ese tiempo, o el resultado es `INTERNAL_ERROR` (`OperationTimeout`)
- **`sdk-loading`**: Texto "Processing…" mientras el SDK está cargando (la app maneja el loader con `showLoading`, así la pantalla del OTT sigue usable)
- **`button-copy-ott`**: Copia el OTT
- **`button-clear-ott`**: Descarta el OTT y cancela el pago (rechaza `createPayment`)

## Modal de Métodos de Pago

### Componente Nativo
- **`yuno-payment-methods-view`**: Vista nativa que contiene la lista de métodos de pago de Yuno

### Botones del Modal
- **`button-pay`**: Botón "Pay" (aparece después de seleccionar un método de pago)
- **`button-back`**: Botón "← Back" para volver a la pantalla principal (cierra la transacción)

## Formulario Embebido (render)

- **`yuno-embedded-form-view`**: Vista nativa con el formulario del SDK (tarjeta, APM o enrollment)
- **`button-submit-embedded`**: Botón del comercio que envía el formulario (`process.onSubmit()`)
- **`button-back`**: Cierra la transacción y vuelve a la pantalla principal

## Pantalla Headless

- **`headless-payment-json-input`** / **`start-payment-button`**: JSON con `checkoutSession` y `paymentSelected` (`type` + `transactionData`)
- **`headless-enrollment-json-input`** / **`start-enrollment-button`**: JSON con `customerSession` y `paymentSelected`
- **`copy-ott-button`**, **`continue-payment-button`**, **`close-ott-button`**: diálogo del OTT
- **`headless-status-text`** / **`close-status-button`**: resultado (`Status: …`)

## Uso con Appium

### Android
En Android, los `testID` se mapean automáticamente a `contentDescription` y se pueden buscar usando:

```javascript
// WebdriverIO
const element = await $('android=new UiSelector().description("button-start-payment")');
await element.click();

// O usando accesibilidad
const element = await $('~button-start-payment');
await element.click();
```

### iOS
En iOS, los `testID` se mapean automáticamente a `accessibilityIdentifier` y se pueden buscar usando:

```javascript
// WebdriverIO
const element = await $('~button-start-payment');
await element.click();

// O usando predicate string
const element = await $('-ios predicate string:name == "button-start-payment"');
await element.click();
```

## Ejemplo de Flujo de Prueba

```javascript
// 1. Pantalla inicial - Ingresar configuración
await $('~config-text-input').setValue(JSON.stringify(config));
await $('~button-start-sdk').click();

// 2. Ingresar checkout session
await $('~input-checkout-session').setValue('your-checkout-session-id');

// 3. Iniciar Payment Full Flow
await $('~button-start-payment').click();

// 4. Esperar a que aparezca la lista de métodos de pago
await $('~yuno-payment-methods-view').waitForDisplayed({ timeout: 5000 });

// 5. Seleccionar método de pago (elementos nativos de Yuno SDK)
// Los elementos internos de la lista se manejan por el SDK nativo de Yuno

// 6. Presionar el botón Pay
await $('~button-pay').waitForDisplayed({ timeout: 5000 });
await $('~button-pay').click();
```

## Notas Importantes

1. **React Native**: Los testIDs en componentes React Native se mapean automáticamente a las propiedades nativas correspondientes:
   - iOS: `accessibilityIdentifier`
   - Android: `contentDescription`

2. **Compose en Android**: En el SDK nativo de Yuno (Compose), los elementos usan `modifier.semantics { testTagsAsResourceId = true }.testTag()`, lo que permite usar `resource-id` para acceder a ellos.

3. **Elementos Nativos del SDK Yuno**: La lista de métodos de pago (`yuno-payment-methods-view`) contiene elementos nativos del SDK de Yuno. Para interactuar con elementos específicos dentro de la lista, consulta la documentación del SDK nativo de Yuno o usa coordenadas/gestos.

4. **Timing**: Algunos elementos pueden tardar en aparecer debido a llamadas de red. Usa `waitForDisplayed()` o esperas explícitas según sea necesario.

## Actualizado

Este documento está actualizado con la versión **2.0.0** del SDK de React Native (Yuno SDK 3.0.0).

