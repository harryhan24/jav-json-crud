import { Theme } from './types';

const API_BASE = 'http://localhost:3001/api';

export async function fetchThemes(): Promise<Theme[]> {
  const response = await fetch(`${API_BASE}/themes`);
  if (!response.ok) {
    throw new Error('Failed to fetch themes');
  }
  return response.json();
}

export async function createTheme(themeName: string): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes`, {
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

export async function addItemsToTheme(themeName: string, items: string[]): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(themeName)}/items`, {
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

export async function deleteItem(themeName: string, item: string): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(themeName)}/items/${encodeURIComponent(item)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete item');
  }

  return response.json();
}

export async function reorderThemes(themeNames: string[]): Promise<Theme[]> {
  const response = await fetch(`${API_BASE}/themes/reorder`, {
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

export async function renameTheme(oldName: string, newName: string): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${encodeURIComponent(oldName)}`, {
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
