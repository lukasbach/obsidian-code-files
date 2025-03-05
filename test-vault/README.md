# Obsidian Code Files Test Vault

This is a test vault for the Obsidian Code Files plugin. It contains sample files to test the Monaco editor integration.

## Test Files

1. `code/test.js` - A simple JavaScript file
2. `code/test.ts` - A simple TypeScript file
3. `code-block-test.md` - A markdown file with a code block that can be edited with Monaco

## Testing Instructions

1. Open this vault in Obsidian
2. Enable the Code Files plugin in Settings > Community plugins
3. Test opening the JavaScript and TypeScript files
4. Test editing the code block in the markdown file:
   - Right-click on the code block
   - Select "Edit Code Block in Monaco Editor"
   - Make changes and close the modal
5. Test creating a new code file:
   - Right-click on a folder
   - Select "Create Code File"
   - Enter a name and press Enter

## Notes

- The plugin files are symlinked from the development directory, so any changes to the plugin will be immediately reflected after rebuilding
- The Monaco CSS is copied to the plugin directory 