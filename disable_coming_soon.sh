#!/bin/bash

# Files to restore
FILES=("index.html" "contact.html" "pricing.html")

for file in "${FILES[@]}"; do
    if [ -f "${file}.original" ]; then
        echo "Restoring $file from ${file}.original"
        mv "${file}.original" "$file"
    else
        echo "Warning: Backup ${file}.original not found, cannot restore."
    fi
done

echo "Coming Soon mode disabled (website restored)."
