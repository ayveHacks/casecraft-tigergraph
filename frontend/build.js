const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building frontend...');
execSync('tsc -b && vite build', { stdio: 'inherit' });

console.log('Packaging static API data for Vercel...');
const casesSrc = path.join(__dirname, '..', 'cases');
const casesDest = path.join(__dirname, 'dist', 'cases');

if (!fs.existsSync(casesDest)) {
    fs.mkdirSync(casesDest, { recursive: true });
}

// Read all cases
const files = fs.readdirSync(casesSrc).filter(f => f.endsWith('.json'));
const caseIds = [];

for (const file of files) {
    const src = path.join(casesSrc, file);
    const dest = path.join(casesDest, file);
    fs.copyFileSync(src, dest);
    caseIds.push(file.replace('.json', ''));
}

// Generate the index payload that /api/cases will return
fs.writeFileSync(
    path.join(casesDest, 'index.json'),
    JSON.stringify({ cases: caseIds })
);

console.log(`Packaged ${caseIds.length} cases successfully.`);
