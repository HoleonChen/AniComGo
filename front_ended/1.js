const fs = require('fs');
const path = require('path');

function printTree(dir, level = 0) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    // 过滤掉不需要的目录
    if (file === 'node_modules' || file === '.git' || file === 'dist') return;

    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    console.log('  '.repeat(level) + (stats.isDirectory() ? '📁 ' : '📄 ') + file);

    if (stats.isDirectory() && level < 3) { // 限制深度为 4 层
      printTree(filePath, level + 1);
    }
  });
}

console.log('--- 项目目录结构 ---');
printTree('./');