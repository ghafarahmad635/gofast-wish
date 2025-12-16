import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  // add custom resources here if you want
  // project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// roles created from THIS ac only
export const user = ac.newRole({});
export const superadmin = ac.newRole({
  ...adminAc.statements,
});
