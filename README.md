# Vue-After-Free
A PlayStation Vue userland code execution exploit. 
* PlayStation 4 only.

## Vulnerability Scope
KEX= Kernel Exploit
| vue-after-free (Userland) | Lapse (KEX) | Poopsploit (KEX) |
| :------------------------ | :---------- | :--------------- |
| 5.05–13.02                | 1.01–12.02  | ?.00–13.00       |

## Supported by this Repository

This table indicates firmware versions for which the _current version_ of this repository provides a functional tested jailbreak for. 

| 7.00-13.00 |
| :--------- |
* Userland exploit works 5.05 to 13.02 as is.

## Requirments
* A network connection of any kind is needed. The setup instructions guide you to safely setting up a connection over WiFi or LAN with a DNS to block firmware and app updates. Alternative connections are possible.
### For Jailbroken PS4
  * Fake or legit activated PS4 user account.
  * FTP access to the console.
  * USB flash drive formatted to exFAT or FAT32.
  * Playstation Vue 1.01 base and 1.xx patch.(Referred to as "PS Vue" later in the guide).

### For Non-Jailbroken PS4
  * USB flash drive formatted to exFAT or FAT32.
  * System backup file.
> [!WARNING]
> Restoring the system backup will erase all data on your console, then apply the vue app and it's exploit data to it.

## In app UI 
* PS Vue has an in app UI custom crafted for use, it includes a manual jailbreak button, a payload menu and a config menu with potential for more to be added.
### Jailbreak 
* By default Vue After Free will use Lapse to jailreak up to 12.02 and Poopsploit from 12.50-13.00 when you press the jailbreak button. 
### Payload Menu 
* Various payloads will be there and more can be added by placing them in the path /mnt/sandbox/CUSA00960_000/download0/payloads. 
### Config options
1. Auto Lapse - when ticked automatically loads Lapse to jailbreak when you open the PS Vue app. 
2. Auto Poop - when ticked automatically loads Poopsploit to jailbreak when you open the PS Vue app.
3. Auto Close - Automatically cloess the PS Vue app on jailbreak success.

# Setup Instructions 
## Jailbroken PS4 manual files 
  1. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  2. Navigate to Settings > Network > Check Connect to the Internet, then Set Up Internet Connection.
  3. Connection: Wi-Fi or LAN cable
  4. Set Up: Custom
  5. IP Address: Automatic
  6. DHCP Host Name: Do Not Specify
  7. DNS Settings: Manual
  8. Primary DNS: 62.210.38.117 (Leave the secondary blank as it is)
  9. MTU Settings: Automatic
  10. Proxy Server: Do Not Use
  11. Test the internet connection if you get an IP address it's working. 
  * The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS
  12. From Releases download the ManualSetup.zip and unpack it. 
  13. Jailbreak your console. 
  14. Enable FTP. 
  15. Install Apollo Save Tool. https://pkg-zone.com/details/APOL00004
  16. Install PS Vue 1.01 pkg and 1.xx patch. 
  17. Open PS Vue.
  18. Connect to the console with FTP.
  19. Go to the following path /mnt/sandbox/CUSA00960_000/download0.
  20. Place files from src/download0 into /mnt/sandbox/CUSA00960_000/download0.
  21. From src/savedata Copy the PS4 folder to the root of your USB Drive. 
  26. Plug the USB into the console.
  27. Open Apollo Save Tool and go to USB Saves
  28. Select the PS Vue save (CUSA00960) and choose "Copy to HDD"
  32. Reboot your console then open PS Vue and wait for the menu to load.

## Jailbroken PS4 quick setup 
  1. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  2. Navigate to Settings > Network > Check Connect to the Internet, then Set Up Internet Connection.
  3. Connection: Wi-Fi or LAN cable
  4. Set Up: Custom
  5. IP Address: Automatic
  6. DHCP Host Name: Do Not Specify
  7. DNS Settings: Manual
  8. Primary DNS: 62.210.38.117 (Leave the secondary blank as it is)
  9. MTU Settings: Automatic
  10. Proxy Server: Do Not Use
  11. Test the internet connection if you get an IP address it's working. 
  * The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS
  12. From Releases download the QuickSetup.zip and unpack it. 
  13. Jailbreak your console. 
  14. Enable FTP. 
  15. Install Apollo Save Tool. https://pkg-zone.com/details/APOL00004
  16. Install PS Vue 1.01 pkg and 1.xx patch. 
  17. Open PS Vue.
  18. Connect to the console with FTP.
  19. Go to the following path /user/download/CUSA00960 (create the CUSA00960 folder if needed) 
  20. Place the download.dat in the CUSA00960 folder. 
  21. From src/savedata Copy the PS4 folder to the root of your USB Drive. 
  26. Plug the USB into the console.
  27. Open Apollo Save Tool and go to USB Saves
  28. Select the PS Vue save (CUSA00960) and choose "Copy to HDD"
  32. Reboot your console then open PS Vue and wait for the menu to load.


## Non-Jailbroken PS4
  1. Format your USB Drive to Exfat. 
> [!WARNING]
> This will wipe your drive of all data. Backup any important data. 
  2. From Releases download the SystemBackup.zip and unpack it. 
  3. Unpack the contents of the zip onto the USB.
  4. Plug the USB into your console. 
  5. If you have a real PSN account on the console go to Settings>Application Saved Data Management>Saved Data in System Storage and backup your savedata to the USB. (Sufficient space required.)
  * If you cannot access the savedata you do not have a Real PSN account or fake activated account, meaning that if you do not jailbreak first you cannot backup your saves.
  6. Go to Settings>Storage>System Storage>Capture Gallery>All and backup your captures to the USB. (Sufficient space required.)
  7. Go to Settings>System>Back Up and Restore>Restore PS4 and select the the system backup there and restore it.
  8. When the console reboots you will have a fake activated user account and PS Vue and it's exploit data. 
  * Connecting to a network is mandatory to run the Vue exploit. 
  9. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  10. Navigate to Settings > Network > Check Connect to the Internet, then Set Up Internet Connection.
  11. Connection: Wi-Fi or LAN cable
  12. Set Up: Custom
  13. IP Address: Automatic
  14. DHCP Host Name: Do Not Specify
  15. DNS Settings: Manual
  16. Primary DNS: 62.210.38.117 (Leave the secondary blank as it is)
  17. MTU Settings: Automatic
  18. Proxy Server: Do Not Use
  19. Test the internet connection if you get an IP address it's working. 
  * The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS
  * Alternatively any kind of network connection will allow you to run the PS Vue app. 
  20. Open PS Vue and wait for the menu to load.
  * User account ID is "1111111111111111" you cannot change it but you can create another user and fake activate it, then while jailbroken follow the instructions above for jailbroken users to set up PS Vue while signed into the newly activated account.

# FAQ 

# Credits 
- [c0w-ar](https://github.com/c0w-ar/)
- [earthonion](https://github.com/earthonion)
- [ufm42](https://github.com/ufm42)
- [D-Link Turtle](https://github.com/iMrDJAi) 
- [Gezine](https://github.com/gezine)
- [Helloyunho](https://github.com/Helloyunho)
- [Dr.Yenyen](https://github.com/DrYenyen)
- [AlAzif](https://github.com/Al-Azif) Reference for exploit table and retail application advice.
- abc
- [TheFlow](https://github.com/TheOfficialFloW)
- [Lua Loader project](https://github.com/shahrilnet/remote_lua_loader)

## payload sources:
- elfldr.elf by John Törnblom: https://github.com/ps4-payload-dev/elfldr
- AIOfix_network.elf by Gezine : https://github.com/Gezine/BD-JB-1250/blob/main/payloads/lapse/src/org/bdj/external/aiofix_network.c
