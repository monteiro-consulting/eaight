// Theme Types - Complete VS Code-like theme system

/**
 * Theme type classification
 */
export type ThemeType = 'dark' | 'light' | 'hc' | 'hc-light';

/**
 * Simplified color palette for eaight themes
 */
export interface ThemeColorPalette {
  'bg.primary': string;
  'bg.secondary': string;
  'bg.tertiary': string;
  'bg.elevated': string;
  'fg.primary': string;
  'fg.secondary': string;
  'fg.muted': string;
  'fg.disabled': string;
  'fg.onAccent': string;
  'accent.primary': string;
  'accent.secondary': string;
  'accent.tertiary': string;
  'success': string;
  'warning': string;
  'error': string;
  'info': string;
  'border.default': string;
  'border.subtle': string;
  'border.focus': string;
}

/**
 * Semantic tokens for UI components
 */
export interface ThemeSemanticTokens {
  // Title Bar
  'titleBar.background': string;
  'titleBar.foreground': string;
  'titleBar.border': string;
  'titleBar.buttonHoverBackground': string;
  'titleBar.buttonActiveBackground': string;
  // Tab Bar
  'tabBar.background': string;
  'tabBar.border': string;
  // Tabs
  'tab.background': string;
  'tab.foreground': string;
  'tab.border': string;
  'tab.activeBackground': string;
  'tab.activeForeground': string;
  'tab.activeBorder': string;
  'tab.activeBorderTop': string;
  'tab.hoverBackground': string;
  'tab.hoverForeground': string;
  'tab.closeButtonForeground': string;
  'tab.closeButtonHoverBackground': string;
  'tab.closeButtonHoverForeground': string;
  // URL Bar
  'urlBar.background': string;
  'urlBar.foreground': string;
  'urlBar.border': string;
  'urlBar.focusBackground': string;
  'urlBar.focusBorder': string;
  'urlBar.placeholderForeground': string;
  'urlBar.selectionBackground': string;
  // Navigation
  'navigation.buttonBackground': string;
  'navigation.buttonForeground': string;
  'navigation.buttonHoverBackground': string;
  'navigation.buttonDisabledForeground': string;
  // Bookmarks Bar
  'bookmarksBar.background': string;
  'bookmarksBar.foreground': string;
  'bookmarksBar.border': string;
  'bookmarksBar.buttonHoverBackground': string;
  // AI Panel
  'aiPanel.background': string;
  'aiPanel.foreground': string;
  'aiPanel.border': string;
  'aiPanel.headerBackground': string;
  'aiPanel.headerForeground': string;
  'aiPanel.inputBackground': string;
  'aiPanel.inputBorder': string;
  'aiPanel.inputFocusBorder': string;
  'aiPanel.connectionActiveBackground': string;
  'aiPanel.connectionActiveForeground': string;
  'aiPanel.connectionInactiveBackground': string;
  'aiPanel.connectionInactiveForeground': string;
  // Scrollbar
  'scrollbar.track': string;
  'scrollbar.thumb': string;
  'scrollbar.thumbHover': string;
  // Menu
  'menu.background': string;
  'menu.foreground': string;
  'menu.border': string;
  'menu.separatorBackground': string;
  'menu.itemHoverBackground': string;
  'menu.itemHoverForeground': string;
  'menu.itemDisabledForeground': string;
  // Buttons
  'button.primaryBackground': string;
  'button.primaryForeground': string;
  'button.primaryHoverBackground': string;
  'button.secondaryBackground': string;
  'button.secondaryForeground': string;
  'button.secondaryHoverBackground': string;
  'button.ghostForeground': string;
  'button.ghostHoverBackground': string;
  // Inputs
  'input.background': string;
  'input.foreground': string;
  'input.border': string;
  'input.focusBorder': string;
  'input.placeholderForeground': string;
  // Badges
  'badge.background': string;
  'badge.foreground': string;
  // Tooltips
  'tooltip.background': string;
  'tooltip.foreground': string;
  'tooltip.border': string;
  // Status
  'status.loadingBackground': string;
  'status.loadingForeground': string;
  'status.successBackground': string;
  'status.successForeground': string;
  'status.errorBackground': string;
  'status.errorForeground': string;
  'status.warningBackground': string;
  'status.warningForeground': string;
  // Focus and selection
  'focusRing': string;
  'selection.background': string;
}

/**
 * Spacing configuration
 */
export interface ThemeSpacing {
  unit: number;
  borderRadiusSm: number;
  borderRadiusMd: number;
  borderRadiusLg: number;
  borderRadiusFull: number;
}

/**
 * Complete color palette - all VS Code workbench colors
 * Reference: https://code.visualstudio.com/api/references/theme-color
 */
export interface ThemeColors {
  // === BASE COLORS ===
  'focusBorder': string;
  'foreground': string;
  'disabledForeground': string;
  'widget.shadow': string;
  'selection.background': string;
  'descriptionForeground': string;
  'errorForeground': string;
  'icon.foreground': string;

  // === WINDOW ===
  'window.activeBorder': string;
  'window.inactiveBorder': string;

  // === TEXT COLORS ===
  'textBlockQuote.background': string;
  'textBlockQuote.border': string;
  'textCodeBlock.background': string;
  'textLink.activeForeground': string;
  'textLink.foreground': string;
  'textPreformat.foreground': string;
  'textSeparator.foreground': string;

  // === BUTTON ===
  'button.background': string;
  'button.foreground': string;
  'button.hoverBackground': string;
  'button.secondaryBackground': string;
  'button.secondaryForeground': string;
  'button.secondaryHoverBackground': string;
  'button.border': string;

  // === CHECKBOX ===
  'checkbox.background': string;
  'checkbox.foreground': string;
  'checkbox.border': string;

  // === DROPDOWN ===
  'dropdown.background': string;
  'dropdown.listBackground': string;
  'dropdown.border': string;
  'dropdown.foreground': string;

  // === INPUT ===
  'input.background': string;
  'input.border': string;
  'input.foreground': string;
  'input.placeholderForeground': string;
  'inputOption.activeBackground': string;
  'inputOption.activeBorder': string;
  'inputOption.activeForeground': string;
  'inputValidation.errorBackground': string;
  'inputValidation.errorBorder': string;
  'inputValidation.errorForeground': string;
  'inputValidation.infoBackground': string;
  'inputValidation.infoBorder': string;
  'inputValidation.infoForeground': string;
  'inputValidation.warningBackground': string;
  'inputValidation.warningBorder': string;
  'inputValidation.warningForeground': string;

  // === SCROLLBAR ===
  'scrollbar.shadow': string;
  'scrollbarSlider.activeBackground': string;
  'scrollbarSlider.background': string;
  'scrollbarSlider.hoverBackground': string;

  // === BADGE ===
  'badge.background': string;
  'badge.foreground': string;

  // === PROGRESS BAR ===
  'progressBar.background': string;

  // === LIST/TREE ===
  'list.activeSelectionBackground': string;
  'list.activeSelectionForeground': string;
  'list.dropBackground': string;
  'list.focusBackground': string;
  'list.focusForeground': string;
  'list.highlightForeground': string;
  'list.hoverBackground': string;
  'list.hoverForeground': string;
  'list.inactiveSelectionBackground': string;
  'list.inactiveSelectionForeground': string;
  'list.invalidItemForeground': string;
  'list.errorForeground': string;
  'list.warningForeground': string;
  'listFilterWidget.background': string;
  'listFilterWidget.outline': string;
  'listFilterWidget.noMatchesOutline': string;

  // === ACTIVITY BAR ===
  'activityBar.background': string;
  'activityBar.foreground': string;
  'activityBar.inactiveForeground': string;
  'activityBar.border': string;
  'activityBar.activeBorder': string;
  'activityBar.activeBackground': string;
  'activityBarBadge.background': string;
  'activityBarBadge.foreground': string;

  // === SIDEBAR ===
  'sideBar.background': string;
  'sideBar.foreground': string;
  'sideBar.border': string;
  'sideBar.dropBackground': string;
  'sideBarTitle.foreground': string;
  'sideBarSectionHeader.background': string;
  'sideBarSectionHeader.foreground': string;
  'sideBarSectionHeader.border': string;

  // === MINIMAP ===
  'minimap.findMatchHighlight': string;
  'minimap.selectionHighlight': string;
  'minimap.errorHighlight': string;
  'minimap.warningHighlight': string;
  'minimap.background': string;
  'minimapSlider.background': string;
  'minimapSlider.hoverBackground': string;
  'minimapSlider.activeBackground': string;
  'minimapGutter.addedBackground': string;
  'minimapGutter.modifiedBackground': string;
  'minimapGutter.deletedBackground': string;

  // === TAB ===
  'tab.activeBackground': string;
  'tab.unfocusedActiveBackground': string;
  'tab.activeForeground': string;
  'tab.border': string;
  'tab.activeBorder': string;
  'tab.unfocusedActiveBorder': string;
  'tab.activeBorderTop': string;
  'tab.unfocusedActiveBorderTop': string;
  'tab.lastPinnedBorder': string;
  'tab.inactiveBackground': string;
  'tab.unfocusedInactiveBackground': string;
  'tab.inactiveForeground': string;
  'tab.unfocusedActiveForeground': string;
  'tab.unfocusedInactiveForeground': string;
  'tab.hoverBackground': string;
  'tab.unfocusedHoverBackground': string;
  'tab.hoverForeground': string;
  'tab.unfocusedHoverForeground': string;
  'tab.hoverBorder': string;
  'tab.unfocusedHoverBorder': string;

  // === EDITOR GROUP ===
  'editorGroupHeader.tabsBackground': string;
  'editorGroupHeader.tabsBorder': string;
  'editorGroupHeader.noTabsBackground': string;
  'editorGroup.border': string;
  'editorGroup.dropBackground': string;

  // === EDITOR ===
  'editor.background': string;
  'editor.foreground': string;
  'editorLineNumber.foreground': string;
  'editorLineNumber.activeForeground': string;
  'editorCursor.background': string;
  'editorCursor.foreground': string;
  'editor.selectionBackground': string;
  'editor.selectionForeground': string;
  'editor.inactiveSelectionBackground': string;
  'editor.selectionHighlightBackground': string;
  'editor.selectionHighlightBorder': string;
  'editor.wordHighlightBackground': string;
  'editor.wordHighlightBorder': string;
  'editor.wordHighlightStrongBackground': string;
  'editor.wordHighlightStrongBorder': string;
  'editor.findMatchBackground': string;
  'editor.findMatchHighlightBackground': string;
  'editor.findRangeHighlightBackground': string;
  'editor.findMatchBorder': string;
  'editor.findMatchHighlightBorder': string;
  'editor.findRangeHighlightBorder': string;
  'editor.hoverHighlightBackground': string;
  'editor.lineHighlightBackground': string;
  'editor.lineHighlightBorder': string;
  'editorLink.activeForeground': string;
  'editor.rangeHighlightBackground': string;
  'editor.rangeHighlightBorder': string;
  'editorWhitespace.foreground': string;
  'editorIndentGuide.background': string;
  'editorIndentGuide.activeBackground': string;
  'editorRuler.foreground': string;
  'editorBracketMatch.background': string;
  'editorBracketMatch.border': string;
  'editorOverviewRuler.border': string;
  'editorOverviewRuler.findMatchForeground': string;
  'editorOverviewRuler.rangeHighlightForeground': string;
  'editorOverviewRuler.selectionHighlightForeground': string;
  'editorOverviewRuler.wordHighlightForeground': string;
  'editorOverviewRuler.wordHighlightStrongForeground': string;
  'editorOverviewRuler.modifiedForeground': string;
  'editorOverviewRuler.addedForeground': string;
  'editorOverviewRuler.deletedForeground': string;
  'editorOverviewRuler.errorForeground': string;
  'editorOverviewRuler.warningForeground': string;
  'editorOverviewRuler.infoForeground': string;
  'editorOverviewRuler.bracketMatchForeground': string;
  'editorError.foreground': string;
  'editorError.border': string;
  'editorWarning.foreground': string;
  'editorWarning.border': string;
  'editorInfo.foreground': string;
  'editorInfo.border': string;
  'editorHint.foreground': string;
  'editorHint.border': string;
  'editorGutter.background': string;
  'editorGutter.modifiedBackground': string;
  'editorGutter.addedBackground': string;
  'editorGutter.deletedBackground': string;

  // === DIFF EDITOR ===
  'diffEditor.insertedTextBackground': string;
  'diffEditor.insertedTextBorder': string;
  'diffEditor.removedTextBackground': string;
  'diffEditor.removedTextBorder': string;
  'diffEditor.border': string;
  'diffEditor.diagonalFill': string;

  // === WIDGET ===
  'editorWidget.foreground': string;
  'editorWidget.background': string;
  'editorWidget.border': string;
  'editorWidget.resizeBorder': string;
  'editorSuggestWidget.background': string;
  'editorSuggestWidget.border': string;
  'editorSuggestWidget.foreground': string;
  'editorSuggestWidget.highlightForeground': string;
  'editorSuggestWidget.selectedBackground': string;
  'editorHoverWidget.foreground': string;
  'editorHoverWidget.background': string;
  'editorHoverWidget.border': string;
  'editorHoverWidget.statusBarBackground': string;

  // === PEEK VIEW ===
  'peekView.border': string;
  'peekViewEditor.background': string;
  'peekViewEditorGutter.background': string;
  'peekViewEditor.matchHighlightBackground': string;
  'peekViewEditor.matchHighlightBorder': string;
  'peekViewResult.background': string;
  'peekViewResult.fileForeground': string;
  'peekViewResult.lineForeground': string;
  'peekViewResult.matchHighlightBackground': string;
  'peekViewResult.selectionBackground': string;
  'peekViewResult.selectionForeground': string;
  'peekViewTitle.background': string;
  'peekViewTitleDescription.foreground': string;
  'peekViewTitleLabel.foreground': string;

  // === MERGE ===
  'merge.currentHeaderBackground': string;
  'merge.currentContentBackground': string;
  'merge.incomingHeaderBackground': string;
  'merge.incomingContentBackground': string;
  'merge.border': string;
  'merge.commonContentBackground': string;
  'merge.commonHeaderBackground': string;
  'editorOverviewRuler.currentContentForeground': string;
  'editorOverviewRuler.incomingContentForeground': string;
  'editorOverviewRuler.commonContentForeground': string;

  // === PANEL ===
  'panel.background': string;
  'panel.border': string;
  'panel.dropBorder': string;
  'panelTitle.activeBorder': string;
  'panelTitle.activeForeground': string;
  'panelTitle.inactiveForeground': string;
  'panelInput.border': string;

  // === STATUS BAR ===
  'statusBar.background': string;
  'statusBar.foreground': string;
  'statusBar.border': string;
  'statusBar.debuggingBackground': string;
  'statusBar.debuggingForeground': string;
  'statusBar.debuggingBorder': string;
  'statusBar.noFolderForeground': string;
  'statusBar.noFolderBackground': string;
  'statusBar.noFolderBorder': string;
  'statusBarItem.activeBackground': string;
  'statusBarItem.hoverBackground': string;
  'statusBarItem.prominentForeground': string;
  'statusBarItem.prominentBackground': string;
  'statusBarItem.prominentHoverBackground': string;
  'statusBarItem.remoteBackground': string;
  'statusBarItem.remoteForeground': string;
  'statusBarItem.errorBackground': string;
  'statusBarItem.errorForeground': string;
  'statusBarItem.warningBackground': string;
  'statusBarItem.warningForeground': string;

  // === TITLE BAR ===
  'titleBar.activeBackground': string;
  'titleBar.activeForeground': string;
  'titleBar.inactiveBackground': string;
  'titleBar.inactiveForeground': string;
  'titleBar.border': string;

  // === MENU BAR ===
  'menubar.selectionForeground': string;
  'menubar.selectionBackground': string;
  'menubar.selectionBorder': string;
  'menu.foreground': string;
  'menu.background': string;
  'menu.selectionForeground': string;
  'menu.selectionBackground': string;
  'menu.selectionBorder': string;
  'menu.separatorBackground': string;
  'menu.border': string;

  // === NOTIFICATION ===
  'notificationCenter.border': string;
  'notificationCenterHeader.foreground': string;
  'notificationCenterHeader.background': string;
  'notificationToast.border': string;
  'notifications.foreground': string;
  'notifications.background': string;
  'notifications.border': string;
  'notificationLink.foreground': string;
  'notificationsErrorIcon.foreground': string;
  'notificationsWarningIcon.foreground': string;
  'notificationsInfoIcon.foreground': string;

  // === BANNER ===
  'banner.background': string;
  'banner.foreground': string;
  'banner.iconForeground': string;

  // === EXTENSION ===
  'extensionButton.prominentForeground': string;
  'extensionButton.prominentBackground': string;
  'extensionButton.prominentHoverBackground': string;
  'extensionBadge.remoteBackground': string;
  'extensionBadge.remoteForeground': string;

  // === QUICK INPUT ===
  'pickerGroup.border': string;
  'pickerGroup.foreground': string;
  'quickInput.background': string;
  'quickInput.foreground': string;
  'quickInputList.focusBackground': string;
  'quickInputList.focusForeground': string;
  'quickInputList.focusIconForeground': string;
  'quickInputTitle.background': string;

  // === KEYBINDING ===
  'keybindingLabel.background': string;
  'keybindingLabel.foreground': string;
  'keybindingLabel.border': string;
  'keybindingLabel.bottomBorder': string;

  // === KEYBOARD SHORTCUT TABLE ===
  'keybindingTable.headerBackground': string;
  'keybindingTable.rowsBackground': string;

  // === TERMINAL ===
  'terminal.background': string;
  'terminal.border': string;
  'terminal.foreground': string;
  'terminal.ansiBlack': string;
  'terminal.ansiBlue': string;
  'terminal.ansiBrightBlack': string;
  'terminal.ansiBrightBlue': string;
  'terminal.ansiBrightCyan': string;
  'terminal.ansiBrightGreen': string;
  'terminal.ansiBrightMagenta': string;
  'terminal.ansiBrightRed': string;
  'terminal.ansiBrightWhite': string;
  'terminal.ansiBrightYellow': string;
  'terminal.ansiCyan': string;
  'terminal.ansiGreen': string;
  'terminal.ansiMagenta': string;
  'terminal.ansiRed': string;
  'terminal.ansiWhite': string;
  'terminal.ansiYellow': string;
  'terminal.selectionBackground': string;
  'terminalCursor.background': string;
  'terminalCursor.foreground': string;

  // === DEBUG ===
  'debugToolBar.background': string;
  'debugToolBar.border': string;
  'editor.stackFrameHighlightBackground': string;
  'editor.focusedStackFrameHighlightBackground': string;
  'debugView.exceptionLabelForeground': string;
  'debugView.exceptionLabelBackground': string;
  'debugView.stateLabelForeground': string;
  'debugView.stateLabelBackground': string;
  'debugView.valueChangedHighlight': string;
  'debugTokenExpression.name': string;
  'debugTokenExpression.value': string;
  'debugTokenExpression.string': string;
  'debugTokenExpression.boolean': string;
  'debugTokenExpression.number': string;
  'debugTokenExpression.error': string;

  // === WELCOME PAGE ===
  'welcomePage.background': string;
  'welcomePage.buttonBackground': string;
  'welcomePage.buttonHoverBackground': string;
  'walkThrough.embeddedEditorBackground': string;

  // === GIT COLORS ===
  'gitDecoration.addedResourceForeground': string;
  'gitDecoration.modifiedResourceForeground': string;
  'gitDecoration.deletedResourceForeground': string;
  'gitDecoration.renamedResourceForeground': string;
  'gitDecoration.stageModifiedResourceForeground': string;
  'gitDecoration.stageDeletedResourceForeground': string;
  'gitDecoration.untrackedResourceForeground': string;
  'gitDecoration.ignoredResourceForeground': string;
  'gitDecoration.conflictingResourceForeground': string;
  'gitDecoration.submoduleResourceForeground': string;

  // === SETTINGS EDITOR ===
  'settings.headerForeground': string;
  'settings.modifiedItemIndicator': string;
  'settings.dropdownBackground': string;
  'settings.dropdownForeground': string;
  'settings.dropdownBorder': string;
  'settings.dropdownListBorder': string;
  'settings.checkboxBackground': string;
  'settings.checkboxForeground': string;
  'settings.checkboxBorder': string;
  'settings.textInputBackground': string;
  'settings.textInputForeground': string;
  'settings.textInputBorder': string;
  'settings.numberInputBackground': string;
  'settings.numberInputForeground': string;
  'settings.numberInputBorder': string;
  'settings.focusedRowBackground': string;
  'settings.rowHoverBackground': string;

  // === BREADCRUMB ===
  'breadcrumb.foreground': string;
  'breadcrumb.background': string;
  'breadcrumb.focusForeground': string;
  'breadcrumb.activeSelectionForeground': string;
  'breadcrumbPicker.background': string;

  // === SNIPPETS ===
  'editor.snippetTabstopHighlightBackground': string;
  'editor.snippetTabstopHighlightBorder': string;
  'editor.snippetFinalTabstopHighlightBackground': string;
  'editor.snippetFinalTabstopHighlightBorder': string;

  // === SYMBOL ICONS ===
  'symbolIcon.arrayForeground': string;
  'symbolIcon.booleanForeground': string;
  'symbolIcon.classForeground': string;
  'symbolIcon.colorForeground': string;
  'symbolIcon.constantForeground': string;
  'symbolIcon.constructorForeground': string;
  'symbolIcon.enumeratorForeground': string;
  'symbolIcon.enumeratorMemberForeground': string;
  'symbolIcon.eventForeground': string;
  'symbolIcon.fieldForeground': string;
  'symbolIcon.fileForeground': string;
  'symbolIcon.folderForeground': string;
  'symbolIcon.functionForeground': string;
  'symbolIcon.interfaceForeground': string;
  'symbolIcon.keyForeground': string;
  'symbolIcon.keywordForeground': string;
  'symbolIcon.methodForeground': string;
  'symbolIcon.moduleForeground': string;
  'symbolIcon.namespaceForeground': string;
  'symbolIcon.nullForeground': string;
  'symbolIcon.numberForeground': string;
  'symbolIcon.objectForeground': string;
  'symbolIcon.operatorForeground': string;
  'symbolIcon.packageForeground': string;
  'symbolIcon.propertyForeground': string;
  'symbolIcon.referenceForeground': string;
  'symbolIcon.snippetForeground': string;
  'symbolIcon.stringForeground': string;
  'symbolIcon.structForeground': string;
  'symbolIcon.textForeground': string;
  'symbolIcon.typeParameterForeground': string;
  'symbolIcon.unitForeground': string;
  'symbolIcon.variableForeground': string;

  // === DEBUG ICONS ===
  'debugIcon.breakpointForeground': string;
  'debugIcon.breakpointDisabledForeground': string;
  'debugIcon.breakpointUnverifiedForeground': string;
  'debugIcon.breakpointCurrentStackframeForeground': string;
  'debugIcon.breakpointStackframeForeground': string;
  'debugIcon.startForeground': string;
  'debugIcon.pauseForeground': string;
  'debugIcon.stopForeground': string;
  'debugIcon.disconnectForeground': string;
  'debugIcon.restartForeground': string;
  'debugIcon.stepOverForeground': string;
  'debugIcon.stepIntoForeground': string;
  'debugIcon.stepOutForeground': string;
  'debugIcon.continueForeground': string;
  'debugIcon.stepBackForeground': string;
  'debugConsole.infoForeground': string;
  'debugConsole.warningForeground': string;
  'debugConsole.errorForeground': string;
  'debugConsole.sourceForeground': string;
  'debugConsoleInputIcon.foreground': string;

  // === NOTEBOOK ===
  'notebook.editorBackground': string;
  'notebook.cellBorderColor': string;
  'notebook.cellHoverBackground': string;
  'notebook.cellInsertionIndicator': string;
  'notebook.cellStatusBarItemHoverBackground': string;
  'notebook.cellToolbarSeparator': string;
  'notebook.focusedCellBackground': string;
  'notebook.focusedCellBorder': string;
  'notebook.focusedEditorBorder': string;
  'notebook.inactiveFocusedCellBorder': string;
  'notebook.inactiveSelectedCellBorder': string;
  'notebook.outputContainerBackgroundColor': string;
  'notebook.outputContainerBorderColor': string;
  'notebook.selectedCellBackground': string;
  'notebook.selectedCellBorder': string;
  'notebook.symbolHighlightBackground': string;
  'notebookScrollbarSlider.activeBackground': string;
  'notebookScrollbarSlider.background': string;
  'notebookScrollbarSlider.hoverBackground': string;
  'notebookStatusErrorIcon.foreground': string;
  'notebookStatusRunningIcon.foreground': string;
  'notebookStatusSuccessIcon.foreground': string;

  // === CHART ===
  'charts.foreground': string;
  'charts.lines': string;
  'charts.red': string;
  'charts.blue': string;
  'charts.yellow': string;
  'charts.orange': string;
  'charts.green': string;
  'charts.purple': string;

  // === PORTS ===
  'ports.iconRunningProcessForeground': string;

  // === EAIGHT CUSTOM ===
  'eaight.urlBar.background': string;
  'eaight.urlBar.foreground': string;
  'eaight.urlBar.border': string;
  'eaight.urlBar.focusBorder': string;
  'eaight.urlBar.placeholderForeground': string;
  'eaight.navigation.buttonForeground': string;
  'eaight.navigation.buttonHoverBackground': string;
  'eaight.navigation.buttonDisabledForeground': string;
  'eaight.bookmarksBar.background': string;
  'eaight.bookmarksBar.foreground': string;
  'eaight.bookmarksBar.border': string;
  'eaight.aiPanel.background': string;
  'eaight.aiPanel.foreground': string;
  'eaight.aiPanel.border': string;
  'eaight.aiPanel.headerBackground': string;
  'eaight.aiPanel.headerForeground': string;
  'eaight.aiPanel.inputBackground': string;
  'eaight.aiPanel.inputBorder': string;
  'eaight.aiPanel.connectionActiveBackground': string;
  'eaight.aiPanel.connectionActiveForeground': string;
  'eaight.aiPanel.connectionInactiveBackground': string;
  'eaight.aiPanel.connectionInactiveForeground': string;
}

/**
 * Token color settings for syntax highlighting
 */
export interface TokenColorSettings {
  foreground?: string;
  background?: string;
  fontStyle?: 'italic' | 'bold' | 'underline' | 'italic bold' | 'bold italic' | '';
}

/**
 * Token color rule
 */
export interface TokenColorRule {
  name?: string;
  scope: string | string[];
  settings: TokenColorSettings;
}

/**
 * Semantic token colors
 */
export interface SemanticTokenColors {
  [tokenType: string]: string | { foreground?: string; fontStyle?: string; bold?: boolean; italic?: boolean; underline?: boolean };
}

/**
 * Font configuration
 */
export interface ThemeFonts {
  // Legacy properties for backward compatibility
  fontFamily?: string;
  fontFamilyMono?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  // New properties used by ThemeResolver
  family: string;
  monoFamily: string;
  sizeXs: number;
  sizeSm: number;
  sizeBase: number;
  sizeLg: number;
  sizeXl: number;
  weightNormal: number;
  weightMedium: number;
  weightSemibold: number;
  weightBold: number;
}

/**
 * UI dimensions and spacing
 */
export interface ThemeUI {
  borderRadius: number;
  borderWidth: number;
  spacing: number;
  compactMode: boolean;
}

/**
 * Complete theme definition
 */
export interface Theme {
  // Metadata
  id?: string;
  name: string;
  displayName?: string;
  type: ThemeType;
  version?: string;
  author?: string;
  description?: string;
  isBuiltIn?: boolean;
  isCustom?: boolean;

  // Colors (partial - missing keys use defaults)
  colors?: Partial<ThemeColors>;

  // Simplified color palette for eaight themes
  palette?: ThemeColorPalette;

  // Semantic tokens
  tokens?: Partial<ThemeSemanticTokens>;

  // Token colors for syntax highlighting
  tokenColors?: TokenColorRule[];

  // Semantic token colors
  semanticTokenColors?: SemanticTokenColors;

  // Semantic highlighting enabled
  semanticHighlighting?: boolean;

  // Font settings
  fonts?: Partial<ThemeFonts>;

  // UI settings
  ui?: ThemeUI;

  // Spacing settings
  spacing?: ThemeSpacing;
}

/**
 * User color customizations - can override any color
 */
export interface ThemeCustomizations {
  // Override any theme color
  colors?: Partial<ThemeColors>;

  // Override color palette
  palette?: Partial<ThemeColorPalette>;

  // Override semantic tokens
  tokens?: Partial<ThemeSemanticTokens>;

  // Override font settings
  fonts?: Partial<ThemeFonts>;

  // Override UI settings
  ui?: Partial<ThemeUI>;

  // Override spacing settings
  spacing?: Partial<ThemeSpacing>;

  // Override token colors
  tokenColors?: TokenColorRule[];
}

/**
 * Resolved theme with all values computed
 */
export interface ResolvedTheme {
  id?: string;
  name: string;
  type: ThemeType;
  colors?: ThemeColors;
  palette?: ThemeColorPalette;
  tokens?: ThemeSemanticTokens;
  tokenColors?: TokenColorRule[];
  fonts: ThemeFonts;
  ui?: ThemeUI;
  spacing?: ThemeSpacing;
}

/**
 * Theme setting in user preferences
 */
export type ThemeSetting = 'dark' | 'light' | 'system' | string;

/**
 * Color validation result
 */
export interface ColorValidation {
  isValid: boolean;
  format: 'hex' | 'hex8' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'unknown';
  normalized: string;
}

/**
 * Contrast ratio result
 */
export interface ContrastResult {
  ratio: number;
  levelAA: boolean;
  levelAAA: boolean;
  levelAALarge: boolean;
  levelAAALarge: boolean;
}

/**
 * Theme export format
 */
export interface ThemeExport {
  $schema?: string;
  name: string;
  type: ThemeType;
  colors: Partial<ThemeColors>;
  tokenColors?: TokenColorRule[];
  semanticTokenColors?: SemanticTokenColors;
  semanticHighlighting?: boolean;
  fonts?: ThemeFonts;
  ui?: ThemeUI;
}

/**
 * Theme import validation result
 */
export interface ThemeImportResult {
  success: boolean;
  theme?: Theme;
  errors?: string[];
  warnings?: string[];
}

/**
 * All CSS variable names
 */
export type ThemeCSSVariable = `--${string}`;
