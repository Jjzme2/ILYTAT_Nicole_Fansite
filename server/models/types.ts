// Collection: users
export interface UserProfile {
    uid: string;
    email: string | null;
    isSubscriber: boolean;
    stripeCustomerId: string | null;
    role?: 'admin' | 'user' | 'creator' | 'developer'; // Deprecated in favor of roles
    roles?: ('admin' | 'user' | 'creator' | 'developer')[];
    createdAt?: Date;
    lastUpdated?: Date;
}

// Collection: media_kits
export interface MediaKit {
    id?: string;
    bio: string;
    location?: string;
    photoUrl?: string;
    // Map of platform key (tiktok, instagram) to its specific stats
    platforms: Record<string, Record<string, string | number>>;
    createdAt: any; // Firestore Timestamp
    createdBy: string;
}

// Collection: brand_deals
export interface BrandDeal {
    id?: string;
    brandName: string;
    contactName: string;
    contactEmail: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    value: string;
    deliverables: string;
    notes?: string;
    createdAt: any;
    updatedAt: any;
}

// Collection: posts
export interface Post {
    id?: string;
    caption: string;
    mediaUrl: string;
    type: 'image' | 'video' | 'text' | 'audio';
    subtype?: 'quote' | 'motivation' | 'blog' | 'status' | string;
    citation?: string;
    title?: string;
    mood?: string;
    theme?: string;
    isFree: boolean;
    createdAt: any; // Firestore Timestamp
}

// Collection: suggestions
export interface Suggestion {
    id?: string;
    type: 'music' | 'trend' | 'content' | 'other';
    content: string;
    userId: string;
    userEmail?: string;
    createdAt: any;
}





// Subcollection: posts/{id}/comments
export interface Comment {
    id?: string;
    text: string;
    userId: string;
    userEmail?: string;
    createdAt: any;
}
