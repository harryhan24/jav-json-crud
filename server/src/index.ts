import express, { Request, Response } from 'express';
import cors from 'cors';
import { getThemes, addTheme, addItemsToTheme, deleteItemFromTheme, reorderThemes, renameTheme } from './db';
import { validateCode } from './types';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all themes
app.get('/api/themes', (req: Request, res: Response) => {
  try {
    const themes = getThemes();
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Create a new theme
app.post('/api/themes', (req: Request, res: Response) => {
  try {
    const { theme } = req.body;

    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
      res.status(400).json({ error: 'Theme name is required' });
      return;
    }

    const newTheme = addTheme(theme.trim());
    res.status(201).json(newTheme);
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create theme' });
    }
  }
});

// Add items to a theme
app.post('/api/themes/:themeName/items', (req: Request, res: Response) => {
  try {
    const { themeName } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Items array is required' });
      return;
    }

    // Validate all items
    const invalidItems = items.filter(item => !validateCode(item));
    if (invalidItems.length > 0) {
      res.status(400).json({
        error: 'Invalid item format',
        invalidItems
      });
      return;
    }

    const updatedTheme = addItemsToTheme(themeName, items.map(i => i.trim().toUpperCase()));
    res.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to add items' });
    }
  }
});

// Delete an item from a theme
app.delete('/api/themes/:themeName/items/:item', (req: Request, res: Response) => {
  try {
    const { themeName, item } = req.params;

    const updatedTheme = deleteItemFromTheme(themeName, item);
    res.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error && error.message === 'Theme not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
});

// Reorder themes
app.put('/api/themes/reorder', (req: Request, res: Response) => {
  try {
    const { themeNames } = req.body;

    if (!themeNames || !Array.isArray(themeNames)) {
      res.status(400).json({ error: 'Theme names array is required' });
      return;
    }

    const reordered = reorderThemes(themeNames);
    res.json(reordered);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to reorder themes' });
    }
  }
});

// Rename a theme
app.put('/api/themes/:themeName', (req: Request, res: Response) => {
  try {
    const { themeName } = req.params;
    const { newName } = req.body;

    if (!newName || typeof newName !== 'string') {
      res.status(400).json({ error: 'New theme name is required' });
      return;
    }

    const updatedTheme = renameTheme(themeName, newName);
    res.json(updatedTheme);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Theme not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Theme name already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    } else {
      res.status(500).json({ error: 'Failed to rename theme' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
