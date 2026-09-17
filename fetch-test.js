fetch('http://localhost:8787/').then(r => r.text().then(t => console.log('STATUS:', r.status, '\nTEXT:\n', t.substring(0, 500)))).catch(console.error);
