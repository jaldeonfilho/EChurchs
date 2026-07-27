export interface Community {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  slug?: string;
  memberCount: number;
  planName?: string;
  createdAt: string;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  nipc?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  nipc?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
}

export interface JoinCommunityRequest {
  communityId: string;
}

export interface MembershipActionRequest {
  membershipId: string;
  action: string;
  newRole?: any;
}

export interface MembershipResponse {
  id: string;
  communityId: string;
  communityName: string;
  role: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userProfileImage?: string;
  userBio?: string;
  userDateOfBirth?: string;
  userGender?: string;
  userMaritalStatus?: string;
  userAddress?: string;
  userCity?: string;
  userDistrict?: string;
  userPostalCode?: string;
}
