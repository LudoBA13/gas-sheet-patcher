#!/bin/bash

# Configuration
SOURCE_DIR="src"
OUTPUT_DIR="dist"
OUTPUT_FILE="$OUTPUT_DIR/SheetPatcherBundle.js"

# Ensure output file is clean
mkdir -p "$OUTPUT_DIR"
echo "// Auto-generated file. Do not edit directly." > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Files in dependency order
FILES=(
    "src/AlignmentApplier.js"
    "src/SeriesPatcher.js"
    "src/SortedSeriesPatcher.js"
    "src/RowAlignmentApplier.js"
    "src/ColumnAlignmentApplier.js"
    "src/SheetPatcher.js"
)

# Append files in order
for file in "${FILES[@]}"; do
    echo "Appending $file..."
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n" >> "$OUTPUT_FILE"
done

echo "Bundling complete: $OUTPUT_FILE"
