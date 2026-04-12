const fs = require('fs');
const content = fs.readFileSync('js/main.js', 'utf8');
// The problematic character is U+2019 right single quotation mark ' (NOT U+2019)
// Let's try replacing the entire line that contains corrupted arrows
let lines = content.split('\n');
lines = lines.map(line => {
  if (line.includes('â†')) {
    return line.replace(/â†'/g, '→').replace(/â†"/g, '←');
  }
  return line;
});
fs.writeFileSync('js/main.js', lines.join('\n'));
console.log('Fixed arrows');