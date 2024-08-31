import os
import argparse

def treeFind(directory, keyword, exclude_dirs, output_file=None):
    matches = []  # List to store matches

    # Ensure we only traverse within the specified directory
    for root, dirs, files in os.walk(directory):
        # Exclude specified directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not any(e in d for e in exclude_dirs)]

        for file_name in files:
            file_path = os.path.join(root, file_name)

            # Check if the file name contains the keyword
            if keyword.lower() in file_name.lower():
                matches.append((root, file_name, file_path))

    # Write the results to the output file
    for match in matches:
        root, file_name, file_path = match
        output_file.write(f"Folder: {root}\n")
        output_file.write(f"Filename: {file_name}\n")
        output_file.write("Contents:\n")

        # Print file contents
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                contents = file.read()
                output_file.write(contents + "\n")
        except Exception as e:
            output_file.write(f"Could not read file contents: {e}\n")
        
        output_file.write("\n" + "="*80 + "\n\n")  # Separator for each match

    # Append the contents of app.jsx if it exists
    app_file_path = os.path.join(directory, 'app.jsx')
    if os.path.exists(app_file_path):
        output_file.write("Contents of app.jsx:\n")
        try:
            with open(app_file_path, 'r', encoding='utf-8') as app_file:
                app_contents = app_file.read()
                output_file.write(app_contents + "\n")
        except Exception as e:
            output_file.write(f"Could not read app.jsx contents: {e}\n")

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Traverse a directory and search for a keyword in filenames.')
    parser.add_argument('keyword', type=str, help='Keyword to search for in filenames')
    parser.add_argument('--directory', type=str, default='hosting/src', help='Root directory to start from (default: hosting/src)')
    parser.add_argument('--exclude', nargs='*', default=['node_modules', '*.lock', '.git', '.svn', '.DS_Store'], help='Directories to exclude from traversal')

    args = parser.parse_args()

    # Ensure the directory exists
    if not os.path.exists(args.directory):
        print(f"Error: The directory '{args.directory}' does not exist.")
        return

    # Set the output file path to a fixed file name
    output_file_path = 'findTree.txt'

    # Open the output file in write mode
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        # Execute the function with the file handle and keyword
        treeFind(args.directory, args.keyword, args.exclude, output_file=output_file)

    print(f"Search results saved to {output_file_path}")

if __name__ == '__main__':
    main()
