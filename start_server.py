#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8000
HOST = '0.0.0.0'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

os.chdir(r'C:\Users\F12$\Desktop\форт боярд')

with socketserver.TCPServer((HOST, PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://{HOST}:{PORT}/")
    print(f"Access from this computer: http://localhost:{PORT}/")
    print(f"Access from network: http://192.168.0.146:{PORT}/")
    print("\nPress Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
