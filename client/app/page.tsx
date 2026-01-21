'use client';

import { useState, useEffect } from 'react';
import { Theme, FileType } from '@/lib/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './styles.css';

interface SortableThemeItemProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
  onRename: (oldName: string, newName: string) => void;
}

function SortableThemeItem({ theme, isSelected, onClick, onRename }: SortableThemeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(theme.theme);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: theme.theme });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(theme.theme);
  };

  const handleBlur = () => {
    if (editValue.trim() && editValue !== theme.theme) {
      onRename(theme.theme, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(theme.theme);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`theme-item ${isSelected ? 'active' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="3" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="4" cy="13" r="1.5" />
          <circle cx="12" cy="3" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="12" cy="13" r="1.5" />
        </svg>
      </div>
      <div className="theme-item-content" onClick={onClick} onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            type="text"
            className="theme-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="theme-item-name">{theme.theme}</span>
        )}
        <span className="theme-item-count">{theme.list.length}개</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [fileType, setFileType] = useState<FileType>('theme');
  const [themeName, setThemeName] = useState('');
  const [description, setDescription] = useState('');
  const [allowOnlyUpperCase, setAllowOnlyUpperCase] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newItems, setNewItems] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editThemeName, setEditThemeName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, [fileType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/data/${fileType}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();

      setThemeName(data.themeName);
      setDescription(data.description);
      setAllowOnlyUpperCase(data.allowOnlyUpperCase || false);
      setThemes(data.themeList);
      setSelectedTheme(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    try {
      const trimmedThemeName = editThemeName.trim();
      const trimmedDescription = editDescription.trim();

      const response = await fetch(`/api/data/${fileType}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeName: trimmedThemeName, description: trimmedDescription }),
      });

      if (!response.ok) throw new Error('Failed to update metadata');

      setThemeName(trimmedThemeName);
      setDescription(trimmedDescription);
      setIsEditingMetadata(false);
      setSuccess('메타데이터가 업데이트되었습니다!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('메타데이터 업데이트에 실패했습니다.');
      }
    }
  };

  const handleCreateTheme = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedThemeName = newThemeName.trim();
    if (!trimmedThemeName) {
      setError('테마 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/themes?fileType=${fileType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: trimmedThemeName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create theme');
      }

      setNewThemeName('');
      setSuccess('테마가 성공적으로 생성되었습니다!');
      setError('');
      await loadData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('테마 생성에 실패했습니다.');
      }
    }
  };

  const handleAddItems = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTheme) return;

    const lines = newItems
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setError('추가할 항목을 입력해주세요.');
      return;
    }

    try {
      const processedItems = allowOnlyUpperCase
        ? lines.map(item => item.toUpperCase())
        : lines;

      const response = await fetch(`/api/themes/${encodeURIComponent(selectedTheme.theme)}/items?fileType=${fileType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: processedItems }),
      });

      if (!response.ok) throw new Error('Failed to add items');

      setNewItems('');
      setSuccess('항목이 성공적으로 추가되었습니다!');
      setError('');

      await loadData();
      const dataResponse = await fetch(`/api/data/${fileType}`);
      const data = await dataResponse.json();
      const updatedSelected = data.themeList.find((t: Theme) => t.theme === selectedTheme.theme);
      if (updatedSelected) {
        setSelectedTheme(updatedSelected);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('항목 추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteItem = async (item: string) => {
    if (!selectedTheme) return;

    if (!confirm(`"${item}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/themes/${encodeURIComponent(selectedTheme.theme)}/items/${encodeURIComponent(item)}?fileType=${fileType}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setSuccess('항목이 삭제되었습니다!');
      setError('');

      await loadData();
      const dataResponse = await fetch(`/api/data/${fileType}`);
      const data = await dataResponse.json();
      const updatedSelected = data.themeList.find((t: Theme) => t.theme === selectedTheme.theme);
      if (updatedSelected) {
        setSelectedTheme(updatedSelected);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('항목 삭제에 실패했습니다.');
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = themes.findIndex((item) => item.theme === active.id);
      const newIndex = themes.findIndex((item) => item.theme === over.id);

      const newThemes = arrayMove(themes, oldIndex, newIndex);
      setThemes(newThemes);

      try {
        const themeNames = newThemes.map(t => t.theme);
        const response = await fetch(`/api/themes/reorder?fileType=${fileType}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeNames }),
        });

        if (!response.ok) throw new Error('Failed to reorder themes');
      } catch (error) {
        setError('순서 변경에 실패했습니다.');
        await loadData();
      }
    }
  };

  const handleRenameTheme = async (oldName: string, newName: string) => {
    try {
      const response = await fetch(`/api/themes/${encodeURIComponent(oldName)}?fileType=${fileType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename theme');
      }

      setSuccess('테마 이름이 변경되었습니다!');
      setError('');

      await loadData();
      const dataResponse = await fetch(`/api/data/${fileType}`);
      const data = await dataResponse.json();

      if (selectedTheme && selectedTheme.theme === oldName) {
        const updatedSelected = data.themeList.find((t: Theme) => t.theme === newName);
        if (updatedSelected) {
          setSelectedTheme(updatedSelected);
        }
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('테마 이름 변경에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>JSON CRUD 관리</h1>
        <div className="file-type-selector">
          <button
              className={fileType === 'theme' ? 'active' : ''}
              onClick={() => setFileType('theme')}
          >
            Theme
          </button>
          <button
            className={fileType === 'actors' ? 'active' : ''}
            onClick={() => setFileType('actors')}
          >
            Actors
          </button>
          <button
            className={fileType === 'tags' ? 'active' : ''}
            onClick={() => setFileType('tags')}
          >
            Tags
          </button>
          <button
              className={fileType === 'meta' ? 'active' : ''}
              onClick={() => setFileType('meta')}
          >
            Meta
          </button>
          <button
              className={fileType === 'custom' ? 'active' : ''}
              onClick={() => setFileType('custom')}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="metadata-section">
        {isEditingMetadata ? (
          <div className="metadata-edit">
            <div className="metadata-field">
              <label>이름:</label>
              <input
                type="text"
                value={editThemeName}
                onChange={(e) => setEditThemeName(e.target.value)}
              />
            </div>
            <div className="metadata-field">
              <label>설명:</label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="metadata-actions">
              <button onClick={handleUpdateMetadata}>저장</button>
              <button onClick={() => setIsEditingMetadata(false)}>취소</button>
            </div>
          </div>
        ) : (
          <div className="metadata-display">
            <div className="metadata-content">
              <h2>{themeName}</h2>
              <p>{description}</p>
            </div>
            <button
              onClick={() => {
                setEditThemeName(themeName);
                setEditDescription(description);
                setIsEditingMetadata(true);
              }}
            >
              편집
            </button>
          </div>
        )}
      </div>

      <div className="create-theme-section">
        <h2>새 테마 만들기</h2>
        <form onSubmit={handleCreateTheme} className="create-theme-form">
          <input
            type="text"
            placeholder="테마 이름 입력..."
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
          />
          <button type="submit">생성</button>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      <div className="themes-container">
        <div className="themes-list">
          <h2>테마 목록</h2>
          {themes.length === 0 ? (
            <div className="empty-state">테마가 없습니다.</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={themes.map(t => t.theme)}
                strategy={verticalListSortingStrategy}
              >
                {themes.map((theme) => (
                  <SortableThemeItem
                    key={theme.theme}
                    theme={theme}
                    isSelected={selectedTheme?.theme === theme.theme}
                    onClick={() => setSelectedTheme(theme)}
                    onRename={handleRenameTheme}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="theme-detail">
          {selectedTheme ? (
            <>
              <h2>{selectedTheme.theme}</h2>

              <div className="add-items-section">
                <h3>항목 추가</h3>
                <form onSubmit={handleAddItems}>
                  <textarea
                    placeholder="여러 줄로 항목을 입력하세요 (예: ABC-1234)"
                    value={newItems}
                    onChange={(e) => setNewItems(e.target.value)}
                  />
                  <button type="submit">추가</button>
                </form>
              </div>

              <div className="items-list">
                <h3>항목 목록 ({selectedTheme.list.length}개)</h3>
                {selectedTheme.list.length === 0 ? (
                  <div className="empty-state">항목이 없습니다.</div>
                ) : (
                  selectedTheme.list.map((item) => (
                    <div key={item} className="item">
                      <span className="item-code">{item}</span>
                      <button onClick={() => handleDeleteItem(item)}>삭제</button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">테마를 선택해주세요.</div>
          )}
        </div>
      </div>
    </div>
  );
}
