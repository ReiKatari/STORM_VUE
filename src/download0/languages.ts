// Language translations
// Detected locale: jsmaf.locale

export const lang: Record<string, string> = {
  jailbreak: 'Jailbreak',
  payloadMenu: 'Payload Menu',
  config: 'Config',
  exit: 'Exit',
  autoLapse: 'Auto Lapse',
  autoPoop: 'Auto Poop',
  autoClose: 'Auto Close',
  jbBehavior: 'JB Behavior',
  jbBehaviorAuto: 'Auto Detect',
  jbBehaviorNetctrl: 'NetControl',
  jbBehaviorLapse: 'Lapse',
  theme: 'Theme',
  xToGoBack: 'Press X to return',
  oToGoBack: 'Press O to return',
  subtitleMain: 'STORM CHANNEL • PS4 USERLAND & KERNEL EXPLOIT ENGINE (FW 7.00 - 13.00)',
  payloadSubtitle: 'SELECT PAYLOAD TO EXECUTE (.BIN / .ELF / .JS)',
  configTitle: 'SYSTEM CONFIGURATION',
  payloadTitle: 'PAYLOAD HOST & INJECTOR',
  netReceiver: 'Network Payload Receiver (Port 9020 / Web)',
  netReceiverSub: 'Send .bin / .elf payloads over WiFi/LAN from PC or Phone',
  listeningStatus: 'SERVER ACTIVE • WAITING FOR PAYLOAD ON PORT 9020...',
  netInstructions: 'Send payload via Netcat: nc <PS4_IP> 9020 < payload.bin'
}

export let useImageText = false
export let textImageBase = ''

let detectedLocale = jsmaf.locale
if (!detectedLocale) {
  detectedLocale = 'ru'
}

log('Detected locale: ' + detectedLocale)

const IMAGE_TEXT_LOCALES = ['ar', 'de', 'ja', 'ko', 'zh']
if (IMAGE_TEXT_LOCALES.includes(detectedLocale)) {
  useImageText = true
  textImageBase = 'file:///../download0/img/text/' + detectedLocale + '/'
}

switch (detectedLocale) {
  case 'ru':
  case 'ru-RU':
  case 'ru-BY':
  case 'ru-KZ':
  case 'ru-UA':
    // Russian
    lang.jailbreak = 'Взлом (Jailbreak)'
    lang.payloadMenu = 'Меню пейлоадов'
    lang.config = 'Настройки'
    lang.exit = 'Выход'
    lang.autoLapse = 'Авто Lapse'
    lang.autoPoop = 'Авто Poop'
    lang.autoClose = 'Авто закрытие'
    lang.jbBehavior = 'Режим взлома'
    lang.jbBehaviorAuto = 'Авто определение'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Тема оформления'
    lang.xToGoBack = 'Нажмите X для возврата'
    lang.oToGoBack = 'Нажмите O для возврата'
    lang.subtitleMain = 'STORM CHANNEL • ДВИЖОК ВЗЛОМА PS4 (ПО 7.00 - 13.00)'
    lang.payloadSubtitle = 'ВЫБЕРИТЕ ПЕЙЛОАД ИЛИ ВКЛЮЧИТЕ СЕТЕВОЙ ПРИЕМНИК'
    lang.configTitle = 'НАСТРОЙКИ СИСТЕМЫ'
    lang.payloadTitle = 'МЕНЕДЖЕР ПЕЙЛОАДОВ'
    lang.netReceiver = '📡 Сетевой приёмник (Порт 9020 / Web)'
    lang.netReceiverSub = 'Дистанционная отправка пейлоадов с ПК или смартфона'
    lang.listeningStatus = 'СЕРВЕР АКТИВЕН • ОЖИДАНИЕ ПЕЙЛОАДА НА ПОРТУ 9020...'
    lang.netInstructions = 'Отправка через Netcat / веб: nc <IP_PS4> 9020 < payload.bin'
    break

  case 'es':
  case 'es-ES':
  case 'es-CL':
  case 'es-419':
  case 'es-MX':
  case 'es-AR':
    // Spanish
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracion'
    lang.exit = 'Salir'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto Cerrar'
    lang.jbBehavior = 'Comportamiento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'X para volver'
    lang.oToGoBack = 'O para volver'
    lang.subtitleMain = 'STORM CHANNEL • MOTOR DE EXPLOIT PS4 (FW 7.00 - 13.00)'
    lang.payloadSubtitle = 'SELECCIONE EL PAYLOAD O ACTIVE EL RECEPTOR DE RED'
    lang.configTitle = 'CONFIGURACIÓN DEL SISTEMA'
    lang.payloadTitle = 'GESTOR DE PAYLOADS'
    lang.netReceiver = '📡 Receptor de Red (Puerto 9020 / Web)'
    lang.netReceiverSub = 'Enviar payloads desde PC o celular por red'
    lang.listeningStatus = 'SERVIDOR ACTIVO • ESPERANDO PAYLOAD EN PUERTO 9020...'
    lang.netInstructions = 'Enviar con Netcat: nc <IP_PS4> 9020 < payload.bin'
    break

  case 'pt':
    // Portuguese
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu de Payloads'
    lang.config = 'Configuracao'
    lang.exit = 'Sair'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fechar Auto'
    lang.jbBehavior = 'Comportamento JB'
    lang.jbBehaviorAuto = 'Auto Detectar'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Tema'
    lang.xToGoBack = 'X para voltar'
    lang.oToGoBack = 'O para voltar'
    break

  case 'fr':
    // French
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Menu Payload'
    lang.config = 'Configuration'
    lang.exit = 'Quitter'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Fermer Auto'
    lang.jbBehavior = 'Comportement JB'
    lang.jbBehaviorAuto = 'Auto Detecter'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thème'
    lang.xToGoBack = 'X pour retourner'
    lang.oToGoBack = 'O pour retourner'
    break

  case 'de':
    // German
    lang.jailbreak = 'Jailbreak'
    lang.payloadMenu = 'Payload-Menü'
    lang.config = 'Einstellungen'
    lang.exit = 'Beenden'
    lang.autoLapse = 'Auto Lapse'
    lang.autoPoop = 'Auto Poop'
    lang.autoClose = 'Auto schließen'
    lang.jbBehavior = 'JB-Verhalten'
    lang.jbBehaviorAuto = 'Automatisch'
    lang.jbBehaviorNetctrl = 'NetControl'
    lang.jbBehaviorLapse = 'Lapse'
    lang.theme = 'Thema'
    lang.xToGoBack = 'X zum Zurückgehen'
    lang.oToGoBack = 'O zum Zurückgehen'
    break

  case 'en':
  default:
    break
}

log('Language loaded: ' + detectedLocale)
