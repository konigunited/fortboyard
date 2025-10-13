import re

# Read the original CSS file
with open(r'C:\Users\F12$\Desktop\ПРОГИ\работа\форт боярд\style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

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

# 2. Remove all [data-theme="dark"] blocks
# Remove entire dark theme variable declarations
css_content = re.sub(r'/\* Dark Theme \*/.*?\n\[data-theme="dark"\]\s*\{[^}]+\}', '', css_content, flags=re.DOTALL)

# Remove all other [data-theme="dark"] selectors and their rules
css_content = re.sub(r'\[data-theme="dark"\][^\{]*\{[^}]+\}', '', css_content, flags=re.DOTALL)

# 3. Update header to be transparent
css_content = re.sub(
    r'\.header\s*\{[^}]+\}',
    '''.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: none;
    z-index: 1000;
    transition: var(--transition);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}''',
    css_content
)

# 4. Update section padding from 5rem to 2.5rem and 4rem to 2.5rem
css_content = re.sub(r'padding:\s*5rem\s+0', 'padding: 2.5rem 0', css_content)
css_content = re.sub(r'padding:\s*4rem\s+0', 'padding: 2.5rem 0', css_content)

# 5. Set specific backgrounds for sections

# LIGHT sections (bg: #f4f4f4, text: dark)
light_sections = [
    'services',
    'yandex-badge-section',
    'reviews-section',
    'order',
    'contacts'
]

for section in light_sections:
    # Find and update background for light sections
    pattern = rf'\.{section}\s*\{{'
    if re.search(pattern, css_content):
        css_content = re.sub(
            rf'(\.{section}\s*\{{[^}}]*)(background:[^;]+;)?',
            rf'\1background: #f4f4f4;',
            css_content
        )

# DARK sections (bg: #0d0d0f, text: white)
dark_sections = [
    'projects-section',
    'other-events',
    'gallery',
    'about',
    'adventure-section',
    'challenges-section',
    'after-show-section',
    'faq-section',
    'map-section',
    'footer'
]

for section in dark_sections:
    # Find and update background for dark sections
    pattern = rf'\.{section}\s*\{{'
    if re.search(pattern, css_content):
        css_content = re.sub(
            rf'(\.{section}\s*\{{[^}}]*)(background:[^;]+;)?',
            rf'\1background: #0d0d0f; color: #ffffff;',
            css_content
        )

# 6. Update nav menu links to white
css_content = re.sub(
    r'(\.nav-menu a\s*\{[^}]*)(color:[^;]+;)',
    r'\1color: #ffffff;',
    css_content
)

# 7. Update phone link to white
css_content = re.sub(
    r'(\.phone-link\s*\{[^}]*)(color:[^;]+;)',
    r'\1color: #ffffff;',
    css_content
)

# 8. Clean up multiple newlines
css_content = re.sub(r'\n{3,}', '\n\n', css_content)

# Write the transformed CSS
with open(r'C:\Users\F12$\Desktop\ПРОГИ\работа\форт боярд\style.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("CSS transformation completed successfully!")
