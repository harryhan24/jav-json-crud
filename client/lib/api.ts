import { Theme, ThemeData, FileType } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchData(fileType: FileType): Promise<ThemeData> {
  const response = await fetch(`${API_BASE}/data/${fileType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

export async function updateMetadata(fileType: FileType, themeName: string, description: string): Promise<ThemeData> {
  const response = await fetch(`${API_BASE}/data/${fileType}/metadata`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ themeName, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.log(error.message);
    throw new Error(error.error || 'Failed to update metadata');
  }

  return response.json();
}

export async function fetchThemes(fileType: FileType = 'theme'): Promise<Theme[]> {
  const response = await fetch(`${API_BASE}/themes?fileType=${fileType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch themes');
  }
  return response.json();
}

export async function createTheme(themeName: string, fileType: FileType = 'theme'): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes?fileType=${fileType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ theme: themeName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create theme');
  }

  return response.json();
}

export async function addItemsToTheme(themeName: string, items: string[], fileType: FileType = 'theme'): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(themeName)}/items?fileType=${fileType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add items');
  }

  return response.json();
}

export async function deleteItem(themeName: string, item: string, fileType: FileType = 'theme'): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(themeName)}/items/${encodeURIComponent(item)}?fileType=${fileType}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete item');
  }

  return response.json();
}

export async function reorderThemes(themeNames: string[], fileType: FileType = 'theme'): Promise<Theme[]> {
  const response = await fetch(`${API_BASE}/themes/reorder?fileType=${fileType}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ themeNames }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder themes');
  }

  return response.json();
}

export async function renameTheme(oldName: string, newName: string, fileType: FileType = 'theme'): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(oldName)}?fileType=${fileType}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to rename theme');
  }

  return response.json();
}
