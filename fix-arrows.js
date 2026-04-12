const fs = require('fs');
const content = fs.readFileSync('js/main.js', 'utf8');
let fixed = content.replace(/â†'/g, '→');
fixed = fixed.replace(/â†"/g, '←');
fs.writeFileSync('js/main.js', fixed);
console.log('Fixed arrows in main.js');