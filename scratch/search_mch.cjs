const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.push(path.resolve('./index.html'));
files.push(path.resolve('./package.json'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('MCH')) {
    console.log(`Found 'MCH' in ${file}`);
  }
});
console.log('Search done.');
