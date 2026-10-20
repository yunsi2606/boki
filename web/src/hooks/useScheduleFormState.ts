import { useState, useEffect } from 'react';
import type { ReleaseScheduleItem, ReleaseStoreLinkItem } from '@/types/schedule';
import type { CreateSchedulePayload, CreateEditionPayload } from '@/services/scheduleService';
import type { ParsedScheduleData } from '@/utils/scheduleTextParserTypes';
import {
  DEFAULT_SCHEDULE_FORM,
  mergeSpecsList,
  convertParsedEditions,
  toSafeString,
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
  const [storeLinks, setStoreLinks] = useState<ReleaseStoreLinkItem[]>([]);
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
      setStoreLinks(initialItem.storeLinks ? [...initialItem.storeLinks] : []);
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
      setStoreLinks([]);
    }
  }, [initialItem, isOpen]);

  const handleApplySmartFill = (data: ParsedScheduleData) => {
    const t = toSafeString(data.title); if (t) setTitle(t);
    const ot = toSafeString(data.originalTitle); if (ot) setOriginalTitle(ot);
    const pub = toSafeString(data.publisher); if (pub) setPublisher(pub);
    const auth = toSafeString(data.author); if (auth) setAuthor(auth);
    const art = toSafeString(data.artist); if (art) setArtist(art);
    const imp = toSafeString(data.imprint); if (imp) setImprint(imp);
    const gen = toSafeString(data.genres); if (gen) setGenres(gen);
    const fmt = toSafeString(data.format); if (fmt) setFormat(fmt);
    const stat = toSafeString(data.seriesStatus); if (stat) setSeriesStatus(stat);
    const age = toSafeString(data.ageRating); if (age) setAgeRating(age);
    const rel = toSafeString(data.releaseDate); if (rel) setReleaseDate(rel);
    const pre = toSafeString(data.preOrderDate); if (pre) setPreOrderDate(pre);
    const desc = toSafeString(data.description); if (desc) setDescription(desc);

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

  const handleAddStoreLink = () =>
    setStoreLinks([...storeLinks, { platform: 'SHOPEE', productUrl: '' }]);
  const handleRemoveStoreLink = (idx: number) =>
    setStoreLinks(storeLinks.filter((_, i) => i !== idx));
  const handleUpdateStoreLink = (idx: number, updated: ReleaseStoreLinkItem) => {
    const list = [...storeLinks];
    list[idx] = updated;
    setStoreLinks(list);
  };

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
        storeLinks: storeLinks.filter((s) => s.productUrl && s.productUrl.trim().length > 0),
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
    storeLinks,
    handleAddStoreLink,
    handleRemoveStoreLink,
    handleUpdateStoreLink,
    submitting,
    handleAddEdition,
    handleUpdateEdition,
    handleUpdateSingleEdition,
    handleRemoveEdition,
    handleApplySmartFill,
    handleSubmit,
  };
}
