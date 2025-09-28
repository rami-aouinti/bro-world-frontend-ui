# Blog — Author Action Menu

The `AuthorActionMenu` component (`~/components/blog/AuthorActionMenu.vue`) centralises the logic that powers the action affordances shown next to post and comment metadata. It encapsulates the focus-trap behaviour, click-outside handling, and follow-state rendering that previously lived separately in `PostMeta` and `CommentMeta`.

## Usage

The menu exposes the same props that `PostMeta` and `CommentMeta` forwarded before, plus a `variant` prop that adjusts spacing and typography for post (`variant="post"`) or comment (`variant="comment"`) contexts. Both meta components now delegate to this shared abstraction:

```vue
<AuthorActionMenu
  :is-authenticated="isAuthenticated"
  :is-author="isAuthor"
  :is-following="isFollowing"
  :follow-loading="followLoading"
  :follow-label="followLabel"
  :follow-loading-label="followLoadingLabel"
  :actions-aria-label="actionsAriaLabel"
  :edit-label="editLabel"
  :delete-label="deleteLabel"
  variant="post"
  @follow="onFollow"
  @edit="onEdit"
  @delete="onDelete"
/>
```

Consumers can override the default `data-test` hooks through props such as `menuTriggerTestId` or `followButtonTestId` when building bespoke stories or tests.
