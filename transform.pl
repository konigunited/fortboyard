#!/usr/bin/perl
use strict;
use warnings;
use utf8;

# Read the entire CSS file
my $file = 'C:\Users\F12$\Desktop\ПРОГИ\работа\форт боярд\style.css';
open(my $fh, '<:encoding(UTF-8)', $file) or die "Cannot open $file: $!";
my $css = do { local $/; <$fh> };
close($fh);

# 1. Update :root variables
$css =~ s/:root\s*\{[^}]+\}/:root {
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
}/s;

# 2. Remove all [data-theme="dark"] sections
$css =~ s/\/\*\s*Dark Theme\s*\*\/.*?\n\[data-theme="dark"\]\s*\{[^}]+\}//gs;
$css =~ s/\[data-theme="dark"\][^\{]*\{[^}]+\}//gs;

# 3. Update header to be transparent
$css =~ s/\.header\s*\{[^}]+\}/.header {
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
}/s;

# 4. Update section padding from 5rem and 4rem to 2.5rem
$css =~ s/padding:\s*5rem\s+0/padding: 2.5rem 0/g;
$css =~ s/padding:\s*4rem\s+0/padding: 2.5rem 0/g;

# 5. Update nav menu links to white
$css =~ s/(\.nav-menu a\s*\{[^}]*?)color:\s*[^;]+;/$1color: #ffffff;/gs;

# 6. Update phone link to white
$css =~ s/(\.phone-link\s*\{[^}]*?)color:\s*[^;]+;/$1color: #ffffff;/gs;

# 7. Set specific section backgrounds

# DARK sections (bg: #0d0d0f, text: white)
my @dark_sections = (
    'projects-section', 'other-events', 'gallery', 'about',
    'adventure-section', 'challenges-section', 'after-show-section',
    'faq-section', 'map-section', 'footer'
);

foreach my $section (@dark_sections) {
    # Match section and update/add background
    $css =~ s/(\.${section}\s*\{)([^}]*?)(background:[^;]+;)?([^}]*?\})/$1$2$4/gs;
    $css =~ s/(\.${section}\s*\{)/$1\n    background: #0d0d0f;\n    color: #ffffff;/s;
}

# LIGHT sections (bg: #f4f4f4)
my @light_sections = ('services', 'yandex-badge-section', 'reviews-section', 'order', 'contacts');

foreach my $section (@light_sections) {
    $css =~ s/(\.${section}\s*\{)([^}]*?)(background:[^;]+;)?([^}]*?\})/$1$2$4/gs;
    $css =~ s/(\.${section}\s*\{)/$1\n    background: #f4f4f4;/s;
}

# 8. Update h1-h6 gradient for light theme (remove dark theme versions)
$css =~ s/(h1, h2, h3, h4, h5, h6\s*\{[^}]*?background:\s*linear-gradient[^;]+;)/$1/s;

# 9. Update section title colors for dark sections (white text)
$css =~ s/(\.section-title\s*\{[^}]*?)(-webkit-text-fill-color:\s*transparent;)/$1-webkit-text-fill-color: #ffffff;/gs;

# 10. Clean up multiple newlines
$css =~ s/\n{3,}/\n\n/g;

# Write the transformed CSS back
open(my $out, '>:encoding(UTF-8)', $file) or die "Cannot write to $file: $!";
print $out $css;
close($out);

print "CSS transformation completed successfully!\n";
print "- Removed all [data-theme=\"dark\"] styles\n";
print "- Updated :root CSS variables with new color scheme\n";
print "- Made header transparent with blur effect\n";
print "- Reduced section padding from 4-5rem to 2.5rem\n";
print "- Set dark backgrounds for specified sections\n";
print "- Set light backgrounds for specified sections\n";
print "- Updated nav/phone links to white\n";
