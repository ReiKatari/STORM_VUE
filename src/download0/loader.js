// Load binloader first (just defines the function, doesn't execute)

// Now load userland and lapse
    // Check if libc_addr is defined
    if (typeof libc_addr === 'undefined') {
        include('userland.js')
    }

include('binloader.js')
include('lapse.js')
function show_success(){
    
        jsmaf.root.children.push(bg_success);

    }

function isJailbroken() {
  // Register syscalls
  try { fn.register(24, 'getuid', 'bigint') } catch(e) {}
  try { fn.register(23, 'setuid', 'bigint') } catch(e) {}

  // Get current UID
  var uid_before = fn.getuid()
  var uid_before_val = (uid_before instanceof BigInt) ? uid_before.lo : uid_before
  log('UID before setuid: ' + uid_before_val)

  // Try to set UID to 0 (root) - catch EPERM if not jailbroken
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

  // Get UID after setuid attempt
  var uid_after = fn.getuid()
  var uid_after_val = (uid_after instanceof BigInt) ? uid_after.lo : uid_after
  log('UID after setuid: ' + uid_after_val)

  if (uid_after_val === 0) {
    log('already jailbroke')
    return true
  } else {
    log('not jailbroken')
    return false
  }
}

var is_jailbroken = isJailbroken()

// Check if lapse.js has completed successfully
function is_lapse_complete() {


    // Check if kernel object exists with read/write functions
    if (typeof kernel === 'undefined' || !kernel.read_qword || !kernel.write_qword) {
        return false;
    }

    // Check if we're actually jailbroken
    if (typeof getuid !== 'undefined' && typeof is_in_sandbox !== 'undefined') {
        try {
            var uid = getuid();
            var sandbox = is_in_sandbox();
            // Should be root (uid=0) and not sandboxed (0)
            if (!uid.eq(0) || !sandbox.eq(0)) {
                return false;
            }
        } catch(e) {
            return false;
        }
    }

    return true;
}



if(!is_jailbroken){
    
    // Wait for lapse to complete, then load binloader
log("Waiting for lapse.js to complete...");
    lapse()

var start_time = Date.now();
var max_wait_seconds = 5;
var max_wait_ms = max_wait_seconds * 1000;

while (!is_lapse_complete()) {
    var elapsed = Date.now() - start_time;

    if (elapsed > max_wait_ms) {
        log("ERROR: Timeout waiting for lapse.js to complete (" + max_wait_seconds + " seconds)");
        throw new Error("Lapse timeout");
    }

    // Poll every 500ms
    var poll_start = Date.now();
    while (Date.now() - poll_start < 500) {
        // Busy wait
    }
}
show_success();
var total_wait = ((Date.now() - start_time) / 1000).toFixed(1);
log("Lapse completed successfully after " + total_wait + " seconds");

}else {
    utils.notify('Already Jailbroken!')
}


log("Initializing binloader...");

try {
    binloader_init();
    log("Binloader initialized and running!");
    log("Starting AIO FIX...");
} catch(e) {
    log("ERROR: Failed to initialize binloader");
    log("Error message: " + e.message);
    log("Error name: " + e.name);
    if (e.stack) {
        log("Stack trace: " + e.stack);
    }
    throw e;
}

