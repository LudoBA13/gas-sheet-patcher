#!/bin/bash

# Configuration
SOURCE_DIR="src"
OUTPUT_DIR="dist"
OUTPUT_FILE="$OUTPUT_DIR/bundle.js"

# Ensure output file is clean
mkdir -p "$OUTPUT_DIR"
echo "// Auto-generated file. Do not edit directly." > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Find all .js files in src/ that do not start with '_'
find "$SOURCE_DIR" -maxdepth 1 -name "*.js" ! -name "_*" -type f | while read -r file; do
    echo "Appending $file..."
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n" >> "$OUTPUT_FILE"
done

echo "Bundling complete: $OUTPUT_FILE"
