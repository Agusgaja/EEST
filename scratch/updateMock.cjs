const fs = require('fs');
const path = 'C:/Users/Agustin/.gemini/antigravity/scratch/ProyectoMCH/src/data/mockTickets.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/category: ".*?",/g, 'motivo: "RED",');
content = content.replace(/subcategory: ".*?",/g, 'area: "AULA 1",');
content = content.replace(/\s*deviceTag: ".*?",\n/g, '\n');
content = content.replace(/\s*sector: ".*?",\n/g, '\n');
fs.writeFileSync(path, content);
