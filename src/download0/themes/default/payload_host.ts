import { fn, mem, BigInt } from 'download0/types'
import { binloader_init } from 'download0/binloader'
import { libc_addr } from 'download0/userland'
import { lang } from 'download0/languages'
import { checkJailbroken } from 'download0/check-jailbroken'

(function () {
  if (typeof libc_addr === 'undefined') {
    log('Loading userland.js...')
    include('userland.js')
    log('userland.js loaded')
  } else {
    log('userland.js already loaded (libc_addr defined)')
  }

  log('Loading check-jailbroken.js...')
  include('check-jailbroken.js')

  const is_jailbroken = checkJailbroken()

  jsmaf.root.children.length = 0

  new Style({ name: 'white', color: '#FFFFFF', size: 24 })
  new Style({ name: 'title', color: '#00F0FF', size: 36 })
  new Style({ name: 'subtitle', color: '#94A3B8', size: 20 })
  new Style({ name: 'badge', color: '#38BDF8', size: 16 })
  new Style({ name: 'net_status', color: '#10B981', size: 28 })

  let currentButton = 0
  const buttons: any[] = []
  const buttonTexts: jsmaf.Text[] = []
  const buttonMarkers: any[] = []
  const buttonOrigPos: { x: number, y: number }[] = []
  const textOrigPos: { x: number, y: number }[] = []

  type FileEntry = { name: string, path: string, source: string }
  const fileList: FileEntry[] = []

  // Add Network Payload Receiver entry at top
  fileList.push({
    name: lang.netReceiver || '📡 Network Receiver (Port 9020)',
    path: '__NETWORK_RECEIVER__',
    source: 'WEB'
  })

  const normalButtonImg = 'file:///assets/img/button_over_9.png'
  const selectedButtonImg = 'file:///assets/img/button_over_9.png'

  const background = new Image({
    url: 'file:///../download0/img/multiview_bg_VAF.png',
    x: 0,
    y: 0,
    width: 1920,
    height: 1080
  })
  jsmaf.root.children.push(background as any)

  const logo = new Image({
    url: 'file:///../download0/img/logo.png',
    x: 1680,
    y: 40,
    width: 150,
    height: 150
  })
  jsmaf.root.children.push(logo as any)

  const titleText = new jsmaf.Text()
  titleText.text = 'STORM VUE • ' + (lang.payloadTitle || 'МЕНЕДЖЕР ПЕЙЛОАДОВ')
  titleText.x = 100
  titleText.y = 70
  titleText.style = 'title'
  jsmaf.root.children.push(titleText)

  const subtitleText = new jsmaf.Text()
  subtitleText.text = lang.payloadSubtitle || 'ВЫБЕРИТЕ ПЕЙЛОАД ИЛИ ВКЛЮЧИТЕ СЕТЕВОЙ ПРИЁМНИК'
  subtitleText.x = 100
  subtitleText.y = 120
  subtitleText.style = 'subtitle'
  jsmaf.root.children.push(subtitleText)

  fn.register(0x05, 'open_sys', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x06, 'close_sys', ['bigint'], 'bigint')
  fn.register(0x110, 'getdents', ['bigint', 'bigint', 'bigint'], 'bigint')
  fn.register(0x03, 'read_sys', ['bigint', 'bigint', 'bigint'], 'bigint')

  const open_sys = fn.open_sys as unknown as (...args: any[]) => BigInt
  const read_sys = fn.read_sys as unknown as (...args: any[]) => BigInt
  const close_sys = fn.close_sys as unknown as (...args: any[]) => BigInt
  const getdents = fn.getdents as unknown as (...args: any[]) => BigInt

  const scanPaths = [
    { path: '/download0/payloads', source: 'INTERNAL' }
  ]

  if (is_jailbroken) {
    scanPaths.push({ path: '/data/payloads', source: 'HDD' })
  }

  log('Scanning paths: ' + scanPaths.map(p => p.path).join(', '))

  const path_addr = mem.malloc(256)
  const buf = mem.malloc(4096)

  for (const item of scanPaths) {
    const currentPath = item.path
    log('Scanning ' + currentPath + ' for files...')

    for (let i = 0; i < currentPath.length; i++) {
      mem.view(path_addr).setUint8(i, currentPath.charCodeAt(i))
    }
    mem.view(path_addr).setUint8(currentPath.length, 0)

    const fd = open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0))

    if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
      const count = getdents(fd, buf, new BigInt(0, 4096))

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

          if (d_type === 8 && name !== '.' && name !== '..') {
            const lowerName = name.toLowerCase()
            if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
              fileList.push({ name, path: currentPath + '/' + name, source: item.source })
              log('Added file: ' + name + ' from ' + currentPath)
            }
          }

          offset += d_reclen
        }
      }
      close_sys(fd)
    } else {
      log('Failed to open ' + currentPath)
    }
  }

  log('Total files found: ' + fileList.length)

  const startY = 190
  const buttonSpacing = 100
  const buttonsPerRow = 4
  const buttonWidth = 380
  const buttonHeight = 85
  const startX = 100
  const xSpacing = 420

  for (let i = 0; i < fileList.length; i++) {
    const row = Math.floor(i / buttonsPerRow)
    const col = i % buttonsPerRow

    let displayName = fileList[i]!.name

    const btnX = startX + col * xSpacing
    const btnY = startY + row * buttonSpacing

    const button = new Image({
      url: normalButtonImg,
      x: btnX,
      y: btnY,
      width: buttonWidth,
      height: buttonHeight
    })
    button.alpha = 0.8
    buttons.push(button)
    jsmaf.root.children.push(button as any)

    const marker = new Image({
      url: 'file:///assets/img/ad_pod_marker.png',
      x: btnX + buttonWidth - 35,
      y: btnY + buttonHeight / 2 - 8,
      width: 16,
      height: 16,
      visible: false
    })
    buttonMarkers.push(marker)
    jsmaf.root.children.push(marker as any)

    if (displayName.length > 28) {
      displayName = displayName.substring(0, 25) + '...'
    }

    const text = new jsmaf.Text()
    text.text = displayName
    text.x = btnX + 25
    text.y = btnY + buttonHeight / 2 - 12
    text.style = 'white'
    buttonTexts.push(text)
    jsmaf.root.children.push(text)

    buttonOrigPos.push({ x: btnX, y: btnY })
    textOrigPos.push({ x: text.x, y: text.y })
  }

  const backHint = new jsmaf.Text()
  backHint.text = jsmaf.circleIsAdvanceButton ? (lang.xToGoBack || 'Press X to return') : (lang.oToGoBack || 'Press O to return')
  backHint.x = 100
  backHint.y = 1000
  backHint.style = 'subtitle'
  jsmaf.root.children.push(backHint)

  let zoomInInterval: number | null = null
  let zoomOutInterval: number | null = null
  let prevButton = -1

  function easeInOut (t: number) {
    return (1 - Math.cos(t * Math.PI)) / 2
  }

  function animateZoomIn (btn: any, text: jsmaf.Text, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomInInterval) jsmaf.clearInterval(zoomInInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.0
    const endScale = 1.06
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

  function animateZoomOut (btn: any, text: jsmaf.Text, btnOrigX: number, btnOrigY: number, textOrigX: number, textOrigY: number) {
    if (zoomOutInterval) jsmaf.clearInterval(zoomOutInterval)
    const btnW = buttonWidth
    const btnH = buttonHeight
    const startScale = btn.scaleX || 1.06
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
    if (prevButton >= 0 && prevButton !== currentButton && prevButtonObj) {
      prevButtonObj.url = normalButtonImg
      prevButtonObj.alpha = 0.75
      prevButtonObj.borderColor = 'transparent'
      prevButtonObj.borderWidth = 0
      if (prevMarker) prevMarker.visible = false
      animateZoomOut(prevButtonObj, buttonTexts[prevButton]!, buttonOrigPos[prevButton]!.x, buttonOrigPos[prevButton]!.y, textOrigPos[prevButton]!.x, textOrigPos[prevButton]!.y)
    }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const buttonMarker = buttonMarkers[i]
      const buttonText = buttonTexts[i]
      const buttonOrigPos_ = buttonOrigPos[i]
      const textOrigPos_ = textOrigPos[i]
      if (!button || !buttonText || !buttonOrigPos_ || !textOrigPos_) continue

      if (i === currentButton) {
        button.url = selectedButtonImg
        button.alpha = 1.0
        button.borderColor = 'rgb(0, 240, 255)'
        button.borderWidth = 3
        if (buttonMarker) buttonMarker.visible = true
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
        if (buttonMarker) buttonMarker.visible = false
      }
    }

    prevButton = currentButton
  }

  function launchNetworkReceiverScreen () {
    log('Activating Web & Network Payload Receiver on port 9020...')
    jsmaf.root.children.length = 0

    jsmaf.root.children.push(background as any)
    jsmaf.root.children.push(logo as any)

    const netTitle = new jsmaf.Text()
    netTitle.text = 'STORM VUE • ' + (lang.netReceiver || 'СЕТЕВОЙ ПРИЁМНИК ПЕЙЛОАДОВ')
    netTitle.x = 100
    netTitle.y = 100
    netTitle.style = 'title'
    jsmaf.root.children.push(netTitle)

    const statusText = new jsmaf.Text()
    statusText.text = lang.listeningStatus || 'СЕРВЕР АКТИВЕН • ОЖИДАНИЕ ПЕЙЛОАДА НА ПОРТУ 9020...'
    statusText.x = 100
    statusText.y = 220
    statusText.style = 'net_status'
    jsmaf.root.children.push(statusText)

    const instrText = new jsmaf.Text()
    instrText.text = lang.netInstructions || 'Отправка через Netcat / веб: nc <IP_PS4> 9020 < payload.bin'
    instrText.x = 100
    instrText.y = 300
    instrText.style = 'subtitle'
    jsmaf.root.children.push(instrText)

    const backText = new jsmaf.Text()
    backText.text = jsmaf.circleIsAdvanceButton ? (lang.xToGoBack || 'Нажмите X для возврата') : (lang.oToGoBack || 'Нажмите O для возврата')
    backText.x = 100
    backText.y = 900
    backText.style = 'subtitle'
    jsmaf.root.children.push(backText)

    // Call binloader network receiver
    include('binloader.js')
    const { bl_network_loader } = binloader_init()
    jsmaf.setTimeout(function () {
      bl_network_loader()
    }, 200)
  }

  const confirmKey = jsmaf.circleIsAdvanceButton ? 13 : 14
  const backKey = jsmaf.circleIsAdvanceButton ? 14 : 13

  jsmaf.onKeyDown = function (keyCode) {
    const fileButtonCount = fileList.length

    if (keyCode === 6) {
      const nextButton = currentButton + buttonsPerRow
      if (nextButton < fileButtonCount) {
        currentButton = nextButton
      }
      updateHighlight()
    } else if (keyCode === 4) {
      const nextButton = currentButton - buttonsPerRow
      if (nextButton >= 0) {
        currentButton = nextButton
      }
      updateHighlight()
    } else if (keyCode === 5) {
      const nextButton = currentButton + 1
      const row = Math.floor(currentButton / buttonsPerRow)
      const nextRow = Math.floor(nextButton / buttonsPerRow)
      if (nextButton < fileButtonCount && nextRow === row) {
        currentButton = nextButton
      }
      updateHighlight()
    } else if (keyCode === 7) {
      const col = currentButton % buttonsPerRow
      if (col > 0) {
        currentButton = currentButton - 1
      }
      updateHighlight()
    } else if (keyCode === confirmKey) {
      handleButtonPress()
    } else if (keyCode === backKey) {
      log('Going back to main menu...')
      try {
        include('themes/' + (typeof CONFIG !== 'undefined' && CONFIG.theme ? CONFIG.theme : 'default') + '/main.js')
      } catch (e) {
        const err = e as Error
        log('ERROR loading main.js: ' + err.message)
        if (err.stack) log(err.stack)
      }
    }
  }

  function handleButtonPress () {
    if (currentButton < fileList.length) {
      const selectedEntry = fileList[currentButton]
      if (!selectedEntry) {
        log('No file selected!')
        return
      }

      if (selectedEntry.path === '__NETWORK_RECEIVER__') {
        launchNetworkReceiverScreen()
        return
      }

      const filePath = selectedEntry.path
      const fileName = selectedEntry.name

      log('Selected: ' + fileName + ' from ' + filePath)

      try {
        if (fileName.toLowerCase().endsWith('.js')) {
          if (filePath.startsWith('/download0/')) {
            log('Including JavaScript file: ' + fileName)
            include('payloads/' + fileName)
          } else {
            log('Reading external JavaScript file: ' + filePath)
            const p_addr = mem.malloc(256)
            for (let i = 0; i < filePath.length; i++) {
              mem.view(p_addr).setUint8(i, filePath.charCodeAt(i))
            }
            mem.view(p_addr).setUint8(filePath.length, 0)

            const fd = open_sys(p_addr, new BigInt(0, 0), new BigInt(0, 0))

            if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
              const buf_size = 1024 * 1024 * 1
              const buf = mem.malloc(buf_size)
              const read_len = read_sys(fd, buf, new BigInt(0, buf_size))
              close_sys(fd)

              let scriptContent = ''
              const len = (read_len instanceof BigInt) ? read_len.lo : read_len
              log('File read size: ' + len + ' bytes')

              for (let i = 0; i < len; i++) {
                scriptContent += String.fromCharCode(mem.view(buf).getUint8(i))
              }

              log('Executing via eval()...')
              // eslint-disable-next-line no-eval
              eval(scriptContent)
            } else {
              log('ERROR: Could not open file for reading!')
            }
          }
        } else {
          log('Loading binloader.js...')
          include('binloader.js')
          log('binloader.js loaded successfully')

          log('Initializing binloader...')
          const { bl_load_from_file } = binloader_init()

          log('Loading payload from: ' + filePath)
          bl_load_from_file(filePath)
        }
      } catch (e) {
        const err = e as Error
        log('ERROR: ' + err.message)
        if (err.stack) log(err.stack)
      }
    }
  }

  updateHighlight()
  log('Modern Payload Host UI loaded!')
})()
