import type { SiteMenuItem } from "~/types/settings";

export type MenuBlueprint = Omit<SiteMenuItem, "order" | "children"> & {
  order?: number;
  children?: MenuBlueprint[];
};

export function cloneMenuBlueprint(blueprint: MenuBlueprint): MenuBlueprint {
  return {
    ...blueprint,
    children: blueprint.children?.map((child) => cloneMenuBlueprint(child)),
  } satisfies MenuBlueprint;
}

function mergeBlueprintNode(base: MenuBlueprint, addition: MenuBlueprint): MenuBlueprint {
  const merged: MenuBlueprint = {
    ...base,
    ...(addition.order !== undefined ? { order: addition.order } : {}),
  };

  if (addition.label !== undefined) merged.label = addition.label;
  if (addition.icon !== undefined) merged.icon = addition.icon;
  if (addition.to !== undefined) merged.to = addition.to;
  if (addition.requiresAdmin !== undefined) merged.requiresAdmin = addition.requiresAdmin;
  if (addition.translate !== undefined) merged.translate = addition.translate;
  if (addition.isVisible !== undefined) merged.isVisible = addition.isVisible;

  const baseChildren = base.children ?? [];
  const additionChildren = addition.children ?? [];

  if (additionChildren.length > 0 || baseChildren.length > 0) {
    merged.children = mergeMenuBlueprints(baseChildren, additionChildren);
  }

  return merged;
}

export function mergeMenuBlueprints(
  base: MenuBlueprint[],
  additions: MenuBlueprint[],
): MenuBlueprint[] {
  const result: MenuBlueprint[] = base.map((item) => cloneMenuBlueprint(item));

  for (const addition of additions) {
    const additionClone = cloneMenuBlueprint(addition);

    if (additionClone.id) {
      const existingIndex = result.findIndex((item) => item.id === additionClone.id);
      if (existingIndex !== -1) {
        result[existingIndex] = mergeBlueprintNode(result[existingIndex], additionClone);
        continue;
      }
    }

    result.push(additionClone);
  }

  return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function convertBlueprintsToMenus(blueprints: MenuBlueprint[]): SiteMenuItem[] {
  const sorted = [...blueprints].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return sorted.map((blueprint, index) => ({
    ...blueprint,
    order: blueprint.order ?? index,
    children: convertBlueprintsToMenus(blueprint.children ?? []),
  }));
}

export function convertMenusToBlueprints(menus: SiteMenuItem[]): MenuBlueprint[] {
  return menus.map((menu) => ({
    id: menu.id,
    label: menu.label,
    icon: menu.icon ?? undefined,
    to: menu.to ?? undefined,
    requiresAdmin: menu.requiresAdmin,
    translate: menu.translate,
    isVisible: menu.isVisible,
    order: menu.order,
    children: menu.children ? convertMenusToBlueprints(menu.children) : undefined,
  }));
}

export function cloneMenuTree(menus: SiteMenuItem[]): SiteMenuItem[] {
  return menus.map((menu) => ({
    ...menu,
    children: menu.children ? cloneMenuTree(menu.children) : undefined,
  }));
}
