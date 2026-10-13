export interface BookExcelVariantData {
  rowNumber: number;
  name: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  imageRef?: string;
  resolvedImageUrl?: string;
}

export interface BookExcelGroupedBook {
  rowNumber: number;
  title: string;
  author: string;
  categoryNames: string[];
  isbn?: string;
  publisher?: string;
  supplier?: string;
  publicationYear?: string;
  coverType?: string;
  pageCount?: number;
  condition: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  coverImageRef?: string;
  detailImagesRef: string[];
  resolvedCoverUrl?: string;
  resolvedDetailUrls: string[];
  isPreOrder: boolean;
  preOrderDays?: number;
  maxOrderQuantity?: number;
  description?: string;
  variants: BookExcelVariantData[];
  validationErrors: string[];
}

export interface BookExcelRowError {
  rowNumber: number;
  title: string;
  field: string;
  errorMessage: string;
}

export interface BookExcelImportResult {
  totalRows: number;
  totalBooks: number;
  validBooksCount: number;
  errorCount: number;
  errors: BookExcelRowError[];
  books: BookExcelGroupedBook[];
  isDryRun: boolean;
}
