import { useState, useEffect } from 'react';
import type { ReleaseScheduleItem } from '@/types/schedule';
import type { CreateSchedulePayload, CreateEditionPayload } from '@/services/scheduleService';
import type { ParsedScheduleData } from '@/utils/scheduleTextParserTypes';
import {
  DEFAULT_SCHEDULE_FORM,
  mergeSpecsList,
  convertParsedEditions,
} from '@/utils/scheduleFormDefaults';

export function useScheduleFormState(
  initialItem: ReleaseScheduleItem | null | undefined,
  isOpen: boolean,
  onSubmit: (payload: CreateSchedulePayload) => Promise<void>,
  onClose: () => void
) {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [publisher, setPublisher] = useState(DEFAULT_SCHEDULE_FORM.publisher);
  const [author, setAuthor] = useState('');
  const [artist, setArtist] = useState('');
  const [imprint, setImprint] = useState('');
  const [genres, setGenres] = useState(DEFAULT_SCHEDULE_FORM.genres);
  const [format, setFormat] = useState(DEFAULT_SCHEDULE_FORM.format);
  const [seriesStatus, setSeriesStatus] = useState(DEFAULT_SCHEDULE_FORM.seriesStatus);
  const [ageRating, setAgeRating] = useState(DEFAULT_SCHEDULE_FORM.ageRating);
  const [specsList, setSpecsList] = useState<Array<{ key: string; value: string }>>([]);
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
      setPublisher(initialItem.publisher || DEFAULT_SCHEDULE_FORM.publisher);
      setAuthor(initialItem.author || '');
      setArtist(initialItem.artist || '');
      setImprint(initialItem.imprint || '');
      setGenres(initialItem.genres || DEFAULT_SCHEDULE_FORM.genres);
      setFormat(initialItem.format || DEFAULT_SCHEDULE_FORM.format);
      setSeriesStatus(initialItem.seriesStatus || DEFAULT_SCHEDULE_FORM.seriesStatus);
      setAgeRating(initialItem.ageRating || DEFAULT_SCHEDULE_FORM.ageRating);
      setReleaseDate(initialItem.releaseDate || '');
      setPreOrderDate(initialItem.preOrderDate || '');
      setCoverUrl(initialItem.coverUrl || '');
      setDescription(initialItem.description || '');

      try {
        if (initialItem.specs) {
          const parsed = JSON.parse(initialItem.specs);
          setSpecsList(Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v) })));
        } else {
          setSpecsList([]);
        }
      } catch {
        setSpecsList([]);
      }

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
        setEditions([...DEFAULT_SCHEDULE_FORM.defaultEditions]);
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTitle('');
      setOriginalTitle('');
      setPublisher(DEFAULT_SCHEDULE_FORM.publisher);
      setAuthor('');
      setArtist('');
      setImprint('');
      setGenres(DEFAULT_SCHEDULE_FORM.genres);
      setFormat(DEFAULT_SCHEDULE_FORM.format);
      setSeriesStatus(DEFAULT_SCHEDULE_FORM.seriesStatus);
      setAgeRating(DEFAULT_SCHEDULE_FORM.ageRating);
      setSpecsList([...DEFAULT_SCHEDULE_FORM.specsList]);
      setReleaseDate(today);
      setPreOrderDate('');
      setCoverUrl('');
      setDescription('');
      setEditions([...DEFAULT_SCHEDULE_FORM.defaultEditions]);
    }
  }, [initialItem, isOpen]);

  const handleApplySmartFill = (data: ParsedScheduleData) => {
    if (data.title?.trim()) setTitle(data.title.trim());
    if (data.originalTitle?.trim()) setOriginalTitle(data.originalTitle.trim());
    if (data.publisher?.trim()) setPublisher(data.publisher.trim());
    if (data.author?.trim()) setAuthor(data.author.trim());
    if (data.artist?.trim()) setArtist(data.artist.trim());
    if (data.imprint?.trim()) setImprint(data.imprint.trim());
    if (data.genres?.trim()) setGenres(data.genres.trim());
    if (data.format?.trim()) setFormat(data.format.trim());
    if (data.seriesStatus?.trim()) setSeriesStatus(data.seriesStatus.trim());
    if (data.ageRating?.trim()) setAgeRating(data.ageRating.trim());
    if (data.releaseDate?.trim()) setReleaseDate(data.releaseDate.trim());
    if (data.preOrderDate?.trim()) setPreOrderDate(data.preOrderDate.trim());
    if (data.description?.trim()) setDescription(data.description.trim());

    if (data.specs) {
      setSpecsList((prev) => mergeSpecsList(prev, data.specs));
    }
    const converted = convertParsedEditions(data.editions);
    if (converted) {
      setEditions(converted);
    }
  };

  const handleAddSpec = () => setSpecsList([...specsList, { key: '', value: '' }]);
  const handleUpdateSpec = (idx: number, key: string, value: string) => {
    const list = [...specsList];
    list[idx] = { key, value };
    setSpecsList(list);
  };
  const handleRemoveSpec = (idx: number) => setSpecsList(specsList.filter((_, i) => i !== idx));

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
  const handleUpdateSingleEdition = (fields: Partial<CreateEditionPayload>) => {
    if (editions.length === 0) return;
    const list = [...editions];
    list[0] = { ...list[0], ...fields };
    setEditions(list);
  };
  const handleRemoveEdition = (idx: number) => setEditions(editions.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publisher.trim() || !releaseDate) return;

    try {
      setSubmitting(true);
      const validSpecs: Record<string, string> = {};
      specsList.forEach(({ key, value }) => {
        if (key.trim()) validSpecs[key.trim()] = value.trim();
      });

      await onSubmit({
        title: title.trim(),
        originalTitle: originalTitle.trim() || undefined,
        publisher: publisher.trim(),
        author: author.trim() || undefined,
        artist: artist.trim() || undefined,
        imprint: imprint.trim() || undefined,
        genres: genres.trim() || undefined,
        format,
        seriesStatus,
        ageRating,
        specs: Object.keys(validSpecs).length > 0 ? JSON.stringify(validSpecs) : undefined,
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
    artist, setArtist,
    imprint, setImprint,
    genres, setGenres,
    format, setFormat,
    seriesStatus, setSeriesStatus,
    ageRating, setAgeRating,
    specsList,
    handleAddSpec,
    handleUpdateSpec,
    handleRemoveSpec,
    releaseDate, setReleaseDate,
    preOrderDate, setPreOrderDate,
    coverUrl, setCoverUrl,
    description, setDescription,
    editions,
    submitting,
    handleAddEdition,
    handleUpdateEdition,
    handleUpdateSingleEdition,
    handleRemoveEdition,
    handleApplySmartFill,
    handleSubmit,
  };
}
