(function() {
    log("=== Local Video Server ===");

    if (typeof libc_addr === 'undefined') {
        include('userland.js');
    }

    // Register socket syscalls
    try { fn.register(97, 'socket', 'bigint') } catch(e) {}
    try { fn.register(98, 'connect', 'bigint') } catch(e) {}
    try { fn.register(104, 'bind', 'bigint') } catch(e) {}
    try { fn.register(105, 'setsockopt', 'bigint') } catch(e) {}
    try { fn.register(106, 'listen', 'bigint') } catch(e) {}
    try { fn.register(30, 'accept', 'bigint') } catch(e) {}
    try { fn.register(32, 'getsockname', 'bigint') } catch(e) {}
    try { fn.register(3, 'read_sys', 'bigint') } catch(e) {}
    try { fn.register(4, 'write_sys', 'bigint') } catch(e) {}
    try { fn.register(6, 'close_sys', 'bigint') } catch(e) {}
    try { fn.register(5, 'open_sys', 'bigint') } catch(e) {}

    var socket_sys = fn.socket;
    var bind_sys = fn.bind;
    var setsockopt_sys = fn.setsockopt;
    var listen_sys = fn.listen;
    var accept_sys = fn.accept;
    var getsockname_sys = fn.getsockname;
    var read_sys = fn.read_sys;
    var write_sys = fn.write_sys;
    var close_sys = fn.close_sys;
    var open_sys = fn.open_sys;

    var AF_INET = 2;
    var SOCK_STREAM = 1;
    var SOL_SOCKET = 0xFFFF;
    var SO_REUSEADDR = 0x4;
    var O_RDONLY = 0;

    // Create server socket
    log('Creating HTTP server for video files...');
    var srv = socket_sys(new BigInt(0, AF_INET), new BigInt(0, SOCK_STREAM), new BigInt(0, 0));
    if (srv.lo < 0) throw new Error('Cannot create socket');

    // Set SO_REUSEADDR
    var optval = mem.malloc(4);
    mem.view(optval).setUint32(0, 1, true);
    setsockopt_sys(srv, new BigInt(0, SOL_SOCKET), new BigInt(0, SO_REUSEADDR), optval, new BigInt(0, 4));

    // Bind to port 9090
    var addr = mem.malloc(16);
    mem.view(addr).setUint8(0, 16);
    mem.view(addr).setUint8(1, AF_INET);
    mem.view(addr).setUint16(2, 0x7223, false); // port 9090 in network byte order
    mem.view(addr).setUint32(4, 0, false); // 0.0.0.0

    if (bind_sys(srv, addr, new BigInt(0, 16)).lo < 0) {
        close_sys(srv);
        throw new Error('Bind failed');
    }

    // Get actual port
    var actual_addr = mem.malloc(16);
    var actual_len = mem.malloc(4);
    mem.view(actual_len).setUint32(0, 16, true);
    getsockname_sys(srv, actual_addr, actual_len);
    var port = mem.view(actual_addr).getUint16(2, false);

    // Listen
    if (listen_sys(srv, new BigInt(0, 5)).lo < 0) {
        close_sys(srv);
        throw new Error('Listen failed');
    }

    log('HTTP server listening on port ' + port);
    log('Video URL: http://127.0.0.1:' + port + '/cat-meow.m3u8');

    // Setup UI
    jsmaf.root.children.length = 0;

    var background = new Image({
        url: "file:///../download0/img/multiview_bg_VAF.png",
        x: 0, y: 0, width: 1920, height: 1080
    });
    jsmaf.root.children.push(background);

    var statusText = new Text({
        x: 50, y: 50, width: 1820, height: 50,
        text: "Server: http://127.0.0.1:" + port + " | X=Start Video | Circle=Stop",
        color: "rgb(255,255,255)",
        background: "rgba(0,0,0,0.8)",
        fontSize: 24
    });
    jsmaf.root.children.push(statusText);

    var video = new Video({
        url: "http://127.0.0.1:" + port + "/cat-meow.m3u8",
        x: 310, y: 140, width: 1280, height: 720,
        visible: true,
        autoplay: false
    });
    jsmaf.root.children.push(video);

    var timeText = new Text({
        x: 50, y: 950, width: 1820, height: 50,
        text: "Press X to start playback",
        color: "rgb(255,255,255)",
        background: "transparent",
        fontSize: 24
    });
    jsmaf.root.children.push(timeText);

    video.onOpen = function() {
        log("Video opened! Duration: " + video.duration);
        statusText.text = "Video loaded! Playing...";
        video.play();
    };

    video.onerror = function(err) {
        log("Video error: " + JSON.stringify(err));
        statusText.text = "ERROR: " + JSON.stringify(err);
    };

    video.onstatechange = function(state) {
        log("Video state: " + state);
    };

    // Send HTTP response
    function send_response(fd, content_type, body) {
        var headers = 'HTTP/1.1 200 OK\r\n' +
                     'Content-Type: ' + content_type + '\r\n' +
                     'Content-Length: ' + body.length + '\r\n' +
                     'Access-Control-Allow-Origin: *\r\n' +
                     'Connection: close\r\n' +
                     '\r\n';

        var resp = headers + body;
        var buf = mem.malloc(resp.length);
        for (var i = 0; i < resp.length; i++) {
            mem.view(buf).setUint8(i, resp.charCodeAt(i));
        }
        write_sys(fd, buf, new BigInt(0, resp.length));
    }

    // Send binary file
    function send_file(fd, filepath, content_type) {
        // Open file
        var path_buf = mem.malloc(filepath.length + 1);
        for (var i = 0; i < filepath.length; i++) {
            mem.view(path_buf).setUint8(i, filepath.charCodeAt(i));
        }
        mem.view(path_buf).setUint8(filepath.length, 0);

        var file_fd = open_sys(path_buf, new BigInt(0, O_RDONLY), new BigInt(0, 0));
        if (file_fd.eq(new BigInt(0xffffffff, 0xffffffff))) {
            log("Cannot open file: " + filepath);
            var error = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\n\r\nNot Found";
            var error_buf = mem.malloc(error.length);
            for (var i = 0; i < error.length; i++) {
                mem.view(error_buf).setUint8(i, error.charCodeAt(i));
            }
            write_sys(fd, error_buf, new BigInt(0, error.length));
            return;
        }

        // Read file content
        var file_buf = mem.malloc(65536);
        var bytes_read = read_sys(file_fd, file_buf, new BigInt(0, 65536));
        close_sys(file_fd);

        if (bytes_read.lo <= 0) {
            log("Cannot read file: " + filepath);
            return;
        }

        // Build response string from buffer
        var body = '';
        for (var i = 0; i < bytes_read.lo; i++) {
            body += String.fromCharCode(mem.view(file_buf).getUint8(i));
        }

        send_response(fd, content_type, body);
        log("Sent " + filepath + " (" + bytes_read.lo + " bytes)");
    }

    // Parse request path
    function get_path(buf, len) {
        var req = '';
        for (var i = 0; i < len && i < 1024; i++) {
            var c = mem.view(buf).getUint8(i);
            if (c === 0) break;
            req += String.fromCharCode(c);
        }

        var lines = req.split('\n');
        if (lines.length > 0) {
            var parts = lines[0].trim().split(' ');
            if (parts.length >= 2) return parts[1];
        }
        return '/';
    }

    var serverRunning = true;
    var videoStarted = false;

    // Server loop in background
    function serverLoop() {
        if (!serverRunning) return;

        var client_addr = mem.malloc(16);
        var client_len = mem.malloc(4);
        mem.view(client_len).setUint32(0, 16, true);

        var client_ret = accept_sys(srv, client_addr, client_len);
        var client = client_ret instanceof BigInt ? client_ret.lo : client_ret;

        if (client >= 0) {
            var req_buf = mem.malloc(4096);
            var read_ret = read_sys(client, req_buf, new BigInt(0, 4096));
            var bytes = read_ret instanceof BigInt ? read_ret.lo : read_ret;

            if (bytes > 0) {
                var path = get_path(req_buf, bytes);
                log("Request: " + path);

                if (path === '/cat-meow.m3u8' || path.indexOf('/cat-meow.m3u8') >= 0) {
                    send_file(client, '/download0/vid/cat-meow.m3u8', 'application/vnd.apple.mpegurl');
                } else if (path === '/cat-meow0.ts' || path.indexOf('/cat-meow0.ts') >= 0) {
                    send_file(client, '/download0/vid/cat-meow0.ts', 'video/MP2T');
                } else {
                    send_response(client, 'text/plain', 'Video server running');
                }
            }

            close_sys(client);
        }
    }

    jsmaf.onEnterFrame = function() {
        // Handle one request per frame
        serverLoop();

        if (videoStarted && video.duration > 0) {
            timeText.text = "Time: " + video.elapsed.toFixed(1) + "s / " + video.duration.toFixed(1) + "s";
        }
    };

    jsmaf.onKeyDown = function(keyCode) {
        if (keyCode === 14) { // X - start video
            log("Opening video from local server...");
            videoStarted = true;
            video.open(video.url);
        } else if (keyCode === 13) { // Circle - exit
            serverRunning = false;
            video.close();
            close_sys(srv);
            include("main-menu.js");
        }
    };

    log("Server ready! Press X to start video playback.");
})();
