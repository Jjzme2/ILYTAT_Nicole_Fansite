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
  - `fullName` (string|null): User's full name (private).
  - `birthday` (string|null): User's birthday (YYYY-MM-DD).
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

#### Subcollection: `users/{userId}/notifications`
Stores direct notifications for the user.
- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string): Notification title.
  - `message` (string): Notification body.
  - `type` (string): `'alert'`, `'brand_deal'`, `'success'`, `'giveaway'`.
  - `actionUrl` (string|null): Optional link.
  - `read` (boolean): Read status.
  - `createdAt` (timestamp): Creation time.

### `posts`
Stores the content feed (media items).
- **Document ID**: Auto-generated
- **Fields**:
  - `caption` (string): Text description of the post.
  - `mediaUrl` (string): Public URL to the file in Firebase Storage.
  - `type` (string): `'image'`, `'video'`, `'text'`, or `'audio'`.
  - `subtype` (string|null): For text posts: `'quote'`, `'motivation'`, `'blog'`, `'status'`.
  - `citation` (string|null): Author/source for quote posts.
  - `title` (string|null): Title for blog posts.
  - `mood` (string|null): Mood/Feeling for status posts.
  - `theme` (string|null): Visual theme (gradient/color) for motivation, quotes, and status.
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

### `system_messages`
Stores global broadcasts (banners, toasts) sent by admins.
- **Document ID**: Auto-generated
- **Fields**:
  - `content` (string): The message text.
  - `type` (string): `'info'`, `'success'`, `'warning'`, `'error'`, `'announcement'`.
  - `style` (string): `'toast'` or `'banner'`.
  - `dismissible` (boolean): If users can close it.
  - `durationHours` (number): How long it remains active if not dismissible.
  - `isActive` (boolean): Control flag.
  - `createdBy` (string): User ID of admin sender.
  - `createdAt` (timestamp): Creation time.
  - `expiresAt` (timestamp|null): Auto-expiration time.

### `brand_deals`
Stores managed sponsorship deals.
- **Document ID**: Auto-generated
- **Fields**:
  - `brandName` (string): Name of the sponsor.
  - `value` (string): Monetary value (e.g. "$500").
  - `contactName` (string): Point of contact.
  - `contactEmail` (string): Contact email.
  - `status` (string): `'pending'`, `'active'`, `'completed'`, `'cancelled'`.
  - `deliverables` (string): Required output description.
  - `notes` (string): Internal notes.
  - `createdAt` (timestamp): Creation time.
  - `updatedAt` (timestamp): Last update time.

### `giveaways` (Campaigns)
Stores generic campaigns and scheduled drops.
The broadcasted- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string): Campaign title.
  - `description` (string): Campaign details.
  - `image` (string): Banner image URL.
  - `goLiveDate` (timestamp|null): "Coming soon" teaser date.
  - `startDate` (timestamp): Campaign start.
  - `endDate` (timestamp): Campaign end.
  - `createdAt` (timestamp): Creation time.

#### Subcollection: `giveaways/{campaignId}/rounds`
Stores individual drops or selection rounds within a campaign.
- **Document ID**: Auto-generated
- **Fields**:
  - `activationTime` (timestamp): When the round starts.
  - `endTime` (timestamp): When the round ends.
  - `status` (string): `'scheduled'`, `'live'`, `'ended'`.
  - `winner` (string|null): Winner name/ID.

### `tasks`
Stores developer tasks (Dev Board).
- **Document ID**: Auto-generated
- **Fields**:
  - `title` (string): Task summary.
  - `type` (string): `'feature'`, `'bug'`, `'design'`, `'chore'`.
  - `section` (string): Board section/column.
  - `subsection` (string): Category tag.
  - `priority` (string): `'high'`, `'med'`, `'low'`.
  - `status` (string): `'todo'`, `'in_progress'`, `'done'`.
  - `description` (string): Detailed notes.
  - `goals` (string): Outcome definition.
  - `createdAt` (timestamp): Creation time.

### `notifications`
Stores system alerts for admins/creators.
- **Document ID**: Auto-generated
- **Fields**:
  - `type` (string): Event type (e.g., `'brand_deal'`).
  - `title` (string): Notification title.
  - `message` (string): Notification body.
  - `read` (boolean): Read status.
  - `actionUrl` (string): Link to relevant admin section.
  - `createdAt` (timestamp): Event time.

### `suggestions`
Stores user feedback or feature requests.
- **Document ID**: Auto-generated
- **Fields**:
  - `content` (string): The suggestion text.
  - `userId` (string): Suggester's UID.
  - `createdAt` (timestamp): Submission time.

### `quota_resets`
Logs automated or manual quota reset actions.
- **Document ID**: Auto-generated
- **Fields**:
  - `timestamp` (timestamp): Log time.
  - `isGlobal` (boolean): `true` if system-wide, `false` if individual user.

## Storage Buckets
- `posts/`: Stores all uploaded media files using timestamp-based filenames.

## Security Model (RBAC)
- **Admins**: Full read/write access to all collections.
- **Creators**: Read/write access to `posts`, `messages`, `brand_deals`, `giveaways`.
- **Subscribers**: Read access to all `posts`. Read/Write access to own `users` doc.
- **Public/Free Users**: Read access to `posts` where `isFree == true`. Read/Write access to own `users` doc.
