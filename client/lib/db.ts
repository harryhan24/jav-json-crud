import fs from 'fs';
import path from 'path';
import {ThemeData, Theme, FileType} from './types';

function getDBPath(fileType: FileType): string {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    const dbPath = path.join(dataDir, `${fileType}.json`);
    return dbPath;
}

export function readDB(fileType: FileType = 'theme'): ThemeData {
    const dbPath = getDBPath(fileType);
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
}

export function writeDB(data: ThemeData, fileType: FileType = 'theme'): void {
    const dbPath = getDBPath(fileType);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4), 'utf-8');
}

export function getData(fileType: FileType = 'theme'): ThemeData {
    return readDB(fileType);
}

export function updateMetadata(fileType: FileType, themeName: string, description: string): ThemeData {
    const data = readDB(fileType);
    data.themeName = themeName;
    data.description = description;
    writeDB(data, fileType);
    return data;
}

export function getThemes(fileType: FileType = 'theme'): Theme[] {
    const data = readDB(fileType);
    return data.themeList;
}

export function addTheme(themeName: string, fileType: FileType = 'theme'): Theme {
    const data = readDB(fileType);

    const exists = data.themeList.find(t => t.theme === themeName);
    if (exists) {
        throw new Error('Theme already exists');
    }

    const newTheme: Theme = {
        theme: themeName,
        list: []
    };

    data.themeList.push(newTheme);
    writeDB(data, fileType);

    return newTheme;
}

export function addItemsToTheme(themeName: string, items: string[], fileType: FileType = 'theme'): Theme {
    const data = readDB(fileType);

    const theme = data.themeList.find(t => t.theme === themeName);
    if (!theme) {
        throw new Error('Theme not found');
    }

    const uniqueInputItems = [...new Set(items)];

    uniqueInputItems.forEach(item => {
        if (!theme.list.includes(item)) {
            theme.list.push(item);
        }
    });

    writeDB(data, fileType);

    return theme;
}

export function deleteItemFromTheme(themeName: string, item: string, fileType: FileType = 'theme'): Theme {
    const data = readDB(fileType);

    const theme = data.themeList.find(t => t.theme === themeName);
    if (!theme) {
        throw new Error('Theme not found');
    }

    theme.list = theme.list.filter(i => i !== item);
    writeDB(data, fileType);

    return theme;
}

export function reorderThemes(themeNames: string[], fileType: FileType = 'theme'): Theme[] {
    const data = readDB(fileType);

    const existingThemes = new Set(data.themeList.map(t => t.theme));
    const allExist = themeNames.every(name => existingThemes.has(name));

    if (!allExist || themeNames.length !== data.themeList.length) {
        throw new Error('Invalid theme list');
    }

    const reordered = themeNames.map(name => {
        const theme = data.themeList.find(t => t.theme === name);
        if (!theme) {
            throw new Error('Theme not found');
        }
        return theme;
    });

    data.themeList = reordered;
    writeDB(data, fileType);

    return data.themeList;
}

export function renameTheme(oldName: string, newName: string, fileType: FileType = 'theme'): Theme {
    const data = readDB(fileType);

    const theme = data.themeList.find(t => t.theme === oldName);
    if (!theme) {
        throw new Error('Theme not found');
    }

    if (!newName || newName.trim() === '') {
        throw new Error('Theme name cannot be empty');
    }

    const trimmedNewName = newName.trim();

    const existingTheme = data.themeList.find(t => t.theme === trimmedNewName);
    if (existingTheme && trimmedNewName !== oldName) {
        throw new Error('Theme name already exists');
    }

    theme.theme = trimmedNewName;
    writeDB(data, fileType);

    return theme;
}
