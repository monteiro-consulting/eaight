// Permissions Management

export enum Permission {
  // Read permissions
  READ_URL = 'read:url',
  READ_DOM = 'read:dom',
  READ_SCREENSHOT = 'read:screenshot',
  READ_NETWORK = 'read:network',
  READ_CONSOLE = 'read:console',
  READ_COOKIES = 'read:cookies',
  READ_STORAGE = 'read:storage',

  // Action permissions
  ACTION_NAVIGATE = 'action:navigate',
  ACTION_CLICK = 'action:click',
  ACTION_TYPE = 'action:type',
  ACTION_SCROLL = 'action:scroll',
  ACTION_EXECUTE_JS = 'action:execute-js',
  ACTION_UPLOAD = 'action:upload',

  // System permissions
  SYSTEM_TABS = 'system:tabs',
  SYSTEM_EXTENSIONS = 'system:extensions',
  SYSTEM_SETTINGS = 'system:settings',
}

export const PERMISSION_PRESETS = {
  minimal: [Permission.READ_URL, Permission.READ_DOM],
  standard: [
    Permission.READ_URL,
    Permission.READ_DOM,
    Permission.READ_SCREENSHOT,
    Permission.ACTION_NAVIGATE,
    Permission.ACTION_CLICK,
    Permission.ACTION_TYPE,
    Permission.ACTION_SCROLL,
  ],
  full: Object.values(Permission),
} as const;

export function hasPermission(
  grantedPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return grantedPermissions.includes(requiredPermission);
}

export function getPermissionsForPreset(
  preset: keyof typeof PERMISSION_PRESETS
): Permission[] {
  return [...PERMISSION_PRESETS[preset]];
}
