# Firebase Configuration & Schema

## Project Overview
This document outlines the Firestore data structure and security model for "The Circle" fan platform.

## Collections

### `users`
Stores user profiles and subscription status.
- **Document ID**: `auth.uid`
- **Fields**:
  - `email` (string): User's email address.
  - `isSubscriber` (boolean): Whether the user has an active Stripe subscription.
  - `role` (string): `'admin'` or `'user'`. Defaults to `'user'`.
  - `stripeCustomerId` (string|null): Stripe Customer ID linkage.
  - `createdAt` (timestamp): Profile creation time.
  - `lastUpdated` (timestamp): Last profile update.
  - `lastVerifiedAt` (timestamp): Last manual verification check.

### `posts`
Stores the content feed (media items).
- **Document ID**: Auto-generated
- **Fields**:
  - `caption` (string): Text description of the post.
  - `mediaUrl` (string): Public URL to the file in Firebase Storage.
  - `type` (string): `'image'` or `'video'`.
  - `isFree` (boolean): If `true`, visible to non-subscribers. if `false`, locked.
  - `createdAt` (timestamp): When the post was uploaded.

## Storage Buckets
- `posts/`: Stores all uploaded media files using timestamp-based filenames.

## Security Model (RBAC)
- **Admins**: Full read/write access to `posts` and `users`.
- **Subscribers**: Read access to all `posts`. Read/Write access to own `users` doc.
- **Public/Free Users**: Read access to `posts` where `isFree == true`. Read/Write access to own `users` doc.
