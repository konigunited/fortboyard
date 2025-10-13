#!/bin/bash

FILE="C:\Users\F12$\Desktop\ПРОГИ\работа\форт боярд\style.css"

# Read the entire file
content=$(cat "$FILE")

# Create a temporary Python script
cat > /tmp/transform_css.py << 'PYTHON_SCRIPT'
import sys
import re

# Read from stdin
css_content = sys.stdin.read()

# 1. Update :root variables
css_content = re.sub(
    r':root\s*\{[^}]+\}',
    ''':root {
    --primary-color: #8d46f6;
    --primary-dark: #7a3de0;
    --secondary-color: #ff6914;
    --text-dark: #ffffff;
    --text-light: #d1d5db;
    --bg-light: #f4f4f4;
    --bg-main: #0d0d0f;
    --bg-dark: #0d0d0f;
    --white: #ffffff;
    --black: #000000;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --transition: all 0.3s ease;
}''',
    css_content,
    flags=re.DOTALL
)

# 2. Remove all [data-theme="dark"] blocks - multiline approach
lines = css_content.split('\n')
new_lines = []
skip_until_brace = 0
in_data_theme_block = False

for i, line in enumerate(lines):
    # Check if line contains [data-theme="dark"]
    if '[data-theme="dark"]' in line:
        in_data_theme_block = True
        skip_until_brace = 0
        continue

    if in_data_theme_block:
        # Count braces to find block end
        skip_until_brace += line.count('{')
        skip_until_brace -= line.count('}')
        if skip_until_brace <= 0:
            in_data_theme_block = False
        continue

    new_lines.append(line)

css_content = '\n'.join(new_lines)

# 3. Update header to be transparent
css_content = re.sub(
    r'(\.header\s*\{)([^}]+)(\})',
    lambda m: '.header {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    background: rgba(0, 0, 0, 0.3);\n    backdrop-filter: blur(12px);\n    -webkit-backdrop-filter: blur(12px);\n    box-shadow: none;\n    z-index: 1000;\n    transition: var(--transition);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n}',
    css_content,
    flags=re.DOTALL
)

# 4. Update section padding
css_content = re.sub(r'\bpadding:\s*5rem\s+0\s*;', 'padding: 2.5rem 0;', css_content)
css_content = re.sub(r'\bpadding:\s*4rem\s+0\s*;', 'padding: 2.5rem 0;', css_content)

# 5. Update nav menu links and phone link to white
css_content = re.sub(
    r'(\.nav-menu a\s*\{[^}]*?)color:[^;]+;',
    r'\1color: #ffffff;',
    css_content,
    flags=re.DOTALL
)

css_content = re.sub(
    r'(\.phone-link\s*\{[^}]*?)color:[^;]+;',
    r'\1color: #ffffff;',
    css_content,
    flags=re.DOTALL
)

# 6. Update specific section backgrounds
# DARK sections
dark_sections_updates = {
    'projects-section': True,
    'other-events': True,
    'gallery': True,
    'about': True,
    'adventure-section': True,
    'challenges-section': True,
    'after-show-section': True,
    'faq-section': True,
    'map-section': True,
    'footer': True
}

for section in dark_sections_updates:
    # Find section block and add/update background
    pattern = rf'(\.{section}\s*\{{[^}}]*?)(background:[^;]+;)?([^}}]*\}})'

    def replace_bg(match):
        before = match.group(1)
        rest = match.group(3) if match.group(3) else '}'
        # Remove existing background if present
        before = re.sub(r'background:[^;]+;', '', before)
        # Add dark background
        return before + 'background: #0d0d0f;\n    color: #ffffff;' + rest

    css_content = re.sub(pattern, replace_bg, css_content, flags=re.DOTALL)

# LIGHT sections - keep #f4f4f4 background
light_sections = ['services', 'yandex-badge-section', 'reviews-section', 'order', 'contacts']
for section in light_sections:
    pattern = rf'(\.{section}\s*\{{[^}}]*?)(background:[^;]+;)?([^}}]*\}})'

    def replace_light_bg(match):
        before = match.group(1)
        rest = match.group(3) if match.group(3) else '}'
        # Remove existing background
        before = re.sub(r'background:[^;]+;', '', before)
        # Add light background
        return before + 'background: #f4f4f4;' + rest

    css_content = re.sub(pattern, replace_light_bg, css_content, flags=re.DOTALL)

# 7. Update order section specifically (it should be light with dark text)
css_content = re.sub(
    r'(\.order\s*\{[^}]*?)(background:[^;]+;)([^}]*?)(color:[^;]+;)?',
    r'\1background: #f4f4f4;\3color: #1f2937;',
    css_content,
    flags=re.DOTALL
)

# 8. Clean up multiple newlines
css_content = re.sub(r'\n{3,}', '\n\n', css_content)

# Output result
print(css_content)
PYTHON_SCRIPT

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    echo "$content" | python3 /tmp/transform_css.py > "$FILE"
    echo "Transformation completed with python3!"
elif command -v python &> /dev/null; then
    echo "$content" | python /tmp/transform_css.py > "$FILE"
    echo "Transformation completed with python!"
else
    echo "Error: Python not found!"
    exit 1
fi
