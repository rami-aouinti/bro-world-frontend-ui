<template>
  <main class="py-10" aria-labelledby="user-management-title">
    <v-container>
      <header class="mb-8">
        <div class="d-flex flex-column flex-lg-row align-lg-center justify-space-between gap-4">
          <div>
            <h1 id="user-management-title" class="text-h4 text-lg-h3 font-weight-bold mb-2">
              {{ t('admin.userManagement.title') }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ t('admin.userManagement.subtitle') }}
            </p>
          </div>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-account-plus"
            class="text-none"
            @click="openCreateDialog"
          >
            {{ t('admin.userManagement.actions.add') }}
          </v-btn>
        </div>
      </header>

      <v-card elevation="8" rounded="xl">
        <v-toolbar color="transparent" class="px-6 pt-4" density="comfortable" flat>
          <div class="d-flex flex-column flex-sm-row align-sm-center gap-3 w-100">
            <v-text-field
              v-model="search"
              :label="t('admin.userManagement.table.search')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              class="flex-grow-1"
            />
          </div>
        </v-toolbar>

        <v-divider />

        <v-alert
          v-if="combinedError"
          type="error"
          variant="tonal"
          class="mx-6 mt-6"
          border="start"
          border-color="error"
        >
          {{ combinedError }}
        </v-alert>

        <v-data-table
          :headers="headers"
          :items="tableItems"
          :items-per-page="10"
          :loading="isLoading"
          :search="search"
          class="user-table"
        >
          <template #item.user="{ item }">
            <div class="d-flex flex-column">
              <span class="text-body-1 font-weight-medium">{{ item.displayName }}</span>
              <span class="text-body-2 text-medium-emphasis">@{{ item.username }}</span>
            </div>
          </template>

          <template #item.email="{ item }">
            <span class="text-body-2">{{ item.email }}</span>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="item.enabled ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              class="text-capitalize font-weight-medium"
            >
              {{ item.enabled ? t('admin.userManagement.status.active') : t('admin.userManagement.status.disabled') }}
            </v-chip>
          </template>

          <template #item.roles="{ item }">
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="role in item.roles"
                :key="`${item.id}-${role}`"
                size="x-small"
                color="primary"
                variant="tonal"
                class="text-uppercase font-weight-medium"
              >
                {{ role }}
              </v-chip>
            </div>
          </template>

          <template #item.updatedAt="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.updatedAt) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                :disabled="isDeleting(item.id)"
                :loading="isUpdating(item.id)"
                @click="openEditDialog(item.id)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                :loading="isDeleting(item.id)"
                @click="openDeleteDialog(item.id)"
              />
            </div>
          </template>

          <template #bottom>
            <div class="px-6 pb-4 text-body-2 text-medium-emphasis">
              <span v-if="!tableItems.length && !isLoading">
                {{ t('admin.userManagement.table.empty') }}
              </span>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <v-dialog v-model="createDialog" persistent max-width="560">
        <v-card rounded="xl">
          <v-card-title class="text-h5 font-weight-semibold">
            {{ t('admin.userManagement.dialogs.create.title') }}
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="createErrors.form"
              type="error"
              variant="tonal"
              class="mb-4"
              border="start"
              border-color="error"
            >
              {{ createErrors.form }}
            </v-alert>

            <v-form @submit.prevent="submitCreate">
              <div class="d-flex flex-column gap-4">
                <v-text-field
                  v-model="createForm.username"
                  :label="t('admin.userManagement.form.username')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="createErrors.username"
                  @update:model-value="clearFieldError(createErrors, 'username')"
                />
                <v-text-field
                  v-model="createForm.email"
                  :label="t('admin.userManagement.form.email')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="createErrors.email"
                  @update:model-value="clearFieldError(createErrors, 'email')"
                />
                <div class="d-flex flex-column flex-sm-row gap-4">
                  <v-text-field
                    v-model="createForm.firstName"
                    :label="t('admin.userManagement.form.firstName')"
                    variant="outlined"
                    density="comfortable"
                    class="flex-grow-1"
                  />
                  <v-text-field
                    v-model="createForm.lastName"
                    :label="t('admin.userManagement.form.lastName')"
                    variant="outlined"
                    density="comfortable"
                    class="flex-grow-1"
                  />
                </div>
                <v-select
                  v-model="createForm.roles"
                  :items="roleOptions"
                  :label="t('admin.userManagement.form.roles')"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  closable-chips
                  :hint="t('admin.userManagement.form.rolesHint')"
                  persistent-hint
                  :error-messages="createErrors.roles"
                  @update:model-value="clearFieldError(createErrors, 'roles')"
                />
                <v-switch
                  v-model="createForm.enabled"
                  inset
                  color="primary"
                  :label="t('admin.userManagement.form.enabled')"
                />
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" class="text-none" @click="closeCreateDialog">
              {{ t('common.close') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="text-none"
              :loading="creatingUser"
              @click="submitCreate"
            >
              {{ t('admin.userManagement.dialogs.create.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="editDialog" max-width="560">
        <v-card rounded="xl">
          <v-card-title class="text-h5 font-weight-semibold">
            {{ t('admin.userManagement.dialogs.edit.title') }}
          </v-card-title>
          <v-card-text>
            <v-alert
              v-if="editErrors.form"
              type="error"
              variant="tonal"
              class="mb-4"
              border="start"
              border-color="error"
            >
              {{ editErrors.form }}
            </v-alert>

            <v-form @submit.prevent="submitEdit">
              <div class="d-flex flex-column gap-4">
                <v-text-field
                  v-model="editForm.username"
                  :label="t('admin.userManagement.form.username')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="editErrors.username"
                  @update:model-value="clearFieldError(editErrors, 'username')"
                />
                <v-text-field
                  v-model="editForm.email"
                  :label="t('admin.userManagement.form.email')"
                  variant="outlined"
                  density="comfortable"
                  required
                  :error-messages="editErrors.email"
                  @update:model-value="clearFieldError(editErrors, 'email')"
                />
                <div class="d-flex flex-column flex-sm-row gap-4">
                  <v-text-field
                    v-model="editForm.firstName"
                    :label="t('admin.userManagement.form.firstName')"
                    variant="outlined"
                    density="comfortable"
                    class="flex-grow-1"
                  />
                  <v-text-field
                    v-model="editForm.lastName"
                    :label="t('admin.userManagement.form.lastName')"
                    variant="outlined"
                    density="comfortable"
                    class="flex-grow-1"
                  />
                </div>
                <v-select
                  v-model="editForm.roles"
                  :items="roleOptions"
                  :label="t('admin.userManagement.form.roles')"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  closable-chips
                  :hint="t('admin.userManagement.form.rolesHint')"
                  persistent-hint
                  :error-messages="editErrors.roles"
                  @update:model-value="clearFieldError(editErrors, 'roles')"
                />
                <v-switch
                  v-model="editForm.enabled"
                  inset
                  color="primary"
                  :label="t('admin.userManagement.form.enabled')"
                />
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" class="text-none" @click="closeEditDialog">
              {{ t('common.close') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="text-none"
              :loading="editingUserId ? isUpdating(editingUserId) : false"
              @click="submitEdit"
            >
              {{ t('admin.userManagement.dialogs.edit.submit') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="deleteDialog" max-width="440">
        <v-card rounded="lg">
          <v-card-title class="text-h6 font-weight-semibold">
            {{ t('admin.userManagement.dialogs.delete.title') }}
          </v-card-title>
          <v-card-text>
            {{ deleteDescription }}
          </v-card-text>
          <v-card-actions class="px-6 pb-6">
            <v-spacer />
            <v-btn variant="text" class="text-none" @click="closeDeleteDialog">
              {{ t('admin.userManagement.dialogs.delete.cancel') }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="text-none"
              :loading="deleteUserId ? isDeleting(deleteUserId) : false"
              @click="confirmDelete"
            >
              {{ t('admin.userManagement.dialogs.delete.confirm') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { callOnce } from '#imports'
import { useI18n } from 'vue-i18n'
import { useUsersStore } from '~/stores/users'

interface EditableUserForm {
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  roles: string[]
}

interface FormErrors {
  username?: string
  email?: string
  roles?: string
  form?: string
}

definePageMeta({
  middleware: ['auth', 'admin'],
})

const { t, locale } = useI18n()
const store = useUsersStore()
const search = ref('')
const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const editingUserId = ref<string | null>(null)
const deleteUserId = ref<string | null>(null)
const localError = ref<string | null>(null)

const roleOptions = ['admin', 'moderator', 'author', 'editor', 'viewer']

const createForm = reactive<EditableUserForm>(createEmptyForm())
const editForm = reactive<EditableUserForm>(createEmptyForm())
const createErrors = reactive<FormErrors>({})
const editErrors = reactive<FormErrors>({})

await callOnce(() => store.fetchUsers())

const users = computed(() => store.users.value)
const isLoading = computed(() => store.pending.value)
const creatingUser = computed(() => store.creating.value)
const updatingState = computed(() => store.updating.value)
const deletingState = computed(() => store.deleting.value)
const combinedError = computed(() => localError.value || store.error.value || null)

const headers = computed(() => [
  { title: t('admin.userManagement.table.columns.user'), key: 'user', sortable: false },
  { title: t('admin.userManagement.table.columns.email'), key: 'email' },
  { title: t('admin.userManagement.table.columns.status'), key: 'status', sortable: false },
  { title: t('admin.userManagement.table.columns.roles'), key: 'roles', sortable: false },
  { title: t('admin.userManagement.table.columns.updatedAt'), key: 'updatedAt' },
  { title: t('admin.userManagement.table.columns.actions'), key: 'actions', sortable: false },
])

const tableItems = computed(() =>
  users.value.map((user) => ({
    id: user.id,
    username: user.username,
    displayName: formatDisplayName(user.firstName, user.lastName, user.username),
    email: user.email,
    enabled: user.enabled !== false,
    roles: Array.isArray(user.roles) ? user.roles : [],
    updatedAt: user.updatedAt ?? user.createdAt ?? null,
  })),
)

const deleteDescription = computed(() => {
  if (!deleteUserId.value) {
    return ''
  }

  const user = users.value.find((candidate) => candidate.id === deleteUserId.value)
  const name = user ? formatDisplayName(user.firstName, user.lastName, user.username) : deleteUserId.value

  return t('admin.userManagement.dialogs.delete.description', { name })
})

function createEmptyForm(): EditableUserForm {
  return {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    enabled: true,
    roles: [],
  }
}

function formatDisplayName(firstName?: string | null, lastName?: string | null, fallback?: string) {
  const trimmedFirst = firstName?.trim() ?? ''
  const trimmedLast = lastName?.trim() ?? ''
  const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ')

  return fullName || fallback || '—'
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—'
  }

  const parsed = Date.parse(value)

  if (!Number.isFinite(parsed)) {
    return value
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(parsed))
}

function clearFieldError(errors: FormErrors, field: keyof FormErrors) {
  if (errors[field]) {
    errors[field] = undefined
  }
}

function resetForm(target: EditableUserForm, errors: FormErrors) {
  Object.assign(target, createEmptyForm())
  for (const key of Object.keys(errors) as (keyof FormErrors)[]) {
    errors[key] = undefined
  }
}

function validateForm(form: EditableUserForm, errors: FormErrors) {
  resetErrors(errors)

  if (!form.username.trim()) {
    errors.username = t('admin.userManagement.validation.username')
  }

  const emailValue = form.email.trim()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailValue || !emailPattern.test(emailValue)) {
    errors.email = t('admin.userManagement.validation.email')
  }

  if (!form.roles.length) {
    errors.roles = t('admin.userManagement.validation.roles')
  }

  return !errors.username && !errors.email && !errors.roles
}

function resetErrors(errors: FormErrors) {
  for (const key of Object.keys(errors) as (keyof FormErrors)[]) {
    if (key !== 'form') {
      errors[key] = undefined
    }
  }
}

function openCreateDialog() {
  resetForm(createForm, createErrors)
  createDialog.value = true
}

function closeCreateDialog() {
  createDialog.value = false
  resetForm(createForm, createErrors)
}

function openEditDialog(userId: string) {
  const user = users.value.find((candidate) => candidate.id === userId)

  if (!user) {
    return
  }

  editingUserId.value = userId
  Object.assign(editForm, {
    username: user.username ?? '',
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    enabled: user.enabled !== false,
    roles: Array.isArray(user.roles) ? [...user.roles] : [],
  })
  resetErrors(editErrors)
  editErrors.form = undefined
  editDialog.value = true
}

function closeEditDialog() {
  editDialog.value = false
  editingUserId.value = null
  resetForm(editForm, editErrors)
}

function openDeleteDialog(userId: string) {
  deleteUserId.value = userId
  deleteDialog.value = true
}

function closeDeleteDialog() {
  deleteDialog.value = false
  deleteUserId.value = null
}

function isUpdating(userId: string) {
  return Boolean(updatingState.value?.[userId])
}

function isDeleting(userId: string) {
  return Boolean(deletingState.value?.[userId])
}

async function submitCreate() {
  if (!validateForm(createForm, createErrors)) {
    return
  }

  try {
    await store.createUser({ ...createForm })
    localError.value = null
    closeCreateDialog()
  } catch (error) {
    createErrors.form = error instanceof Error ? error.message : String(error ?? '')
  }
}

async function submitEdit() {
  if (!editingUserId.value) {
    return
  }

  if (!validateForm(editForm, editErrors)) {
    return
  }

  try {
    await store.updateUser(editingUserId.value, { ...editForm })
    localError.value = null
    closeEditDialog()
  } catch (error) {
    editErrors.form = error instanceof Error ? error.message : String(error ?? '')
  }
}

async function confirmDelete() {
  if (!deleteUserId.value) {
    return
  }

  try {
    await store.deleteUser(deleteUserId.value)
    localError.value = null
    closeDeleteDialog()
  } catch (error) {
    localError.value = error instanceof Error ? error.message : String(error ?? '')
    closeDeleteDialog()
  }
}
</script>

<style scoped>
.user-table {
  border-radius: 24px;
}
</style>