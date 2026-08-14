import { libc_addr } from 'download0/userland'
import { lang, useImageText, textImageBase } from 'download0/languages'
import { fn, mem, BigInt } from 'download0/types'

if (typeof libc_addr === 'undefined') {
  include('userland.js')
}

if (typeof lang === 'undefined') {
  include('languages.js')
}

(function () {
  log('Loading modern config UI...')

  const fs = {
    write: function (filename: string, content: string, callback: (error: Error | null) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'))
        }
      }
      xhr.open('POST', 'file://../download0/' + filename, true)
      xhr.send(content)
    },

    read: function (filename: string, callback: (error: Error | null, data?: string) => void) {
      const xhr = new jsmaf.XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && callback) {
          callback(xhr.status === 0 || xhr.status === 200 ? null : new Error('failed'), xhr.responseText)
        }
      }
      xhr.open('GET', 'file://../download0/' + filename, true)
      xhr.send()
    }
  }

  const currentConfig: {
    autolapse: boolean
    autopoop: boolean
    autoclose: boolean
    autoclose_delay: number
    jb_behavior: number
    theme: string
  } = {
    autolapse: false,
    autopoop: false,
    autoclose: false,
    autoclose_delay: 0,
    jb_behavior: 0,
    theme: 'default'
  }

  let userPayloads: string[] = []
  let configLoaded = false

  const jbBehaviorLabels = [lang.jbBehaviorAuto || 'Auto Detect', lang.jbBehaviorNetctrl || 'NetControl', lang.jbBehaviorLapse || 'Lapse']
  const jbBehaviorImgKeys = ['jbBehaviorAuto', 'jbBehaviorNetctrl', 'jbBehaviorLapse']

  function scanThemes (): string[] {
    const themes: string[] = []
    try {
      fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
      fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
      fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')

      const themesDir = '/download0/themes'
      const path_addr = mem.malloc(256)
      const buf = mem.malloc(4096)

      for (let i = 0; i < themesDir.length; i++) {
        mem.view(path_addr).setUint8(i, themesDir.charCodeAt(i))
      }
      mem.view(path_addr).setUint8(themesDir.length, 0)

      const fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0))
      if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
        const count = fn.getdents(fd, buf, new BigInt(0, 4096))
        if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
          let offset = 0
          while (offset < count.lo) {
            const d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true)
            const d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0)
            const d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0)
            let name = ''
            for (let i = 0; i < d_namlen; i++) {
              name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + i))).getUint8(0))
            }
            if (d_type === 4 && name !== '.' && name !== '..') {
              themes.push(name)
            }
            offset += d_reclen
          }
        }
        fn.close_sys(fd)
      }
    } catch (e) {
      log('Theme scan failed: ' + (e as Error).message)
    }

    const idx = themes.indexOf('default')
    if (idx > 0) {
      themes.splice(idx, 1)
      themes.unshift('default')
    } else if (idx < 0) {
      themes.unshift('default')
    }

    return themes
  }

  const availableThemes = scanThemes()
  log('Discovered themes: ' + availableThemes.join(', '))
  const themeLabels: string[] = availableThemes.map((theme: string) => theme.charAt(0).toUpperCase() + theme.slice(1))

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: (Image | jsmaf.Text)[] = []
  const buttonMarkers: (Image | null)[] = []
  const buttonOrigPos: { x: number; y: number }[] = []
  const textOrigPos: { x: number; y: number }[] = []
  const valueTexts: (Image | jsmaf.Text)[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: '#FFFFFF', size: 24 })
  new Style({ name: 'title', color: '#00F0FF', size: 36 })
  new Style({ name: 'subtitle', color: '#94A3B8', size: 20 })
  new Style({ name: 'value', color: '#38BDF8', size: 24 })

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1680,
    y: 40,
    width: 150,
    height: 150
  })
  jsmaf.root.children.push(logo)

  const titleText = new jsmaf.Text()
  titleText.text = 'STORM VUE • ' + (lang.configTitle || 'НАСТРОЙКИ СИСТЕМЫ')
  titleText.x = 160
  titleText.y = 80
  titleText.style = 'title'
  jsmaf.root.children.push(titleText)

  const configOptions = [
    { key: 'autolapse', label: lang.autoLapse || 'Auto Lapse', imgKey: 'autoLapse', type: 'toggle' },
    { key: 'autopoop', label: lang.autoPoop || 'Auto Poop', imgKey: 'autoPoop', type: 'toggle' },
    { key: 'autoclose', label: lang.autoClose || 'Auto Close', imgKey: 'autoClose', type: 'toggle' },
    { key: 'jb_behavior', label: lang.jbBehavior || 'JB Behavior', imgKey: 'jbBehavior', type: 'cycle' },
    { key: 'theme', label: lang.theme || 'Theme', imgKey: 'theme', type: 'cycle' }
  ]

  const startX = 160
  const startY = 180
  const buttonSpacing = 110
  const buttonWidth = 800
  const buttonHeight = 85

  for (let i = 0; i < configOptions.length; i++) {
    const configOption = configOptions[i]!
    const btnX = startX
    const btnY = startY + i * buttonSpacing

    const button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    button.alpha = 0.8
    buttons.push(button)
    jsmaf.root.children.push(button)

    buttonMarkers.push(null)

    let btnText: Image | jsmaf.Text
    if (useImageText && configOption.imgKey !== 'theme') {
      btnText = new Image({
        url: textImageBase + configOption.imgKey + '.png',
        x: btnX + 30,
        y: btnY + 18,
        width: 250,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = configOption.label
      btnText.x = btnX + 40
      btnText.y = btnY + buttonHeight / 2 - 14
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    if (configOption.type === 'toggle') {
      const checkmark = new Image({
        url: currentConfig[configOption.key as keyof typeof currentConfig] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png',
        x: btnX + buttonWidth - 80,
        y: btnY + 22,
        width: 40,
        height: 40
      })
      valueTexts.push(checkmark)
      jsmaf.root.children.push(checkmark)
    } else {
      let valueLabel: Image | jsmaf.Text
      if (configOption.key === 'jb_behavior') {
        valueLabel = new jsmaf.Text()
        valueLabel.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
        valueLabel.x = btnX + buttonWidth - 260
        valueLabel.y = btnY + buttonHeight / 2 - 14
        valueLabel.style = 'value'
      } else {
        valueLabel = new jsmaf.Text()
        valueLabel.text = themeLabels[availableThemes.indexOf(currentConfig.theme)] || currentConfig.theme
        valueLabel.x = btnX + buttonWidth - 260
        valueLabel.y = btnY + buttonHeight / 2 - 14
        valueLabel.style = 'value'
      }
      valueTexts.push(valueLabel)
      jsmaf.root.children.push(valueLabel)
    }

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // Footer Navigation Bar
  const backHelpText = new jsmaf.Text()
  backHelpText.text = (lang.xToGoBack || 'X/O to Save & Back')
  backHelpText.x = startX
  backHelpText.y = 800
  backHelpText.style = 'subtitle'
  jsmaf.root.children.push(backHelpText)

  let zoomInInterval: number | null = null
  let zoomOutInterval: number | null = null
  let prevButton = -1

  function easeInOut (t: number) {
    return (1 - Math.cos(t * Math.PI)) / 2
  }

  function animateZoomIn (btn: Image, text: jsmaf.Text | Image, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.0
    const endScale = 1.05
    const duration = 150
    let elapsed = 0
    const step = 16

    zoomInInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1)
      const eased = easeInOut(t)
      const scale = startScale + (endScale - startScale) * eased

      btn.scaleX = scale
      btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2
      btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale
      text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2
      text.y = textOrigY - (btnH * (scale - 1)) / 2

      if (t >= 1 && zoomInInterval) {
        jsmaf.clearInterval(zoomInInterval)
        zoomInInterval = null
      }
    }, step)
  }

  function animateZoomOut (btn: Image, text: jsmaf.Text | Image, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.05
    const endScale = 1.0
    const duration = 150
    let elapsed = 0
    const step = 16

    zoomOutInterval = jsmaf.setInterval(function () {
      elapsed += step
      const t = Math.min(elapsed / duration, 1)
      const eased = easeInOut(t)
      const scale = startScale + (endScale - startScale) * eased

      btn.scaleX = scale
      btn.scaleY = scale
      btn.x = btnOrigX - (btnW * (scale - 1)) / 2
      btn.y = btnOrigY - (btnH * (scale - 1)) / 2
      text.scaleX = scale
      text.scaleY = scale
      text.x = textOrigX - (btnW * (scale - 1)) / 2
      text.y = textOrigY - (btnH * (scale - 1)) / 2

      if (t >= 1 && zoomOutInterval) {
        jsmaf.clearInterval(zoomOutInterval)
        zoomOutInterval = null
      }
    }, step)
  }

  function updateHighlight () {
    const prevButtonObj = buttons[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj) {
      prevButtonObj.url = normalButtonImg
      prevButtonObj.alpha = 0.75
      prevButtonObj.borderColor = 'transparent'
      prevButtonObj.borderWidth = 0
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const buttonText = buttonTexts[i]
      const buttonOrigPos_ = buttonOrigPos[i]
      const textOrigPos_ = textOrigPos[i]
      if (!button || !buttonText || !buttonOrigPos_ || !textOrigPos_) continue

      if (i === currentButton) {
        button.url = selectedButtonImg
        button.alpha = 1.0
        button.borderColor = 'rgb(0, 240, 255)'
        button.borderWidth = 3
        animateZoomIn(button, buttonText, buttonOrigPos_.x, buttonOrigPos_.y, textOrigPos_.x, textOrigPos_.y)
      } else if (i !== prevButton) {
        button.url = normalButtonImg
        button.alpha = 0.75
        button.borderColor = 'transparent'
        button.borderWidth = 0
        button.scaleX = 1.0
        button.scaleY = 1.0
        button.x = buttonOrigPos_.x
        button.y = buttonOrigPos_.y
        buttonText.scaleX = 1.0
        buttonText.scaleY = 1.0
        buttonText.x = textOrigPos_.x
        buttonText.y = textOrigPos_.y
      }
    }

    prevButton = currentButton
  }

  function updateValueText (index: number) {
    const option = configOptions[index]!
    const valueText = valueTexts[index]!

    if (option.type === 'toggle') {
      const checkmark = valueText as Image
      checkmark.url = currentConfig[option.key as keyof typeof currentConfig] ? 'file:///assets/img/check_small_on.png' : 'file:///assets/img/check_small_off.png'
    } else {
      const textObj = valueText as jsmaf.Text
      if (option.key === 'jb_behavior') {
        textObj.text = jbBehaviorLabels[currentConfig.jb_behavior] || jbBehaviorLabels[0]!
      } else if (option.key === 'theme') {
        textObj.text = themeLabels[availableThemes.indexOf(currentConfig.theme)] || currentConfig.theme
      }
    }
  }

  function saveConfig () {
    if (!configLoaded) return

    const configData = {
      config: {
        autolapse: currentConfig.autolapse,
        autopoop: currentConfig.autopoop,
        autoclose: currentConfig.autoclose,
        autoclose_delay: currentConfig.autoclose_delay,
        jb_behavior: currentConfig.jb_behavior,
        theme: currentConfig.theme
      },
      payloads: userPayloads
    }

    const configContent = JSON.stringify(configData, null, 2)

    fs.write('config.json', configContent, function (err) {
      if (err) {
        log('ERROR: Failed to save config: ' + err.message)
      } else {
        log('Config saved successfully')
      }
    })
  }

  function loadConfig () {
    fs.read('config.json', function (err: Error | null, data?: string) {
      if (err) {
        log('ERROR: Failed to read config: ' + err.message)
        return
      }

      try {
        const configData = JSON.parse(data || '{}')

        if (configData.config) {
          const CONFIG = configData.config

          currentConfig.autolapse = CONFIG.autolapse || false
          currentConfig.autopoop = CONFIG.autopoop || false
          currentConfig.autoclose = CONFIG.autoclose || false
          currentConfig.autoclose_delay = CONFIG.autoclose_delay || 0
          currentConfig.jb_behavior = CONFIG.jb_behavior || 0

          if (CONFIG.theme && availableThemes.includes(CONFIG.theme)) {
            currentConfig.theme = CONFIG.theme
          } else {
            currentConfig.theme = availableThemes[0] || 'default'
          }

          if (configData.payloads && Array.isArray(configData.payloads)) {
            userPayloads = configData.payloads.slice()
          }

          for (let i = 0; i < configOptions.length; i++) {
            updateValueText(i)
          }
          configLoaded = true
          log('Config loaded successfully')
        }
      } catch (e) {
        log('ERROR: Failed to parse config: ' + (e as Error).message)
        configLoaded = true
      }
    })
  }

  function handleButtonPress () {
    if (currentButton < configOptions.length) {
      const option = configOptions[currentButton]!
      const key = option.key

      if (option.type === 'cycle') {
        if (key === 'jb_behavior') {
          currentConfig.jb_behavior = (currentConfig.jb_behavior + 1) % jbBehaviorLabels.length
          log(key + ' = ' + jbBehaviorLabels[currentConfig.jb_behavior])
        } else if (key === 'theme') {
          const themeIndex = availableThemes.indexOf(currentConfig.theme)
          const displayIndex = themeIndex >= 0 ? themeIndex : 0
          const nextIndex = (displayIndex + 1) % availableThemes.length
          currentConfig.theme = availableThemes[nextIndex]!
          log(key + ' = ' + currentConfig.theme)
        }
      } else {
        const boolKey = key as 'autolapse' | 'autopoop' | 'autoclose'
        currentConfig[boolKey] = !currentConfig[boolKey]

        if (key === 'autolapse' && currentConfig.autolapse === true) {
          currentConfig.autopoop = false
          for (let i = 0; i < configOptions.length; i++) {
            if (configOptions[i]!.key === 'autopoop') {
              updateValueText(i)
              break
            }
          }
        } else if (key === 'autopoop' && currentConfig.autopoop === true) {
          currentConfig.autolapse = false
          for (let i = 0; i < configOptions.length; i++) {
            if (configOptions[i]!.key === 'autolapse') {
              updateValueText(i)
              break
            }
          }
        }
        log(key + ' = ' + currentConfig[boolKey])
      }

      updateValueText(currentButton)
      saveConfig()
    }
  }

  const confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14
  const backKey = jsmaf.circleIsAdvanceButton ? 14 : 13

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length
      updateHighlight()
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length
      updateHighlight()
    } else if (keyCode === confirmKey) {
      handleButtonPress()
    } else if (keyCode === backKey) {
      log('Saving and exiting settings...')
      saveConfig()
      jsmaf.setTimeout(function () {
        debugging.restart()
      }, 100)
    }
  }

  updateHighlight()
  loadConfig()
  log('Modern Config UI loaded.')
})()
