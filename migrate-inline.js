const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/mywell/MyWell.js');
let content = fs.readFileSync(filePath, 'utf8');

// Agregar imports si no existen
if (!content.includes('ikoluTokens')) {
  content = content.replace(
    `import { useResponsive } from "../../hooks/useResponsive";`,
    `import { useResponsive } from "../../hooks/useResponsive";\nimport { ikoluTokens } from "../../theme";\nimport { theme } from "antd";`
  );
}

// Agregar useToken cerca de las otras destructuraciones
if (!content.includes('useToken')) {
  content = content.replace(
    `const { Text } = Typography;`,
    `const { Text } = Typography;\nconst { useToken } = theme;`
  );
}

// Agregar const { token } = theme.useToken(); dentro del componente principal
// Buscamos "const MyWell = () => {" y agregamos justo después
if (!content.includes('const { token } = theme.useToken()') && !content.includes('const { token } = useToken()')) {
  content = content.replace(
    /const MyWell = \(\) => \{/,
    `const MyWell = () => {\n  const { token } = useToken();`
  );
}

// Función de reemplazo dentro de style={{...}} usando regex global
function replaceInStyles(pattern, replacement) {
  const styleRegex = /style=\{\{([\s\S]*?)\}\}/g;
  content = content.replace(styleRegex, (match, p1) => {
    // Reemplazar solo si el patrón existe en este bloque
    if (p1.includes(pattern)) {
      const newContent = p1.split(pattern).join(replacement);
      return `style={{${newContent}}}`;
    }
    return match;
  });
}

// Colores
replaceInStyles('color: "#1F3461"', 'color: ikoluTokens.colorCorporateBlue');
replaceInStyles("color: '#1F3461'", 'color: ikoluTokens.colorCorporateBlue');
replaceInStyles('color: "#1f3461"', 'color: ikoluTokens.colorCorporateBlue');
replaceInStyles("color: '#1f3461'", 'color: ikoluTokens.colorCorporateBlue');
replaceInStyles('color: "#52c41a"', 'color: token.colorSuccess');
replaceInStyles('color: "#52C41A"', 'color: token.colorSuccess');
replaceInStyles('color: "#ff4d4f"', 'color: token.colorError');
replaceInStyles('color: "#faad14"', 'color: token.colorWarning');
replaceInStyles('color: "#bfbfbf"', 'color: ikoluTokens.colorGreyTextLight');
replaceInStyles('color: "#8c8c8c"', 'color: ikoluTokens.colorGreyText');
replaceInStyles('color: "#595959"', 'color: ikoluTokens.colorGreyTextMid');
replaceInStyles('color: "#FF6B35"', 'color: ikoluTokens.colorAccentOrange');
replaceInStyles('color: "#ffffff"', 'color: ikoluTokens.colorWhite');
replaceInStyles('color: "#fff"', 'color: ikoluTokens.colorWhite');
replaceInStyles('color: "white"', 'color: ikoluTokens.colorWhite');
replaceInStyles('color: "#000000"', 'color: ikoluTokens.colorBlack');
replaceInStyles('color: "#000"', 'color: ikoluTokens.colorBlack');
replaceInStyles('color: "black"', 'color: ikoluTokens.colorBlack');
replaceInStyles('color: "#1976d2"', 'color: ikoluTokens.colorCorporateBlueBright');
replaceInStyles('color: "#1890ff"', 'color: token.colorInfo');
replaceInStyles('color: "#43a047"', 'color: ikoluTokens.colorGreenText');
replaceInStyles('color: "#388e3c"', 'color: ikoluTokens.colorGreenDarkText');
replaceInStyles('color: "#e3f2fd"', 'color: ikoluTokens.colorBlueTint');

// Backgrounds
replaceInStyles('background: "#f2f5fa"', 'background: ikoluTokens.colorBackgroundLight');
replaceInStyles('background: "#f0f0f0"', 'background: ikoluTokens.colorBorderLight');
replaceInStyles('background: "#f5f5f5"', 'background: token.colorBgLayout');
replaceInStyles('background: "#fff"', 'background: ikoluTokens.colorWhite');
replaceInStyles('background: "#ffffff"', 'background: ikoluTokens.colorWhite');
replaceInStyles('background: "white"', 'background: ikoluTokens.colorWhite');
replaceInStyles('background: "#FFF2F0"', 'background: ikoluTokens.colorRedBg');
replaceInStyles('background: "#f0f5ff"', 'background: ikoluTokens.colorBlueBg');
replaceInStyles('background: "#e3f2fd"', 'background: ikoluTokens.colorBlueTint');
replaceInStyles('backgroundColor: "#ff4d4f"', 'backgroundColor: token.colorError');
replaceInStyles('backgroundColor: "#f5222d"', 'backgroundColor: token.colorError');
replaceInStyles('backgroundColor: "#52c41a"', 'backgroundColor: token.colorSuccess');
replaceInStyles('backgroundColor: "#1F3461"', 'backgroundColor: ikoluTokens.colorCorporateBlue');
replaceInStyles('backgroundColor: "#fff"', 'backgroundColor: ikoluTokens.colorWhite');
replaceInStyles('backgroundColor: "#ffffff"', 'backgroundColor: ikoluTokens.colorWhite');
replaceInStyles('backgroundColor: "white"', 'backgroundColor: ikoluTokens.colorWhite');

// Borders
replaceInStyles('border: "1px solid #f0f0f0"', 'border: `1px solid ${ikoluTokens.colorBorderLight}`');
replaceInStyles('borderBottom: "1px solid #f0f0f0"', 'borderBottom: `1px solid ${ikoluTokens.colorBorderLight}`');
replaceInStyles('borderTop: "1px solid #f0f0f0"', 'borderTop: `1px solid ${ikoluTokens.colorBorderLight}`');
replaceInStyles('border: "1px solid #e3f2fd"', 'border: `1px solid ${ikoluTokens.colorBlueTint}`');
replaceInStyles('border: "none"', 'border: "none"'); // no-op pero para mantener patrón

// Sombras
replaceInStyles('boxShadow: "0 4px 12px rgba(0,0,0,0.08)"', 'boxShadow: ikoluTokens.shadowCard');
replaceInStyles('boxShadow: "0 8px 24px rgba(0,0,0,0.12)"', 'boxShadow: ikoluTokens.shadowCardHover');
replaceInStyles('boxShadow: "0 -2px 8px rgba(0,0,0,0.06)"', 'boxShadow: ikoluTokens.shadowNav');
replaceInStyles('boxShadow: "0 2px 6px rgba(24, 144, 255, 0.25)"', 'boxShadow: ikoluTokens.shadowPrimary');
replaceInStyles('boxShadow: "0 1px 4px rgba(0,0,0,0.04)"', 'boxShadow: ikoluTokens.shadowNav');

// Radios numéricos
replaceInStyles('borderRadius: 4', 'borderRadius: token.borderRadiusXS');
replaceInStyles('borderRadius: 6', 'borderRadius: ikoluTokens.radiusSmall');
replaceInStyles('borderRadius: 8', 'borderRadius: token.borderRadius');
replaceInStyles('borderRadius: 12', 'borderRadius: token.borderRadiusLG');
replaceInStyles('borderRadius: 16', 'borderRadius: ikoluTokens.radiusXL');

// Radios string
replaceInStyles('borderRadius: "4px"', 'borderRadius: token.borderRadiusXS');
replaceInStyles('borderRadius: "6px"', 'borderRadius: ikoluTokens.radiusSmall');
replaceInStyles('borderRadius: "8px"', 'borderRadius: token.borderRadius');
replaceInStyles('borderRadius: "12px"', 'borderRadius: token.borderRadiusLG');
replaceInStyles('borderRadius: "16px"', 'borderRadius: ikoluTokens.radiusXL');

// Font sizes numéricos
replaceInStyles('fontSize: 11', 'fontSize: ikoluTokens.fontSizeSmall');
replaceInStyles('fontSize: 12', 'fontSize: ikoluTokens.fontSizeBase');
replaceInStyles('fontSize: 13', 'fontSize: ikoluTokens.fontSizeMid');
replaceInStyles('fontSize: 14', 'fontSize: ikoluTokens.fontSizeLarge');
replaceInStyles('fontSize: 16', 'fontSize: ikoluTokens.fontSizeXL');
replaceInStyles('fontSize: 18', 'fontSize: ikoluTokens.fontSize2XL');
replaceInStyles('fontSize: 22', 'fontSize: ikoluTokens.fontSize3XL');
replaceInStyles('fontSize: 24', 'fontSize: ikoluTokens.fontSize4XL');

// Font sizes string
replaceInStyles('fontSize: "11px"', 'fontSize: ikoluTokens.fontSizeSmall');
replaceInStyles('fontSize: "12px"', 'fontSize: ikoluTokens.fontSizeBase');
replaceInStyles('fontSize: "13px"', 'fontSize: ikoluTokens.fontSizeMid');
replaceInStyles('fontSize: "14px"', 'fontSize: ikoluTokens.fontSizeLarge');
replaceInStyles('fontSize: "16px"', 'fontSize: ikoluTokens.fontSizeXL');
replaceInStyles('fontSize: "18px"', 'fontSize: ikoluTokens.fontSize2XL');
replaceInStyles('fontSize: "22px"', 'fontSize: ikoluTokens.fontSize3XL');
replaceInStyles('fontSize: "24px"', 'fontSize: ikoluTokens.fontSize4XL');

// Otros comunes
replaceInStyles('color: "rgba(0,0,0,0.85)"', 'color: token.colorText');
replaceInStyles('color: "rgba(0,0,0,0.65)"', 'color: token.colorTextSecondary');

fs.writeFileSync(filePath, content, 'utf8');
console.log('MyWell.js migrated');
