import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../services/storageService.js';
import { dataService } from '../services/dataService.js';
import { useLanguage } from './LanguageContext.jsx';

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
  const { t } = useTranslation();
  const { bcp47 } = useLanguage();
  const [bookmarks, setBookmarks] = useState(() => storageService.loadBookmarks());
  const [notes, setNotes] = useState(() => storageService.loadNotes());

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    storageService.saveBookmarks(bookmarks);
  }, [bookmarks]);

  const isBookmarked = (itemId) => {
    return bookmarks.some((b) => b.itemId === itemId);
  };

  const toggleBookmark = (item) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.itemId === item.id);
      if (exists) {
        return prev.filter((b) => b.itemId !== item.id);
      }
      return [
        ...prev,
        {
          itemId: item.id,
          itemType: item.type || item.productType || 'content',
          category: item.category,
          title: item.title || item.name,
          thumbnail: item.thumbnail || item.image,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeBookmark = (itemId) => {
    setBookmarks((prev) => prev.filter((b) => b.itemId !== itemId));
    // Also remove associated session note if any
    deleteNote(itemId);
  };

  const saveNote = (itemId, noteText) => {
    storageService.saveNote(itemId, noteText);
    setNotes((prev) => {
      if (!noteText || noteText.trim() === '') {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: noteText.trim() };
    });
  };

  const deleteNote = (itemId) => {
    storageService.deleteNote(itemId);
    setNotes((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const exportBookmarksAsText = () => {
    if (bookmarks.length === 0) return false;

    const lines = [
      '=====================================================',
      `       ${t('bookmarkExport.headerTitle')}     `,
      '=====================================================',
      t('bookmarkExport.exportedAt', { datetime: new Date().toLocaleString(bcp47) }),
      t('bookmarkExport.totalSaved', { count: bookmarks.length }),
      '-----------------------------------------------------\n',
    ];

    bookmarks.forEach((b, index) => {
      lines.push(`${index + 1}. [${b.category?.toUpperCase() || t('bookmarkExport.generalCategory')}] ${b.title}`);
      lines.push(t('bookmarkExport.itemIdLabel', { id: b.itemId }));
      lines.push(t('bookmarkExport.itemTypeLabel', { type: b.itemType }));
      lines.push(t('bookmarkExport.savedDateLabel', { date: new Date(b.addedAt).toLocaleDateString(bcp47) }));
      if (notes[b.itemId]) {
        lines.push(t('bookmarkExport.noteLabel', { note: notes[b.itemId] }));
      }
      lines.push('');
    });

    lines.push('=====================================================');
    lines.push(t('bookmarkExport.thankYou'));
    lines.push(t('bookmarkExport.footer'));

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fandomverse-bookmarks-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        bookmarkCount: bookmarks.length,
        notes,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        saveNote,
        deleteNote,
        exportBookmarksAsText,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks phải được sử dụng bên trong BookmarkProvider');
  }
  return context;
}
