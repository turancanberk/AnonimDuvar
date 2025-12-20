import os
import re

def count_functions(content):
    """Count function declarations in TypeScript/JavaScript code"""
    # Match function declarations, arrow functions, and methods
    patterns = [
        r'\bfunction\s+\w+\s*\(',  # function name()
        r'\bconst\s+\w+\s*=\s*\([^)]*\)\s*=>', # const name = () =>
        r'\blet\s+\w+\s*=\s*\([^)]*\)\s*=>', # let name = () =>
        r'\basync\s+function\s+\w+\s*\(',  # async function name()
        r'\w+\s*:\s*\([^)]*\)\s*=>', # name: () =>
        r'^\s*\w+\s*\([^)]*\)\s*{', # method()
        r'^\s*async\s+\w+\s*\([^)]*\)\s*{', # async method()
    ]
    
    count = 0
    for pattern in patterns:
        count += len(re.findall(pattern, content, re.MULTILINE))
    
    return count

def analyze_project(root_dir):
    """Analyze the project and count lines and functions"""
    total_lines = 0
    total_functions = 0
    file_count = 0
    
    extensions = ('.ts', '.tsx', '.js', '.jsx')
    exclude_dirs = {'node_modules', '.next', 'dist', 'build', '.git'}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove excluded directories from the search
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for filename in filenames:
            if filename.endswith(extensions):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        lines = len(content.splitlines())
                        functions = count_functions(content)
                        
                        total_lines += lines
                        total_functions += functions
                        file_count += 1
                        
                        # Print file info
                        rel_path = os.path.relpath(filepath, root_dir)
                        print(f"{rel_path}: {lines} satır, {functions} fonksiyon")
                        
                except Exception as e:
                    print(f"Hata ({filepath}): {e}")
    
    return total_lines, total_functions, file_count

if __name__ == "__main__":
    root = r"c:\Users\Canberk\Desktop\Projelerim\StickyNoteApp"
    print("Proje analiz ediliyor...\n")
    
    total_lines, total_functions, file_count = analyze_project(root)
    
    print("\n" + "="*60)
    print("ÖZET")
    print("="*60)
    print(f"Toplam Dosya Sayısı: {file_count}")
    print(f"Toplam Kod Satırı: {total_lines}")
    print(f"Toplam Fonksiyon Sayısı: {total_functions}")
    print("="*60)
