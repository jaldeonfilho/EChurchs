export interface Asset {
  id: string;
  name: string;
  description?: string;
  categoryName: string;
  categoryId: string;
  purchaseDate?: string;
  purchaseValue?: number;
  currentValue?: number;
  status: string;
  location?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  assetCount: number;
}
