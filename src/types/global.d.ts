declare var is_jailbroken: boolean

declare var CONFIG: {
  autolapse?: boolean;
  autopoop?: boolean;
  autoclose?: boolean;
  autoclose_delay?: number;
  jb_behavior?: number;
  theme?: string;
} | undefined

declare var payloads: string[] | undefined

declare var debugging: {
  restart: () => void;
  info?: {
    memory: {
      available: number;
      available_dmem: number;
      available_libc: number;
    };
  };
} | undefined

declare function log (...args: any[]): void
declare function debug (...args: any[]): void
declare function include (file: string): void
declare function alert (msg: string): void
declare function setTimeout (handler: () => void, timeout: number): number
declare function clearTimeout (timerID: number): void

declare var kernel_offset: (typeof import('download0/kernel').ps4_kernel_offset_list[keyof typeof import('download0/kernel').ps4_kernel_offset_list]) & {
  PROC_FD?: number,
  PROC_PID?: number,
  PROC_VM_SPACE?: number,
  PROC_UCRED?: number,
  PROC_COMM?: number,
  PROC_SYSENT?: number,
  FILEDESC_OFILES?: number,
  SIZEOF_OFILES?: number,
  VMSPACE_VM_PMAP?: number,
  PMAP_CR3?: number,
  SO_PCB?: number,
  INPCB_PKTOPTS?: number,
  IP6PO_TCLASS?: number,
  IP6PO_RTHDR?: number,
} | null

declare class Image {
  url: string
  alpha: number
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  borderColor: string
  borderWidth: number
  background: string
  color: string
  scaleX: number
  scaleY: number

  constructor (options: {
    url: string
    x: number
    y: number
    width: number
    height: number
    visible?: boolean
  })
}

declare class Style {
  constructor (options: {
    name: string
    color: string
    size: number
  })
}

declare class Video {
  duration: number
  visible: boolean
  elapsed: number

  onOpen: () => void
  onerror: (err: string) => void
  onstatechange: (state: string) => void

  constructor (options: {
    x: number
    y: number
    width: number
    height: number
    visible: boolean
    autoplay: boolean
  })
  play (): void
  open (url: string): void
  close (): void
}

declare var bg_success: Image
declare var bg_fail: Image
