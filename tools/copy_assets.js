import fs from 'fs'
import path from 'path'

function copyDir (src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyDir('src/download0/img', 'dist/download0/img')
copyDir('src/download0/payloads', 'dist/download0/payloads')
copyDir('src/download0/themes', 'dist/download0/themes')
console.log('All assets, payloads, and themes copied successfully.')
