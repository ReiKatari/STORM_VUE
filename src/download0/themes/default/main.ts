import { lang, useImageText, textImageBase } from 'download0/languages'

(function () {
  include('languages.js')
  log('Loading modernized main menu...')

  let currentButton = 0
  const buttons: Image[] = []
  const buttonTexts: (Image | jsmaf.Text)[] = []
  const buttonMarkers: Image[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  jsmaf.root.children.length = 0

  // Modern Typography System
  new Style({ name: 'white', color: '#FFFFFF', size: 24 })
  new Style({ name: 'title', color: '#00F0FF', size: 36 })
  new Style({ name: 'subtitle', color: '#94A3B8', size: 20 })
  new Style({ name: 'badge', color: '#38BDF8', size: 18 })

  // Modern Dark Background
  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background)

  // Top Modern HUD Header
  const centerX = 960
  const logoWidth = 200
  const logoHeight = 200

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: centerX - logoWidth / 2,
    y: 35,
    width: logoWidth,
    height: logoHeight
  })
  jsmaf.root.children.push(logo)

  // Title & Header Subtitle Text
  const headerTitle = new jsmaf.Text()
  headerTitle.text = 'STORM VUE'
  headerTitle.x = centerX - 110
  headerTitle.y = 250
  headerTitle.style = 'title'
  jsmaf.root.children.push(headerTitle)

  const headerSubtitle = new jsmaf.Text()
  headerSubtitle.text = lang.subtitleMain || 'STORM CHANNEL • PS4 USERLAND & KERNEL EXPLOIT ENGINE (FW 7.00 - 13.00)'
  headerSubtitle.x = centerX - 370
  headerSubtitle.y = 300
  headerSubtitle.style = 'subtitle'
  jsmaf.root.children.push(headerSubtitle)

  const menuOptions = [
    { label: lang.jailbreak || 'Jailbreak', script: 'loader.js', imgKey: 'jailbreak' },
    { label: lang.payloadMenu || 'Payload Menu', script: 'payload_host.js', imgKey: 'payloadMenu' },
    { label: lang.config || 'Config', script: 'config_ui.js', imgKey: 'config' }
  ]

  const startY = 400
  const buttonSpacing = 110
  const buttonWidth = 460
  const buttonHeight = 85

  for (let i = 0; i < menuOptions.length; i++) {
    const btnX = centerX - buttonWidth / 2
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

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 45,
      y: btnY + buttonHeight / 2 - 10,
      width: 16,
      height: 16,
      visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker)

    let btnText: Image | jsmaf.Text
    if (useImageText) {
      btnText = new Image({
        url: textImageBase + menuOptions[i]!.imgKey + '.png',
        x: btnX + 30,
        y: btnY + 18,
        width: 320,
        height: 50
      })
    } else {
      btnText = new jsmaf.Text()
      btnText.text = menuOptions[i]!.label
      btnText.x = btnX + 40
      btnText.y = btnY + buttonHeight / 2 - 14
      btnText.style = 'white'
    }
    buttonTexts.push(btnText)
    jsmaf.root.children.push(btnText)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: btnText.x, y: btnText.y })
  }

  // Exit Button Card
  const exitX = centerX - buttonWidth / 2
  const exitY = startY + menuOptions.length * buttonSpacing + 20

  const exitButton = new Image({
    url: normalButtonImg,
    x: exitX,
    y: exitY,
    width: buttonWidth,
    height: buttonHeight
  })
  exitButton.alpha = 0.8
  buttons.push(exitButton)
  jsmaf.root.children.push(exitButton)

  const exitMarker = new Image({
    url: 'file:///assets/img/ad_pod_marker.png',
    x: exitX + buttonWidth - 45,
    y: exitY + buttonHeight / 2 - 10,
    width: 16,
    height: 16,
    visible: false
  })
  buttonMarkers.push(exitMarker)
  jsmaf.root.children.push(exitMarker)

  let exitText: Image | jsmaf.Text
  if (useImageText) {
    exitText = new Image({
      url: textImageBase + 'exit.png',
      x: exitX + 30,
      y: exitY + 18,
      width: 320,
      height: 50
    })
  } else {
    exitText = new jsmaf.Text()
    exitText.text = lang.exit || 'Exit'
    exitText.x = exitX + 40
    exitText.y = exitY + buttonHeight / 2 - 14
    exitText.style = 'white'
  }
  buttonTexts.push(exitText)
  jsmaf.root.children.push(exitText)

  buttonOrigPos.push({ x: exitX, y: exitY })
  textOrigPos.push({ x: exitText.x, y: exitText.y })

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
    const endScale = 1.08
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
    const startScale = btn.scaleX || 1.08
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
    const prevMarker = buttonMarkers[prevButton]
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj && prevMarker) {
      prevButtonObj.url = normalButtonImg
      prevButtonObj.alpha = 0.75
      prevButtonObj.borderColor = 'transparent'
      prevButtonObj.borderWidth = 0
      prevMarker.visible = false
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const buttonMarker = buttonMarkers[i]
      const buttonText = buttonTexts[i]
      const buttonOrigPos_ = buttonOrigPos[i]
      const textOrigPos_ = textOrigPos[i]
      if (!button || !buttonText || !buttonOrigPos_ || !textOrigPos_ || !buttonMarker) continue

      if (i === currentButton) {
        button.url = selectedButtonImg
        button.alpha = 1.0
        button.borderColor = 'rgb(0, 240, 255)'
        button.borderWidth = 3
        buttonMarker.visible = true
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
        buttonMarker.visible = false
      }
    }

    prevButton = currentButton
  }

  function handleButtonPress () {
    if (currentButton === buttons.length - 1) {
      include('includes/kill_vue.js')
    } else if (currentButton < menuOptions.length) {
      const selectedOption = menuOptions[currentButton]
      if (!selectedOption) return
      if (selectedOption.script === 'loader.js') {
        jsmaf.onKeyDown = function () {}
      }
      log('Loading ' + selectedOption.script + '...')
      try {
        if (selectedOption.script.includes('loader.js')) {
          include(selectedOption.script)
        } else {
          include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/' + selectedOption.script)
        }
      } catch (e) {
        log('ERROR loading ' + selectedOption.script + ': ' + (e as Error).message)
        if ((e as Error).stack) log((e as Error).stack!)
      }
    }
  }

  const confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14

  jsmaf.onKeyDown = function (keyCode) {
    if (keyCode === 6 || keyCode === 5) {
      currentButton = (currentButton + 1) % buttons.length
      updateHighlight()
    } else if (keyCode === 4 || keyCode === 7) {
      currentButton = (currentButton - 1 + buttons.length) % buttons.length
      updateHighlight()
    } else if (keyCode === confirmKey) {
      handleButtonPress()
    }
  }

  updateHighlight()
  log('Modern Main menu loaded.')
})()
