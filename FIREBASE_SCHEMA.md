# Firebase Configuration & Schema

## Project Overview
This document outlines the Firestore data structure and security model for "The Circle" fan platform.

## Collections

### `users`
Stores user profiles and subscription status.
- **Document ID**: `auth.uid`
- **Fields**:
  - `email` (string): User's email address.
  - `displayName` (string|null): User's display name.
  - `photoURL` (string|null): Profile photo URL.
  - `role` (string): `'admin'`, `'creator'`, or `'user'`. Defaults to `'user'`.
  - `isSubscriber` (boolean): Whether the user has an active Stripe subscription.
  - `isVerified` (boolean): Whether email is verified.
  - `stripeCustomerId` (string|null): Stripe Customer ID linkage.
  - `preferences` (object): User preferences.
    - `theme` (string): Selected theme. Defaults to `'default'`.
    - `emailNotifications` (boolean): Email notification preference.
  - `createdAt` (timestamp): Profile creation time.
  - `lastUpdated` (timestamp|null): Last profile update.
  - `lastVerifiedAt` (timestamp|null): Last manual verification check.
  - `migratedAt` (timestamp|null): When user was last migrated.
  - `migrationVersion` (number|null): Migration version applied.

### `posts`
Stores the content feed (media items).
- **Document ID**: Auto-generated
- **Fields**:
  - `caption` (string): Text description of the post.
  - `mediaUrl` (string): Public URL to the file in Firebase Storage.
  - `type` (string): `'image'` or `'video'`.
  - `isFree` (boolean): If `true`, visible to non-subscribers. if `false`, locked.
  - `createdAt` (timestamp): When the post was uploaded.

### `messages`
Stores direct messages from users to Nicole.
- **Document ID**: Auto-generated
- **Fields**:
  - `userId` (string): The sender's auth UID.
  - `userEmail` (string): The sender's email for display.
  - `subject` (string): Message subject line.
  - `content` (string): Message body text.
  - `createdAt` (timestamp): When the message was sent.
  - `hasReply` (boolean): Whether Nicole has replied.
  - `repliedAt` (timestamp|null): When Nicole replied.
  - `readAt` (timestamp|null): When user read Nicole's reply.

#### Subcollection: `messages/{messageId}/replies`
Stores replies in a conversation thread.
- **Document ID**: Auto-generated
- **Fields**:
  - `content` (string): Reply message text.
  - `fromCreator` (boolean): `true` if from Nicole, `false` if user follow-up.
  - `userId` (string|null): User's ID if not from creator.
  - `createdAt` (timestamp): When the reply was sent.

## Storage Buckets
- `posts/`: Stores all uploaded media files using timestamp-based filenames.

## Security Model (RBAC)
- **Admins**: Full read/write access to `posts` and `users`.
- **Subscribers**: Read access to all `posts`. Read/Write access to own `users` doc.
- **Public/Free Users**: Read access to `posts` where `isFree == true`. Read/Write access to own `users` doc.
