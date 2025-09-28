import { defineAsyncComponent, type AsyncComponentLoader } from 'vue'

const vendorStyleLoaders = {
  sweetalert2: () => import('~/assets/styles/material-dashboard/vendors/lazy/sweetalert2.scss'),
  fullcalendar: () => import('~/assets/styles/material-dashboard/vendors/lazy/fullcalendar.scss'),
  quill: () => import('~/assets/styles/material-dashboard/vendors/lazy/quill.scss'),
  dropzone: () => import('~/assets/styles/material-dashboard/vendors/lazy/dropzone.scss'),
  photoswipe: () => import('~/assets/styles/material-dashboard/vendors/lazy/photoswipe.scss'),
  kanban: () => import('~/assets/styles/material-dashboard/vendors/lazy/kanban.scss'),
} as const

export type MaterialDashboardVendor = keyof typeof vendorStyleLoaders

export async function loadMaterialDashboardVendorStyles(...vendors: MaterialDashboardVendor[]): Promise<void> {
  if (!vendors.length) {
    return
  }

  await Promise.all(vendors.map(vendor => vendorStyleLoaders[vendor]()))
}

export function defineAsyncComponentWithVendorStyles<T>(
  loader: AsyncComponentLoader<T>,
  vendors: MaterialDashboardVendor[] = [],
) {
  return defineAsyncComponent(async () => {
    if (vendors.length) {
      await loadMaterialDashboardVendorStyles(...vendors)
    }

    return loader()
  })
}
