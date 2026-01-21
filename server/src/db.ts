import fs from 'fs';
import path from 'path';
import { ThemeData, Theme } from './types';

const DB_PATH = path.join(__dirname, '../../data/theme.json');

export function readDB(): ThemeData {
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function writeDB(data: ThemeData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 4), 'utf-8');
}

export function getThemes(): Theme[] {
  const data = readDB();
  return data.themeList;
}

export function addTheme(themeName: string): Theme {
  const data = readDB();

  // Check if theme already exists
  const exists = data.themeList.find(t => t.theme === themeName);
  if (exists) {
    throw new Error('Theme already exists');
  }

  const newTheme: Theme = {
    theme: themeName,
    list: []
  };

  data.themeList.push(newTheme);
  writeDB(data);

  return newTheme;
}

export function addItemsToTheme(themeName: string, items: string[]): Theme {
  const data = readDB();

  const theme = data.themeList.find(t => t.theme === themeName);
  if (!theme) {
    throw new Error('Theme not found');
  }

  // Remove duplicates from input items first (keep only unique items)
  const uniqueInputItems = [...new Set(items)];

  // Add items, avoiding duplicates with existing items
  uniqueInputItems.forEach(item => {
    if (!theme.list.includes(item)) {
      theme.list.push(item);
    }
  });

  writeDB(data);

  return theme;
}

export function deleteItemFromTheme(themeName: string, item: string): Theme {
  const data = readDB();

  const theme = data.themeList.find(t => t.theme === themeName);
  if (!theme) {
    throw new Error('Theme not found');
  }

  theme.list = theme.list.filter(i => i !== item);
  writeDB(data);

  return theme;
}

export function reorderThemes(themeNames: string[]): Theme[] {
  const data = readDB();

  // Validate that all themes exist
  const existingThemes = new Set(data.themeList.map(t => t.theme));
  const allExist = themeNames.every(name => existingThemes.has(name));

  if (!allExist || themeNames.length !== data.themeList.length) {
    throw new Error('Invalid theme list');
  }

  // Reorder themes based on the provided order
  const reordered = themeNames.map(name => {
    const theme = data.themeList.find(t => t.theme === name);
    if (!theme) {
      throw new Error('Theme not found');
    }
    return theme;
  });

  data.themeList = reordered;
  writeDB(data);

  return data.themeList;
}

export function renameTheme(oldName: string, newName: string): Theme {
  const data = readDB();

  // Check if old theme exists
  const theme = data.themeList.find(t => t.theme === oldName);
  if (!theme) {
    throw new Error('Theme not found');
  }

  // Check if new name is valid
  if (!newName || newName.trim() === '') {
    throw new Error('Theme name cannot be empty');
  }

  const trimmedNewName = newName.trim();

  // Check if new name already exists (and it's not the same theme)
  const existingTheme = data.themeList.find(t => t.theme === trimmedNewName);
  if (existingTheme && trimmedNewName !== oldName) {
    throw new Error('Theme name already exists');
  }

  // Rename the theme
  theme.theme = trimmedNewName;
  writeDB(data);

  return theme;
}
