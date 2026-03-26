
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(file, 'utf8');

const bad = `                                        style={{ width: "100%", padding: "9px 12px", border: \`1.5px solid \${form.employee ? C.border : C.danger}\`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit" }}> 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit" }}>`;

const good = `                                        style={{ width: "100%", padding: "9px 12px", border: \`1.5px solid \${form.employee ? C.border : C.danger}\`, borderRadius: 9, fontSize: 13, outline: "none", background: C.bg, color: C.text, fontFamily: "inherit" }}>`;

if (!content.includes(bad)) {
  console.log('ERROR: target string not found — file may already be fixed');
  console.log('Try running: npm run dev');
  process.exit(0);
}

content = content.replace(bad, good);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed! Run: npm run dev');
