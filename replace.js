const fs = require('fs');

let file = fs.readFileSync('C:\\Users\\9-sinf\\Documents\\GitHub\\Portfolio\\games.js', 'utf8');
let newPf = fs.readFileSync('C:\\Users\\9-sinf\\Documents\\GitHub\\Portfolio\\new_pf.js', 'utf8');

// Find the boundaries
let startIndex = file.indexOf('  function initPuppetFighter() {');
let endIndex = file.lastIndexOf('})();');

if (startIndex !== -1 && endIndex !== -1) {
    let newFile = file.substring(0, startIndex) + newPf + '\n})();\n';
    fs.writeFileSync('C:\\Users\\9-sinf\\Documents\\GitHub\\Portfolio\\games.js', newFile);
    console.log("Successfully replaced initPuppetFighter!");
} else {
    console.log("Could not find start or end index.");
}
