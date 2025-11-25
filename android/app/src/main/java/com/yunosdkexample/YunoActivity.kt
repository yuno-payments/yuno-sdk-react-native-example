package com.yunosdkexample

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.yunosdkreactnative.YunoSdkModule

/**
 * YunoActivity - Activity that hosts the React Native content with Yuno SDK callbacks.
 * 
 * This activity assumes the Yuno SDK is already initialized by MainActivity.
 * It only registers the callbacks required for payment and enrollment flows.
 * 
 * This pattern ensures the SDK is initialized with the application context (not activity context).
 */
class YunoActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "YunoSDKExample"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  companion object {
    const val EXTRA_YUNO_API_KEY = "YUNO_API_KEY" // Deprecated, config now passed via MainActivity
    const val EXTRA_COUNTRY_CODE = "YUNO_COUNTRY_CODE"
    const val EXTRA_CONFIG_JSON = "YUNO_CONFIG_JSON"
  }

  /**
   * REQUIRED FOR YUNO SDK:
   * Register Yuno callbacks in onCreate() BEFORE super.onCreate().
   * This is CRITICAL: ActivityResultLaunchers MUST be registered before the activity
   * reaches the STARTED state.
   * 
   * The SDK must be already initialized before this activity starts.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    // Register Yuno callbacks BEFORE super.onCreate()
    // This is REQUIRED by Android's registerForActivityResult() API
    YunoSdkModule.registerYunoCallbacks(this)
    android.util.Log.d("YunoActivity", "✅ Yuno callbacks registered")
    
    super.onCreate(savedInstanceState)
  }
}

