fetch('http://localhost:8787/').then(r => r.text().then(t => {
  const rootIndex = t.indexOf('<div id="root">');
  console.log('STATUS:', r.status);
  console.log('ROOT CONTENT:\n', t.substring(rootIndex, rootIndex + 1000));
})).catch(console.error);
