export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  communityId: string;
  communityName: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  user: User;
}
