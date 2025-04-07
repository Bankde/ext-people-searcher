# Makefile for packaging the Firefox extension

.PHONY: all package clean

# Define the directory and output zip file
EXT_DIR := .                  # Extension directory (can be changed)
OUTPUT_ZIP := people-searcher.xpi  # Output zip filename

# Files to include in the package (adjust this based on your needs)
INCLUDE_FILES := manifest.json icons content.js popup.html popup.js configManager.js PeopleManager.js person.js styles.css

# Excluded files (adjust this if needed)
EXCLUDE_FILES := "*.git*" "*.gitignore" "*.DS_Store" "build/*" ".env" "*:Zone.Identifier"

# Default target: package the extension
all: package

# Packaging the extension into a .xpi file
package:
	@echo "Packaging the extension..."
	zip -r build/$(OUTPUT_ZIP) $(INCLUDE_FILES) -x $(EXCLUDE_FILES)
	@echo "File Created: build/$(OUTPUT_ZIP)"

# Clean up any temporary files (if you need it)
clean:
	@echo "Cleaning up..."
	rm -f build/$(OUTPUT_ZIP)

