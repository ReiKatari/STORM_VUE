(function() {
    if (typeof libc_addr === 'undefined') {
        log("Loading userland.js...");
        include("userland.js");
        log("userland.js loaded");
    } else {
        log("userland.js already loaded (libc_addr defined)");
    }

    function isJailbroken() {
        try { fn.register(24, 'getuid', 'bigint') } catch(e) {}
        try { fn.register(23, 'setuid', 'bigint') } catch(e) {}

        var uid_before = fn.getuid()
        var uid_before_val = (uid_before instanceof BigInt) ? uid_before.lo : uid_before
        log('UID before setuid: ' + uid_before_val)

        log('Attempting setuid(0)...')
        var setuid_success = false
        var error_msg = null

        try {
            var setuid_result = fn.setuid(0)
            var setuid_ret = (setuid_result instanceof BigInt) ? setuid_result.lo : setuid_result
            log('setuid returned: ' + setuid_ret)
            setuid_success = (setuid_ret === 0)
        } catch(e) {
            error_msg = e.toString()
            log('setuid threw exception: ' + error_msg)
        }

        var uid_after = fn.getuid()
        var uid_after_val = (uid_after instanceof BigInt) ? uid_after.lo : uid_after
        log('UID after setuid: ' + uid_after_val)

        if (uid_after_val === 0) {
            log('Already jailbroken')
            return true
        } else {
            log('Not jailbroken')
            return false
        }
    }

    is_jailbroken = isJailbroken();

    jsmaf.root.children.length = 0;

    var currentButton = 0;
    var buttons = [];
    var buttonTexts = [];
    var buttonMarkers = [];
    var fileList = [];

    var normalButtonImg = "file:///assets/img/button_over_9.png";
    var selectedButtonImg = "file:///assets/img/button_over_9.png";

    var background = new Image({
        url: "file:///assets/img/multiview_bg.png",
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
    });
    jsmaf.root.children.push(background);

    var logo = new Image({
        url: "file:///assets/img/cobra_logo.png",
        x: 1620,
        y: 0,
        width: 300,
        height: 300
    });
    jsmaf.root.children.push(logo);

    if (typeof fn !== 'undefined') {
        if (!fn.open_sys) fn.register(0x05, 'open_sys', 'bigint');
        if (!fn.close_sys) fn.register(0x06, 'close_sys', 'bigint');
        if (!fn.getdents) fn.register(0x110, 'getdents', 'bigint');
    }

    log("Scanning /download0/payloads for files...");
    if (typeof fn !== 'undefined' && fn.getdents) {
        var path_addr = mem.malloc(256);
        for (var i = 0; i < "/download0/payloads".length; i++) {
            mem.view(path_addr).setUint8(i, "/download0/payloads".charCodeAt(i));
        }
        mem.view(path_addr).setUint8("/download0/payloads".length, 0);

        var fd = fn.open_sys(path_addr, new BigInt(0, 0), new BigInt(0, 0));
        log("open_sys returned: " + fd.toString());

        if (!fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
            var buf = mem.malloc(4096);
            var count = fn.getdents(fd, buf, new BigInt(0, 4096));
            log("getdents returned: " + count.toString() + " bytes");

            if (!count.eq(new BigInt(0xffffffff, 0xffffffff)) && count.lo > 0) {
                var offset = 0;
                while (offset < count.lo) {
                    var d_reclen = mem.view(buf.add(new BigInt(0, offset + 4))).getUint16(0, true);
                    var d_type = mem.view(buf.add(new BigInt(0, offset + 6))).getUint8(0);
                    var d_namlen = mem.view(buf.add(new BigInt(0, offset + 7))).getUint8(0);

                    var name = "";
                    for (var i = 0; i < d_namlen; i++) {
                        name += String.fromCharCode(mem.view(buf.add(new BigInt(0, offset + 8 + i))).getUint8(0));
                    }

                    log("Entry: " + name + " type=" + d_type + " namlen=" + d_namlen);

                    if (d_type === 8 && name !== "." && name !== "..") {
                        var lowerName = name.toLowerCase();
                        if (lowerName.endsWith('.elf') || lowerName.endsWith('.bin') || lowerName.endsWith('.js')) {
                            fileList.push(name);
                            log("Added file: " + name);
                        }
                    }

                    offset += d_reclen;
                }
            }
            fn.close_sys(fd);
        } else {
            log("Failed to open /download0/payloads");
        }
    }

    log("Total files found: " + fileList.length);

    var startY = 50;
    var buttonSpacing = 90;
    var buttonsPerRow = 3;
    var buttonWidth = 300;
    var buttonHeight = 80;
    var startX = 50;
    var xSpacing = 340;

    for (var i = 0; i < fileList.length; i++) {
        var row = Math.floor(i / buttonsPerRow);
        var col = i % buttonsPerRow;

        var btnX = startX + col * xSpacing;
        var btnY = startY + row * buttonSpacing;

        var button = new Image({
            url: normalButtonImg,
            x: btnX,
            y: btnY,
            width: buttonWidth,
            height: buttonHeight
        });
        buttons.push(button);
        jsmaf.root.children.push(button);

        var marker = new Image({
            url: "file:///assets/img/ad_pod_marker.png",
            x: btnX + buttonWidth - 50,
            y: btnY + 35,
            width: 12,
            height: 12,
            visible: false
        });
        buttonMarkers.push(marker);
        jsmaf.root.children.push(marker);

        var displayName = fileList[i];
        if (displayName.length > 20) {
            displayName = displayName.substring(0, 17) + "...";
        }

        var text = new Text({
            x: btnX + 20,
            y: btnY + 30,
            width: buttonWidth - 40,
            height: 40,
            text: displayName,
            color: "rgb(255,255,255)",
            background: "transparent",
            fontSize: 24
        });
        buttonTexts.push(text);
        jsmaf.root.children.push(text);
    }

    var exitX = 810;
    var exitY = 980;

    var exitButton = new Image({
        url: normalButtonImg,
        x: exitX,
        y: exitY,
        width: buttonWidth,
        height: buttonHeight
    });
    buttons.push(exitButton);
    jsmaf.root.children.push(exitButton);

    var exitMarker = new Image({
        url: "file:///assets/img/ad_pod_marker.png",
        x: exitX + buttonWidth - 50,
        y: exitY + 35,
        width: 12,
        height: 12,
        visible: false
    });
    buttonMarkers.push(exitMarker);
    jsmaf.root.children.push(exitMarker);

    var exitText = new Text({
        x: exitX + 110,
        y: exitY + 30,
        width: 80,
        height: 40,
        text: "Exit",
        color: "rgb(255,255,255)",
        background: "transparent",
        fontSize: 28
    });
    buttonTexts.push(exitText);
    jsmaf.root.children.push(exitText);

    function updateHighlight() {
        for (var i = 0; i < buttons.length; i++) {
            if (i === currentButton) {
                buttons[i].url = selectedButtonImg;
                buttons[i].alpha = 1.0;
                buttons[i].borderColor = "rgb(100,180,255)";
                buttons[i].borderWidth = 3;
                buttonTexts[i].color = "rgb(255,255,255)";
                buttonTexts[i].background = "transparent";
                buttonTexts[i].alpha = 1.0;
                buttonMarkers[i].visible = true;
            } else {
                buttons[i].url = normalButtonImg;
                buttons[i].alpha = 0.7;
                buttons[i].borderWidth = 0;
                buttonTexts[i].color = "rgb(255,255,255)";
                buttonTexts[i].background = "transparent";
                buttonTexts[i].alpha = 0.8;
                buttonMarkers[i].visible = false;
            }
        }
        log("Selected button: " + currentButton);
    }

    jsmaf.onKeyDown = function(keyCode) {
        log("Key pressed: " + keyCode);

        if (keyCode === 5) {
            currentButton = (currentButton + 1) % buttons.length;
            updateHighlight();
        }
        else if (keyCode === 7) {
            currentButton = (currentButton - 1 + buttons.length) % buttons.length;
            updateHighlight();
        }
        else if (keyCode === 6) {
            currentButton = (currentButton + 1) % buttons.length;
            updateHighlight();
        }
        else if (keyCode === 4) {
            currentButton = (currentButton - 1 + buttons.length) % buttons.length;
            updateHighlight();
        }
        else if (keyCode === 14) {
            handleButtonPress();
        }
        else if (keyCode === 13) {
            log("Going back to main menu...");
            try {
                include("serve.js.aes");
            } catch (e) {
                log("ERROR loading serve.js.aes: " + e.message);
                if (e.stack) log(e.stack);
            }
        }
    };

    function handleButtonPress() {
        if (currentButton === buttons.length - 1) {
            log("Exiting application...");
            try {
                if (typeof master === 'undefined' || typeof slave === 'undefined') {
                    log("userland.js not fully initialized, loading...");
                    include("userland.js");
                }

                if (!fn.getpid) fn.register(0x14, 'getpid', 'bigint');
                if (!fn.kill) fn.register(0x25, 'kill', 'bigint');

                var pid = fn.getpid();
                var pid_num = (pid instanceof BigInt) ? pid.lo : pid;
                log("Current PID: " + pid_num);
                log("Sending SIGKILL to PID " + pid_num);

                fn.kill(pid, new BigInt(0, 9));
            } catch (e) {
                log("ERROR during exit: " + e.message);
                if (e.stack) log(e.stack);
            }

            jsmaf.exit();
        } else if (currentButton < fileList.length) {
            var selectedFile = fileList[currentButton];
            var filePath = "/download0/payloads/" + selectedFile;

            log("Selected: " + selectedFile);

            try {
                if (selectedFile.toLowerCase().endsWith('.js')) {
                    log("Including JavaScript file: " + selectedFile);
                    include("payloads/" + selectedFile);
                } else {
                    if (!is_jailbroken) {
                        log("Not jailbroken, running lapse.js first...");
                        include("lapse.js");
                        lapse();
                        log("lapse.js completed");
                    }

                    log("Loading binloader.js...");
                    include("binloader.js");
                    log("binloader.js loaded successfully");

                    log("Initializing binloader...");
                    if (typeof binloader_init === 'function') {
                        binloader_init();
                    } else {
                        log("ERROR: binloader_init not defined");
                        return;
                    }

                    log("Loading payload from: " + filePath);

                    if (typeof bl_load_from_file === 'function') {
                        bl_load_from_file(filePath);
                    } else {
                        log("ERROR: bl_load_from_file not defined");
                    }
                }
            } catch (e) {
                log("ERROR: " + e.message);
                if (e.stack) log(e.stack);
            }
        }
    }

    updateHighlight();

    log("Interactive UI loaded!");
    log("Total elements: " + jsmaf.root.children.length);
    log("Buttons: " + buttons.length);
    log("Use arrow keys to navigate, Enter/X to select");
})();
