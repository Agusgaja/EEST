const fs = require('fs');
let content = fs.readFileSync('C:/Users/Agustin/.gemini/antigravity/scratch/ProyectoMCH/src/data/mockTickets.js', 'utf8');

content = content.replace(/(\s+)(category: )/g, (match, p1, p2) => {
    return p1 + 'title: "Solicitud de mantenimiento (Importado)",' + p1 + 'attachments: [],' + p1 + p2;
});

content = content.replace(/authorId: "(U-\d+)",(\s+)text:/g, (match, authorId, space) => {
    let role = "usuario";
    if (authorId === "U-100" || authorId === "U-104") role = "admin";
    if (authorId === "U-106") role = "tecnico";
    return `authorId: "${authorId}",${space}authorRole: "${role}",${space}text:`;
});

fs.writeFileSync('C:/Users/Agustin/.gemini/antigravity/scratch/ProyectoMCH/src/data/mockTickets.js', content);
