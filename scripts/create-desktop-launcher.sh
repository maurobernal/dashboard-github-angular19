#!/bin/bash
# Creates "GitHub PR Dashboard.app" on the Desktop, which runs scripts/open-dashboard.sh.
# Re-run it if the project folder is moved.
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$HOME/Desktop/GitHub PR Dashboard.app"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

rm -rf "$APP"
osacompile -o "$APP" -e "do shell script quoted form of \"$SCRIPTS_DIR/open-dashboard.sh\""

# Icon: SVG -> PNG (Quick Look) -> iconset -> icns
qlmanage -t -s 1024 -o "$WORK" "$SCRIPTS_DIR/launcher-icon.svg" >/dev/null 2>&1
mkdir "$WORK/app.iconset"
for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$WORK/launcher-icon.svg.png" --out "$WORK/app.iconset/icon_${size}x${size}.png" >/dev/null
  sips -z $((size * 2)) $((size * 2)) "$WORK/launcher-icon.svg.png" --out "$WORK/app.iconset/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$WORK/app.iconset" -o "$APP/Contents/Resources/applet.icns"

# Changing the icon invalidates osacompile's ad-hoc signature.
xattr -cr "$APP"
codesign --force --deep -s - "$APP"
touch "$APP"

echo "Created $APP"
