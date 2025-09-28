# Administration — User Management

The **User Management** page (`/admin/user-management`) centralises account administration tasks. It is protected by the `auth` and `admin` route middleware so only authenticated administrators can access it. The view is powered by the `useUsersStore` Pinia store, which performs optimistic updates against the `/api/users` endpoints to load, create, update, and delete `AuthUser` records.

The interface uses Vuetify's `v-data-table` to display the current users and provides modal dialogs for creating, editing, and deleting entries with basic validation (email, status, roles). The page text is localised with `admin.userManagement.*` keys inside the i18n catalog.
