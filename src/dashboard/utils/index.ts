export * from './export'

export const hasPermission: any = (permissions: any[], objectType: string, permission: string) =>
  permissions?.find((p) => p.objecttype === objectType) &&
  permissions
    .find((p) => p.objecttype === objectType)
    .permission?.indexOf(permission) !== -1
