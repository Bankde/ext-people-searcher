# Makefile for packaging the Firefox extension

.PHONY: all package clean

# Define the directory and output zip file
EXT_DIR := .                  # Extension directory (can be changed)
OUTPUT_ZIP := people-searcher.xpi  # Output zip filename

# Excluded files (adjust this if needed)
EXCLUDE_FILES := "*.git*" "*.gitignore" "*.DS_Store" "build/*" ".env" "*:Zone.Identifier"

# Default target: package the extension
all: package

# Packaging the extension into a .xpi file
package:
	@echo "Packaging the extension..."
	(cd src && zip -r ../build/$(OUTPUT_ZIP) . -x $(EXCLUDE_FILES))
	@echo "File Created: build/$(OUTPUT_ZIP)"

# Clean up any temporary files (if you need it)
clean:
	@echo "Cleaning up..."
	rm -f build/$(OUTPUT_ZIP)

