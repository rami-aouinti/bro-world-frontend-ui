import { defineAsyncComponent, type AsyncComponentLoader } from 'vue'

const vendorStyleLoaders = {
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
