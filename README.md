<p align="center">
  <img width="200" height="200" alt="STORM VUE Icon" src="https://raw.githubusercontent.com/ReiKatari/STORM_VUE/main/media/storm_vue_icon.png" />
</p>

<h1 align="center">⚡ STORM VUE ⚡</h1>

<p align="center">
  <b>Modernized, High-Performance Exploit Host & Payload Launcher for PlayStation 4</b><br>
  <i>Developed & Maintained by <a href="https://rutube.ru/channel/42609927/">STORM CHANNEL</a></i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-PS4%20(FW%207.00--13.00)-00F0FF?style=for-the-badge&logo=playstation" alt="PS4">
  <img src="https://img.shields.io/badge/Language-TypeScript%20%7C%20JSMAF-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/UI-60FPS%20Glassmorphism-0EA5E9?style=for-the-badge" alt="UI">
  <a href="https://rutube.ru/channel/42609927/">
    <img src="https://img.shields.io/badge/Rutube-STORM%20CHANNEL-FF0000?style=for-the-badge&logo=youtube" alt="Rutube">
  </a>
</p>

---

## ✨ Ключевые особенности и доработки (Features)

- 🎨 **Современный Dark Glassmorphism интерфейс**:
  - Плавная 60 FPS анимация зума карточек и неоновая подсветка (`#00F0FF`).
  - Полная поддержка контроллеров DualShock 4 для всех регионов (автоопределение кнопок подтверждения $\times$ / $\bigcirc$).
- 🧠 **Оптимизация памяти (RAM)**:
  - Полностью удален аудио-балласт `bgm.wav` (-27.5 МБ) для предотвращения сбоев сборщика мусора (GC).
  - Принудительная очистка массивов кучи в `userland.ts` сразу после инициализации памяти (экономия 8–12 МБ RAM).
- 🌐 **Полная русская локализация**:
  - Все меню, подсказки геймпада, названия параметров и статусы переведены на русский язык с поддержкой переключения языков.
- 📡 **Сетевой приёмник пейлоадов (Web & Network Receiver)**:
  - Встроенный сервер на **порту 9020** (Netcat) и **порту 40404** (WebSocket) для отправки `.bin` / `.elf` / `.js` файлов с ПК или смартфона без флешек.
- ⚡ **Вшитый GoldHEN v2.4b18.10**:
  - Приоритетная поддержка автозагрузки вшитого пейлоада из локальной памяти.

---

## 📋 Таблица совместимости (Firmware Scope)

| Эксплойт | Поддерживаемые версии ПО PS4 |
| :--- | :--- |
| **STORM VUE (Userland)** | **5.05 – 13.04** |
| **Lapse (Kernel EX)** | **7.00 – 12.02** |
| **NetControl / Poopsploit (Kernel EX)** | **12.50 – 13.00** |

---

## 🛠️ Сборка проекта (Build Instructions)

### Требования:
- **Node.js** v18+ или новее
- **npm**

### Команды:

1. **Установка зависимостей**:
   ```bash
   npm install
   ```

2. **Компиляция проекта**:
   ```bash
   npm run build
   ```
   *Babel скомпилирует все TypeScript файлы из `src/`, а скрипт `tools/copy_assets.js` автоматически перенесет ресурсы, графику и темы в папку `dist/`.*

---

## 📁 Структура репозитория (Project Structure)

```text
STORM_VUE/
├── media/                     # Медиа-ресурсы документации
│   └── icon.png               # Официальный логотип STORM VUE
├── src/
│   ├── download0/             # Ядро приложения JSMAF
│   │   ├── img/               # Графика и логотипы
│   │   ├── payloads/          # Встроенные пейлоады (GoldHEN, FTP, Fake-SignIn)
│   │   ├── themes/            # Темы оформления (default и кастомные)
│   │   ├── binloader.ts       # Загрузчик пейлоадов и сокет-сервер
│   │   ├── languages.ts       # Модуль мультиязычной локализации
│   │   ├── loader.ts          # Главный инициализатор
│   │   └── userland.ts        # Примитивы памяти и WebKit UAF
│   ├── icon/                  # Иконка приложения (icon0.png)
│   └── types/                 # TypeScript типизация
├── tools/                     # Вспомогательные скрипты сборки
├── package.json
└── tsconfig.json
```

---

## 📡 Отправка пейлоадов по сети

Для передачи файлов через сетевой приёмник:

- **Через Netcat (ПК / Linux / macOS)**:
  ```bash
  nc -w 3 <IP_PS4> 9020 < payload.bin
  ```
- **Через комплектный скрипт WebSocket**:
  ```bash
  python src/ws.py <IP_PS4>
  ```

---

## 👤 Авторы и благодарности (Credits)

- **STORM CHANNEL**: [Rutube Канал](https://rutube.ru/channel/42609927/) — Ребрендинг, дизайн, оптимизация памяти, русская локализация, сетевой приёмник.
- **Vuemony & Авторы оригинального vue-after-free**: Базовые исследования JSMAF и Userland.
- **SiSTRo**: Разработка GoldHEN.
- **ChendoChap & theflow0**: Исследования ядра PS4 и эксплойтов Lapse / NetControl.

---

<p align="center">
  <b>⚡ STORM VUE — Быстро. Красиво. Стабильно. ⚡</b>
</p>
