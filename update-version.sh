#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Script de actualización automática para UIF REMAX CREA PWA
# Uso: ./update-version.sh [nueva_version] [mensaje_commit]
# Ejemplo: ./update-version.sh 1.2.0 "Agregadas mejoras en validación"
# ═══════════════════════════════════════════════════════════════

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de ayuda
show_help() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  UIF REMAX CREA - Script de actualización de versión${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Uso:"
    echo "  ./update-version.sh [VERSION] [MENSAJE]"
    echo ""
    echo "Ejemplos:"
    echo "  ./update-version.sh 1.2.0 \"Nuevas validaciones\""
    echo "  ./update-version.sh 1.2.1 \"Hotfix: bug en CUIT\""
    echo ""
    echo "El script actualizará automáticamente:"
    echo "  ✓ version.json"
    echo "  ✓ sw.js"
    echo "  ✓ index.html (CURRENT_VERSION)"
    echo "  ✓ Hará commit y push a GitHub"
    echo ""
    exit 0
}

# Verificar argumentos
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    show_help
fi

if [ -z "$1" ]; then
    echo -e "${RED}Error: Falta especificar la versión${NC}"
    echo "Uso: ./update-version.sh [VERSION] [MENSAJE]"
    echo "Ejemplo: ./update-version.sh 1.2.0 \"Nuevas funcionalidades\""
    exit 1
fi

NEW_VERSION="$1"
COMMIT_MSG="${2:-Actualización a versión $NEW_VERSION}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Actualizando a versión ${GREEN}$NEW_VERSION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "version.json" ] || [ ! -f "sw.js" ] || [ ! -f "index.html" ]; then
    echo -e "${RED}Error: No se encontraron los archivos necesarios${NC}"
    echo "Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

# 1. Actualizar version.json
echo -e "${YELLOW}[1/5]${NC} Actualizando version.json..."
CURRENT_DATE=$(date +%Y-%m-%d)

cat > version.json << EOF
{
  "version": "$NEW_VERSION",
  "date": "$CURRENT_DATE",
  "changelog": [
    "$COMMIT_MSG"
  ],
  "critical": false,
  "minVersion": "1.0.0"
}
EOF
echo -e "${GREEN}✓${NC} version.json actualizado"

# 2. Actualizar sw.js
echo -e "${YELLOW}[2/5]${NC} Actualizando sw.js..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/const VERSION = '.*';/const VERSION = '$NEW_VERSION';/" sw.js
    sed -i '' "s/const CACHE = 'uif-v.*';/const CACHE = \`uif-v\${VERSION}\`;/" sw.js
else
    # Linux
    sed -i "s/const VERSION = '.*';/const VERSION = '$NEW_VERSION';/" sw.js
    sed -i "s/const CACHE = 'uif-v.*';/const CACHE = \`uif-v\${VERSION}\`;/" sw.js
fi
echo -e "${GREEN}✓${NC} sw.js actualizado"

# 3. Actualizar index.html
echo -e "${YELLOW}[3/5]${NC} Actualizando index.html..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/const CURRENT_VERSION = '.*';/const CURRENT_VERSION = '$NEW_VERSION';/" index.html
else
    # Linux
    sed -i "s/const CURRENT_VERSION = '.*';/const CURRENT_VERSION = '$NEW_VERSION';/" index.html
fi
echo -e "${GREEN}✓${NC} index.html actualizado"

# 4. Git commit
echo -e "${YELLOW}[4/5]${NC} Haciendo commit en Git..."
git add version.json sw.js index.html
git commit -m "v$NEW_VERSION: $COMMIT_MSG"
echo -e "${GREEN}✓${NC} Commit creado"

# 5. Git push
echo -e "${YELLOW}[5/5]${NC} Subiendo a GitHub..."
git push origin main
echo -e "${GREEN}✓${NC} Cambios subidos a GitHub"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Actualización completada exitosamente${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Nueva versión: ${GREEN}$NEW_VERSION${NC}"
echo -e "Fecha: ${BLUE}$CURRENT_DATE${NC}"
echo -e "Mensaje: ${YELLOW}$COMMIT_MSG${NC}"
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "  1. Espera 1-2 minutos para que GitHub Pages actualice"
echo "  2. Los usuarios verán notificación automática"
echo "  3. Pueden actualizar con un click"
echo ""
echo -e "${GREEN}¡Todo listo! 🚀${NC}"
echo ""
