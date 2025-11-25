package com.yunosdkexample

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.yunosdkreactnative.YunoSdkModule
import org.json.JSONObject

/**
 * MainActivity - Entry point for the app.
 * 
 * This activity allows the user to input their Yuno configuration JSON, then navigates to YunoActivity
 * which initializes the Yuno SDK and hosts the React Native content.
 * 
 * The JSON should contain:
 * - country: Country code
 * - language: Language code
 * - currency: Currency code
 * - amount: Amount
 * - merchantKeys: { publicKey, secretKey, accountCode }
 * - options: { showPaymentStatus, cardType, savedCardEnable }
 */
class MainActivity : AppCompatActivity() {

  private lateinit var configInput: EditText
  private lateinit var startButton: Button

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Set background color to match React Native app
    window.decorView.setBackgroundColor(android.graphics.Color.parseColor("#F5F7FA"))
    
    // Main scroll container
    val scrollView = android.widget.ScrollView(this).apply {
      layoutParams = android.view.ViewGroup.LayoutParams(
        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
        android.view.ViewGroup.LayoutParams.MATCH_PARENT
      )
    }
    
    // Create a simple layout programmatically
    val layout = android.widget.LinearLayout(this).apply {
      orientation = android.widget.LinearLayout.VERTICAL
    }

    // Header (purple background like React Native)
    val header = android.widget.LinearLayout(this).apply {
      orientation = android.widget.LinearLayout.VERTICAL
      setBackgroundColor(android.graphics.Color.parseColor("#4E3DD8"))
      setPadding(64, 80, 64, 64)
    }
    
    // Title
    val title = android.widget.TextView(this).apply {
      text = "🎯 Yuno SDK Example"
      textSize = 28f
      setTextColor(android.graphics.Color.WHITE)
      gravity = android.view.Gravity.CENTER
      typeface = android.graphics.Typeface.DEFAULT_BOLD
    }
    header.addView(title)
    
    // Subtitle
    val subtitle = android.widget.TextView(this).apply {
      text = "🤖 Android"
      textSize = 16f
      setTextColor(android.graphics.Color.WHITE)
      gravity = android.view.Gravity.CENTER
      setPadding(0, 8, 0, 0)
      alpha = 0.9f
    }
    header.addView(subtitle)
    
    layout.addView(header)

    // Content card
    val cardLayout = android.widget.LinearLayout(this).apply {
      orientation = android.widget.LinearLayout.VERTICAL
      setBackgroundColor(android.graphics.Color.WHITE)
      val margin = 48
      setPadding(48, 48, 48, 48)
      val params = android.widget.LinearLayout.LayoutParams(
        android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        setMargins(margin, margin, margin, margin)
      }
      layoutParams = params
      elevation = 8f
      // Rounded corners
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = 32f
        setColor(android.graphics.Color.WHITE)
      }
    }

    // Card title
    val cardTitle = android.widget.TextView(this).apply {
      text = "⚙️ Configuración"
      textSize = 18f
      setTextColor(android.graphics.Color.parseColor("#333333"))
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      setPadding(0, 0, 0, 48)
    }
    cardLayout.addView(cardTitle)
    
    // Instructions
    val instructions = android.widget.TextView(this).apply {
      text = "Yuno Configuration JSON:"
      textSize = 14f
      setTextColor(android.graphics.Color.parseColor("#333333"))
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      setPadding(0, 0, 0, 16)
    }
    cardLayout.addView(instructions)

    // Config JSON input with styled background (multiline)
    configInput = EditText(this).apply {
      hint = "Ingresa el JSON de configuración"
      textSize = 12f
      setTextColor(android.graphics.Color.parseColor("#333333"))
      setHintTextColor(android.graphics.Color.parseColor("#999999"))
      setPadding(32, 32, 32, 32)
      minLines = 8
      maxLines = 15
      inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE
      gravity = android.view.Gravity.TOP
      setHorizontallyScrolling(false)
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = 24f
        setColor(android.graphics.Color.parseColor("#F9F9F9"))
        setStroke(2, android.graphics.Color.parseColor("#DDDDDD"))
      }
      val params = android.widget.LinearLayout.LayoutParams(
        android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        bottomMargin = 32
      }
      layoutParams = params
    }
    cardLayout.addView(configInput)

    // Start button with purple background
    startButton = Button(this).apply {
      text = "Start Yuno SDK Example"
      textSize = 15f
      setTextColor(android.graphics.Color.WHITE)
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      setPadding(32, 40, 32, 40)
      isAllCaps = false
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = 24f
        setColor(android.graphics.Color.parseColor("#4E3DD8"))
      }
      setOnClickListener {
        onStartButtonClicked()
      }
    }
    val buttonParams = android.widget.LinearLayout.LayoutParams(
      android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
      android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
    ).apply {
      topMargin = 24
    }
    cardLayout.addView(startButton, buttonParams)
    
    layout.addView(cardLayout)

    // Info card
    val infoCard = android.widget.LinearLayout(this).apply {
      orientation = android.widget.LinearLayout.VERTICAL
      setBackgroundColor(android.graphics.Color.parseColor("#E3F2FD"))
      val margin = 48
      setPadding(48, 48, 48, 48)
      val params = android.widget.LinearLayout.LayoutParams(
        android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
        android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        setMargins(margin, 24, margin, margin)
      }
      layoutParams = params
      // Rounded corners
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = 32f
        setColor(android.graphics.Color.parseColor("#E3F2FD"))
        setStroke(8, android.graphics.Color.parseColor("#2196F3"))
      }
    }
    
    val infoTitle = android.widget.TextView(this).apply {
      text = "ℹ️ Información"
      textSize = 16f
      setTextColor(android.graphics.Color.parseColor("#1976D2"))
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      setPadding(0, 0, 0, 16)
    }
    infoCard.addView(infoTitle)
    
    val infoText = android.widget.TextView(this).apply {
      text = "El SDK de Yuno ya está listo para usar.\n\n" +
             "• Ingresa el JSON de configuración completo\n" +
             "• Incluye country, language, merchantKeys y options\n" +
             "• Presiona Start para continuar\n" +
             "• El SDK se inicializará con tu configuración\n" +
             "• Podrás probar todas las funcionalidades"
      textSize = 13f
      setTextColor(android.graphics.Color.parseColor("#1565C0"))
      lineHeight = (20 * resources.displayMetrics.scaledDensity).toInt()
    }
    infoCard.addView(infoText)
    
    layout.addView(infoCard)
    
    // Footer
    val footer = android.widget.TextView(this).apply {
      text = "Yuno SDK React Native v1.0.0"
      textSize = 12f
      setTextColor(android.graphics.Color.parseColor("#999999"))
      gravity = android.view.Gravity.CENTER
      setPadding(0, 64, 0, 64)
    }
    layout.addView(footer)

    scrollView.addView(layout)
    setContentView(scrollView)
  }

  private fun onStartButtonClicked() {
    val configJson = configInput.text.toString().trim()
    
    if (configJson.isEmpty()) {
      Toast.makeText(this, "Please enter a valid configuration JSON", Toast.LENGTH_SHORT).show()
      return
    }

    try {
      // Parse JSON configuration
      val json = JSONObject(configJson)
      
      // Extract API key from merchantKeys.publicKey
      val merchantKeys = json.getJSONObject("merchantKeys")
      val apiKey = merchantKeys.getString("publicKey")
      
      // Extract country code
      val country = json.getString("country")
      
      // Extract language (optional)
      val language = if (json.has("language")) json.getString("language") else null
      
      // Extract options
      val options = json.getJSONObject("options")
      val savedCardEnable = options.optBoolean("savedCardEnable", false)
      val cardType = options.optString("cardType", "ONE_STEP")
      
      android.util.Log.d("MainActivity", "📋 Configuration parsed:")
      android.util.Log.d("MainActivity", "  - API Key: ${apiKey.take(20)}...")
      android.util.Log.d("MainActivity", "  - Country: $country")
      android.util.Log.d("MainActivity", "  - Language: $language")
      android.util.Log.d("MainActivity", "  - Card Type: $cardType")
      android.util.Log.d("MainActivity", "  - Saved Card Enable: $savedCardEnable")
      
      // Initialize Yuno SDK with application context and configuration
      YunoSdkModule.initializeYunoSdk(
        applicationContext = applicationContext,
        apiKey = apiKey,
        language = language,
        cardType = cardType,
        savedCardEnable = savedCardEnable
      )
      android.util.Log.d("MainActivity", "✅ Yuno SDK initialized successfully")
      
      // Navigate to YunoActivity, passing the country code
      val intent = Intent(this, YunoActivity::class.java).apply {
        putExtra("YUNO_COUNTRY_CODE", country)
        putExtra("YUNO_CONFIG_JSON", configJson)
      }
      startActivity(intent)
      
    } catch (e: org.json.JSONException) {
      android.util.Log.e("MainActivity", "❌ Invalid JSON format: ${e.message}", e)
      Toast.makeText(this, "Invalid JSON format: ${e.message}", Toast.LENGTH_LONG).show()
    } catch (e: Exception) {
      android.util.Log.e("MainActivity", "❌ Failed to initialize Yuno SDK: ${e.message}", e)
      Toast.makeText(this, "Failed to initialize Yuno SDK: ${e.message}", Toast.LENGTH_LONG).show()
    }
  }
}

