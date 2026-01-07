#!/bin/bash

# Files to hide
FILES=("index.html" "contact.html" "pricing.html")

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # Only backup if backup doesn't exist to prevent overwriting original with coming soon page if run twice
        if [ ! -f "${file}.original" ]; then
            echo "Backing up $file to ${file}.original"
            mv "$file" "${file}.original"
        else
            echo "Backup for $file already exists, skipping backup."
        fi
        
        echo "Replacing $file with Coming Soon page"
        cp coming-soon.html "$file"
    else
        echo "Warning: $file not found, skipping."
    fi
done

echo "Coming Soon mode enabled."
