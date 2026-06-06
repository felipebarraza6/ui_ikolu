/**
 * Patch script para arreglar bugs de loop infinito en @rc-component/portal y @rc-component/tour.
 * Estos componentes tienen useEffect/useLayoutEffect sin dependencias que hacen setState
 * en cada render, causando "Maximum update depth exceeded" cuando el padre se re-renderiza.
 *
 * Ejecutar: node scripts/patch-rc-components.js
 * O agregar como postinstall en package.json.
 */

const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: 'node_modules/@rc-component/portal/es/Portal.js',
    original: `  React.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be \`null\`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  });`,
    replacement: `  React.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be \`null\`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  }, [getContainer]);`,
  },
  {
    file: 'node_modules/@rc-component/portal/lib/Portal.js',
    original: `  React.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be \`null\`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  });`,
    replacement: `  React.useEffect(function () {
    var customizeContainer = getPortalContainer(getContainer);

    // Tell component that we check this in effect which is safe to be \`null\`
    setInnerContainer(customizeContainer !== null && customizeContainer !== void 0 ? customizeContainer : null);
  }, [getContainer]);`,
  },
  {
    file: 'node_modules/@rc-component/tour/es/hooks/useTarget.js',
    original: `  useLayoutEffect(function () {
    var nextElement = typeof target === 'function' ? target() : target;
    setTargetElement(nextElement || null);
  });`,
    replacement: `  useLayoutEffect(function () {
    var nextElement = typeof target === 'function' ? target() : target;
    setTargetElement(nextElement || null);
  }, [target]);`,
  },
];

let applied = 0;
let skipped = 0;

for (const patch of patches) {
  const fullPath = path.resolve(patch.file);
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] Archivo no encontrado: ${patch.file}`);
    skipped++;
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  if (content.includes(patch.replacement)) {
    console.log(`[SKIP] Ya parcheado: ${patch.file}`);
    skipped++;
    continue;
  }

  if (!content.includes(patch.original)) {
    console.log(`[WARN] No se encontró el texto original en: ${patch.file}`);
    skipped++;
    continue;
  }

  content = content.replace(patch.original, patch.replacement);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`[OK] Parche aplicado: ${patch.file}`);
  applied++;
}

console.log(`\nResumen: ${applied} parches aplicados, ${skipped} omitidos.`);
if (applied > 0) {
  console.log('Reinicia el servidor de desarrollo para que los cambios surtan efecto.');
}
