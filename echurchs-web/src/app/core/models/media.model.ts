export interface PhotoAlbum {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  photoCount: number;
  createdAt: string;
}

export interface VideoAlbum {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  videoCount: number;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  category?: string;
  createdAt: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  fieldCount: number;
  responseCount: number;
  createdAt: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  options?: string;
  displayOrder: number;
}
