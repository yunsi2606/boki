import {
  type ParsedScheduleData,
  type ParsedEditionData,
  KNOWN_PUBLISHERS,
  normalizeDate,
  normalizePrice,
} from './scheduleTextParserTypes';

export * from './scheduleTextParserTypes';

/**
 * Phân tích Plain Text tiếng Việt có hoặc không có nhãn trường (Heuristics).
 */
export function parseSchedulePlainText(text: string): ParsedScheduleData {
  if (!text || !text.trim()) return {};

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const result: ParsedScheduleData = {};
  const specs: Record<string, string> = {};
  const editions: ParsedEditionData[] = [];
  const unparsedLines: string[] = [];

  for (const line of lines) {
    // 1. Tựa đề / Tên sách
    const titleMatch = line.match(/^(?:tựa đề|tên sách|tên tác phẩm|tên truyện|sách|truyện|title)\s*[:：\-]\s*(.+)$/i);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
      continue;
    }

    // 2. Tên gốc
    const origMatch = line.match(/^(?:tên gốc|tên tiếng nhật|tên tiếng anh|nguyên tác|original title)\s*[:：\-]\s*(.+)$/i);
    if (origMatch) {
      result.originalTitle = origMatch[1].trim();
      continue;
    }

    // 3. Tác giả & Họa sĩ
    const authorMatch = line.match(/^(?:tác giả|kịch bản|author|tg)\s*[:：\-]\s*(.+)$/i);
    if (authorMatch) {
      result.author = authorMatch[1].trim();
      continue;
    }

    const artistMatch = line.match(/^(?:họa sĩ|minh họa|art|artist)\s*[:：\-]\s*(.+)$/i);
    if (artistMatch) {
      result.artist = artistMatch[1].trim();
      continue;
    }

    // 4. Nhà xuất bản & Imprint
    const pubMatch = line.match(/^(?:nhà xuất bản|nxb|publisher)\s*[:：\-]\s*(.+)$/i);
    if (pubMatch) {
      result.publisher = pubMatch[1].trim();
      continue;
    }

    const imprintMatch = line.match(/^(?:đơn vị phát hành|phát hành bởi|nhãn|imprint)\s*[:：\-]\s*(.+)$/i);
    if (imprintMatch) {
      result.imprint = imprintMatch[1].trim();
      continue;
    }

    // 5. Thể loại & Định dạng
    const genreMatch = line.match(/^(?:thể loại|genres?)\s*[:：\-]\s*(.+)$/i);
    if (genreMatch) {
      result.genres = genreMatch[1].trim();
      continue;
    }

    const formatMatch = line.match(/^(?:định dạng|format)\s*[:：\-]\s*(.+)$/i);
    if (formatMatch) {
      const fmt = formatMatch[1].toUpperCase();
      if (fmt.includes('LIGHT') || fmt.includes('LN')) result.format = 'LIGHT_NOVEL';
      else if (fmt.includes('COMIC')) result.format = 'COMIC';
      else if (fmt.includes('ART')) result.format = 'ARTBOOK';
      else result.format = 'MANGA';
      continue;
    }

    // 6. Ngày phát hành & Pre-order
    const dateMatch = line.match(/^(?:ngày phát hành|phát hành|lên kệ|ra mắt|ngày ra mắt|release date)\s*[:：\-]\s*(.+)$/i);
    if (dateMatch) {
      const d = normalizeDate(dateMatch[1]);
      if (d) result.releaseDate = d;
      continue;
    }

    const preMatch = line.match(/^(?:ngày đặt trước|pre-?order|mở đặt)\s*[:：\-]\s*(.+)$/i);
    if (preMatch) {
      const d = normalizeDate(preMatch[1]);
      if (d) result.preOrderDate = d;
      continue;
    }

    // 7. Thông số kỹ thuật (Dịch giả, Khổ sách, Số trang, Loại bìa)
    const transMatch = line.match(/^(?:dịch giả|người dịch|translator)\s*[:：\-]\s*(.+)$/i);
    if (transMatch) {
      specs['Dịch giả'] = transMatch[1].trim();
      continue;
    }

    const sizeMatch = line.match(/^(?:khổ sách|khổ|kích thước|size)\s*[:：\-]\s*(.+)$/i);
    if (sizeMatch) {
      specs['Khổ sách'] = sizeMatch[1].trim();
      continue;
    }

    const pagesMatch = line.match(/^(?:số trang|trang|pages?)\s*[:：\-]\s*(.+)$/i);
    if (pagesMatch) {
      specs['Số trang'] = pagesMatch[1].replace(/\D/g, '').trim() || pagesMatch[1].trim();
      continue;
    }

    const coverTypeMatch = line.match(/^(?:loại bìa|hình thức|quy cách|bìa)\s*[:：\-]\s*(.+)$/i);
    if (coverTypeMatch) {
      specs['Loại bìa'] = coverTypeMatch[1].trim();
      continue;
    }

    // 8. Phiên bản đặc biệt / giới hạn
    const specialMatch = line.match(/^(?:bản đặc biệt|phiên bản đặc biệt|special edition|limited edition|bản giới hạn)\s*[:：\-]\s*(.+)$/i);
    if (specialMatch) {
      const detail = specialMatch[1];
      const p = detail.match(/(?:giá|giá bán)?\s*[:：\-]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+k?)/i);
      const giftsMatch = detail.match(/(?:quà tặng|tặng kèm|kèm)\s*[:：\-]?\s*([^,;]+)/i);
      editions.push({
        editionName: 'Bản Đặc Biệt',
        editionType: 'SPECIAL',
        estimatedPrice: p ? normalizePrice(p[1]) : undefined,
        gifts: giftsMatch ? giftsMatch[1].trim() : detail.trim(),
      });
      continue;
    }

    // 9. Giá bìa / Quà tặng bản thường
    const priceMatch = line.match(/^(?:giá bìa|giá bán|giá|price)\s*[:：\-]\s*(.+)$/i);
    if (priceMatch) {
      const p = normalizePrice(priceMatch[1]);
      if (p) {
        if (editions.length === 0) {
          editions.push({ editionName: 'Bản Phổ Thông', editionType: 'STANDARD', estimatedPrice: p });
        } else {
          editions[0].estimatedPrice = p;
        }
      }
      continue;
    }

    const giftMatch = line.match(/^(?:quà tặng|quà kèm|phụ kiện|quà tặng kèm|gifts?)\s*[:：\-]\s*(.+)$/i);
    if (giftMatch) {
      if (editions.length === 0) {
        editions.push({ editionName: 'Bản Phổ Thông', editionType: 'STANDARD', gifts: giftMatch[1].trim() });
      } else {
        editions[0].gifts = giftMatch[1].trim();
      }
      continue;
    }

    // 10. Mô tả / Tóm tắt
    const descMatch = line.match(/^(?:giới thiệu|mô tả|tóm tắt|nội dung)\s*[:：\-]\s*(.+)$/i);
    if (descMatch) {
      result.description = descMatch[1].trim();
      continue;
    }

    unparsedLines.push(line);
  }

  // Heuristic Scan on unparsed free-form lines
  for (const line of unparsedLines) {
    if (!result.publisher) {
      const foundPub = KNOWN_PUBLISHERS.find((p) => line.toLowerCase().includes(p.toLowerCase()));
      if (foundPub) result.publisher = foundPub.replace(/^NXB\s+/, '');
    }

    if (!result.releaseDate) {
      const d = normalizeDate(line);
      if (d) result.releaseDate = d;
    }

    if (!editions[0]?.estimatedPrice) {
      const pm = line.match(/(?:giá|giá bìa|giá bán)?\s*(\d{1,3}(?:[.,]\d{3})*|\d{2,3}k)\s*(?:đ|vnđ|vnd)?\b/i);
      if (pm) {
        const p = normalizePrice(pm[1]);
        if (p) {
          if (editions.length === 0) {
            editions.push({ editionName: 'Bản Phổ Thông', editionType: 'STANDARD', estimatedPrice: p });
          } else {
            editions[0].estimatedPrice = p;
          }
        }
      }
    }

    if (!result.title && line.length > 4 && !line.startsWith('http')) {
      if (/(?:tập|vol\.?|volume|quyển)\s*\d+/i.test(line)) {
        result.title = line.replace(/^[-\*\•\d\.\s]+/, '').trim();
      }
    }
  }

  if (Object.keys(specs).length > 0) result.specs = specs;
  if (editions.length > 0) result.editions = editions;

  return result;
}
