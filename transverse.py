import os

def traverse_and_filter(directory, exclude_dirs=["*.lock"], indent_level=0, output_file=None):
    for root, dirs, files in os.walk(directory):
        # Exclude the specified directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        # Calculate the indentation based on the directory depth
        indent = '│   ' * indent_level

        # Format the current directory
        directory_line = f"{indent}├── {os.path.basename(root)}\n"
        
        # Write the current directory to the file
        output_file.write(directory_line)

        # Increase the indent level for files
        sub_indent = '│   ' * (indent_level + 1)

        for file_name in files:
            file_line = f"{sub_indent}├── {file_name}\n"
            # Write the file name to the file
            output_file.write(file_line)

        # Recursively traverse subdirectories
        for d in dirs:
            traverse_and_filter(os.path.join(root, d), exclude_dirs, indent_level + 1, output_file)

# Define the root directory to start from (adjust the path as necessary)
root_directory = 'C:/Users/cpcay/Desktop/cartlite'

# Exclude 'node_modules' directory
exclude_directories = ['node_modules', 'yarn.lock', '.git', '.svn', '.DS_Store']

# Define the output file path
output_file_path = 'directory_structure.txt'

# Open the output file in write mode
with open(output_file_path, 'w', encoding='utf-8') as output_file:
    # Execute the function with the file handle
    traverse_and_filter(root_directory, exclude_directories, output_file=output_file)

print(f"Directory structure saved to {output_file_path}")
