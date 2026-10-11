export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

export interface PermissionGroup {
  module: string;
  moduleName: string;
  permissions: PermissionItem[];
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
  permissionCodes: string[];
  userCount?: number;
}

export interface SaveRolePayload {
  code: string;
  name: string;
  description?: string;
  color?: string;
  permissionCodes: string[];
}
