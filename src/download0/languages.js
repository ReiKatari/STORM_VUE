// Language translations
// Detected locale: jsmaf.locale

var lang = {}

var detectedLocale = jsmaf.locale || 'en'
log('Detected locale: ' + detectedLocale)

switch (detectedLocale) {
  case 'es':
    // Spanish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracion'
    lang.exit = 'Salir'
    lang.back = 'Volver'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.totalAttempts = 'Intentos Totales: '
    lang.successes = 'Exitos: '
    lang.failures = 'Fallos: '
    lang.successRate = 'Tasa de Exito: '
    lang.failureRate = 'Tasa de Fallo: '
    lang.loadingMainMenu = 'Cargando menu principal...'
    lang.mainMenuLoaded = 'Menu principal cargado'
    lang.loadingConfig = 'Cargando configuracion...'
    lang.configLoaded = 'Configuracion cargada'
    break

  case 'ar':
    // Arabic
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'قائمة الحمولات'
    lang.config = 'الاعدادات'
    lang.exit = 'خروج'
    lang.back = 'رجوع'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'اغلاق تلقائي'
    lang.totalAttempts = 'اجمالي المحاولات: '
    lang.successes = 'النجاحات: '
    lang.failures = 'الاخفاقات: '
    lang.successRate = 'معدل النجاح: '
    lang.failureRate = 'معدل الفشل: '
    lang.loadingMainMenu = '...جاري تحميل القائمة الرئيسية'
    lang.mainMenuLoaded = 'تم تحميل القائمة الرئيسية'
    lang.loadingConfig = '...جاري تحميل الاعدادات'
    lang.configLoaded = 'تم تحميل الاعدادات'
    break

  case 'ko':
    // Korean
    lang.jailbreak = '탈옥'
    lang.payloadMenu = '페이로드 메뉴'
    lang.config = '설정'
    lang.exit = '종료'
    lang.back = '뒤로'
    lang.autoLapse = '자동 Lapse'
    lang.autoPoop = '자동 Poop'
    lang.autoClose = '자동 닫기'
    lang.totalAttempts = '총 시도: '
    lang.successes = '성공: '
    lang.failures = '실패: '
    lang.successRate = '성공률: '
    lang.failureRate = '실패율: '
    lang.loadingMainMenu = '메인 메뉴 로딩중...'
    lang.mainMenuLoaded = '메인 메뉴 로딩 완료'
    lang.loadingConfig = '설정 로딩중...'
    lang.configLoaded = '설정 로딩 완료'
    break

  case 'ja':
    // Japanese
    lang.jailbreak = '脱獄'
    lang.payloadMenu = 'ペイロードメニュー'
    lang.config = '設定'
    lang.exit = '終了'
    lang.back = '戻る'
    lang.autoLapse = '自動Lapse'
    lang.autoPoop = '自動Poop'
    lang.autoClose = '自動終了'
    lang.totalAttempts = '試行回数: '
    lang.successes = '成功: '
    lang.failures = '失敗: '
    lang.successRate = '成功率: '
    lang.failureRate = '失敗率: '
    lang.loadingMainMenu = 'メインメニュー読み込み中...'
    lang.mainMenuLoaded = 'メインメニュー読み込み完了'
    lang.loadingConfig = '設定読み込み中...'
    lang.configLoaded = '設定読み込み完了'
    break

  case 'en':
  default:
    // English (default)
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload Menu'
    lang.config = 'Config'
    lang.exit = 'Exit'
    lang.back = 'Back'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Close'
    lang.totalAttempts = 'Total Attempts: '
    lang.successes = 'Successes: '
    lang.failures = 'Failures: '
    lang.successRate = 'Success Rate: '
    lang.failureRate = 'Failure Rate: '
    lang.loadingMainMenu = 'Loading main menu...'
    lang.mainMenuLoaded = 'Main menu loaded'
    lang.loadingConfig = 'Loading config UI...'
    lang.configLoaded = 'Config UI loaded'
    break
}

log('Language loaded: ' + detectedLocale)
