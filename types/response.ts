export interface APIResponse<TData = unknown> {
  message: string;
  data: TData;
}

export interface Paginated<TItem> {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
}
