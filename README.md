# Obsidian Code Files

> Plugin for ObsidianMD to show and edit code files along other notes.

The plugin adds a code editor view to Obsidian. The code editor uses the powerful
[Monaco Editor](https://microsoft.github.io/monaco-editor/), which also powers VS Code.

** Caveat: This plugin currently relies on hosted dependencies and thus needs an internet connection.
Read [below](#caveat-online-dependency) for more information. **

In the plugin settings, you can configure for which file extensions the editor will be
available as default editor. You can also create new code files, either by right clicking
on a folder in the side pane and clicking on "Create Code File", search for
"Create new Code File" in the command palette or by using the "Create Code File" button
in the ribbon.

![img_1.png](img_1.png)

![img_2.png](img_2.png)

![img.png](img.png)

## Caveat: Online dependency

Due to the complicated nature of bundling the Monaco Editor, the plugin currently relies on
a hosted version of the editor. This means that the plugin needs an internet connection to
work, and has a dependency on the hosted editor, which is currently available on
https://embeddable-monaco.lukasbach.com.

I hope to remove this dependency in the future, but this was the easiest way to get the
plugin to work for now.
