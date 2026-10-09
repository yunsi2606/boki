import { useState, useEffect } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import type { CreateSchedulePayload, CreateEditionPayload } from '@/services/scheduleService';

export function useScheduleFormState(
  initialItem: ReleaseScheduleItem | null | undefined,
  isOpen: boolean,
  onSubmit: (payload: CreateSchedulePayload) => Promise<void>,
  onClose: () => void
) {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [publisher, setPublisher] = useState('Kim Đồng');
  const [author, setAuthor] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [preOrderDate, setPreOrderDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [editions, setEditions] = useState<CreateEditionPayload[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setOriginalTitle(initialItem.originalTitle || '');
      setPublisher(initialItem.publisher || 'Kim Đồng');
      setAuthor(initialItem.author || '');
      setReleaseDate(initialItem.releaseDate || '');
      setPreOrderDate(initialItem.preOrderDate || '');
      setCoverUrl(initialItem.coverUrl || '');
      setDescription(initialItem.description || '');

      if (initialItem.editions && initialItem.editions.length > 0) {
        setEditions(
          initialItem.editions.map((e, idx) => ({
            id: e.id,
            editionName: e.editionName,
            editionType: e.editionType,
            releaseDate: e.releaseDate || null,
            preOrderDate: e.preOrderDate || null,
            estimatedPrice: e.estimatedPrice,
            gifts: e.gifts || '',
            coverUrl: e.coverUrl || '',
            bookId: e.bookId || null,
            sortOrder: e.sortOrder ?? idx,
          }))
        );
      } else {
        setEditions([
          {
            editionName: 'Bản Phổ Thông',
            editionType: 'STANDARD',
            releaseDate: null,
            preOrderDate: null,
            sortOrder: 0,
          },
        ]);
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTitle('');
      setOriginalTitle('');
      setPublisher('Kim Đồng');
      setAuthor('');
      setReleaseDate(today);
      setPreOrderDate('');
      setCoverUrl('');
      setDescription('');
      setEditions([
        {
          editionName: 'Bản Phổ Thông',
          editionType: 'STANDARD',
          releaseDate: null,
          preOrderDate: null,
          sortOrder: 0,
        },
      ]);
    }
  }, [initialItem, isOpen]);

  const handleAddEdition = () => {
    setEditions([
      ...editions,
      {
        editionName: editions.length === 1 ? 'Bản Đặc Biệt' : `Phiên bản #${editions.length + 1}`,
        editionType: editions.length === 1 ? 'SPECIAL' : 'STANDARD',
        releaseDate: null,
        preOrderDate: null,
        sortOrder: editions.length,
      },
    ]);
  };

  const handleUpdateEdition = (idx: number, updated: CreateEditionPayload) => {
    const list = [...editions];
    list[idx] = updated;
    setEditions(list);
  };

  const handleRemoveEdition = (idx: number) => {
    setEditions(editions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publisher.trim() || !releaseDate) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        publisher: publisher.trim(),
        author: author.trim() || undefined,
        releaseDate,
        preOrderDate: preOrderDate.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        description: description.trim() || undefined,
        editions,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    title, setTitle,
    originalTitle, setOriginalTitle,
    publisher, setPublisher,
    author, setAuthor,
    releaseDate, setReleaseDate,
    preOrderDate, setPreOrderDate,
    coverUrl, setCoverUrl,
    description, setDescription,
    editions,
    submitting,
    handleAddEdition,
    handleUpdateEdition,
    handleRemoveEdition,
    handleSubmit,
  };
}
