import { prisma } from "./prisma";

/**
 * Tenant isolation layer.
 *
 * `tenantDb(workspaceId)` returns a Prisma client on which every query against
 * a workspace-owned model is forced to that workspace:
 *   - reads, updates and deletes get `workspaceId` added to `where`
 *   - creates get `workspaceId` written into `data`, overriding whatever was passed
 *   - updates can never move a row to another workspace
 *   - global models (User, RateLimitHit) are refused, so they can't be listed by accident
 *
 * Limits to know about:
 *   - Nested writes/includes are not rewritten. Write tenant rows with scalar ids
 *     (e.g. `conversationId`) rather than nested `create`/`connect`.
 *   - Raw SQL bypasses this. Raw queries (vector search) live in dedicated functions
 *     that take `workspaceId` explicitly and are covered by the isolation tests.
 */

const TENANT_MODELS = new Set([
  "Membership",
  "Invite",
  "AssistantSettings",
  "WidgetSettings",
  "NotificationSettings",
  "KnowledgeSource",
  "Chunk",
  "Conversation",
  "Message",
  "Lead",
  "Product",
  "UsageCounter",
]);

const CREATE_OPS = new Set(["create", "createMany", "createManyAndReturn"]);

// Prisma's per-operation argument types cannot be expressed generically here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>;

function withoutWorkspaceId(data: Args | undefined) {
  if (!data) return data;
  const rest = { ...data };
  delete rest.workspaceId;
  return rest;
}

export function tenantDb(workspaceId: string) {
  if (!workspaceId) throw new Error("tenantDb requires a workspaceId");

  return prisma.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const a: Args = { ...(args as Args) };

          // The workspace row itself: only ever this one, and never created here.
          if (model === "Workspace") {
            if (CREATE_OPS.has(operation) || operation === "upsert") {
              throw new Error("Workspaces cannot be created through tenantDb");
            }
            // AND (rather than overwriting `id`) so a query naming another workspace
            // matches nothing instead of silently acting on this one.
            a.where = { ...a.where, AND: [...[a.where?.AND ?? []].flat(), { id: workspaceId }] };
            return query(a);
          }

          // Plans are public reference data.
          if (model === "Plan") return query(a);

          if (!TENANT_MODELS.has(model)) {
            throw new Error(`${model} is not a workspace-scoped model; it cannot be accessed through tenantDb`);
          }

          switch (operation) {
            case "create":
              a.data = { ...a.data, workspaceId };
              break;
            case "createMany":
            case "createManyAndReturn":
              a.data = (Array.isArray(a.data) ? a.data : [a.data]).map((d: Args) => ({ ...d, workspaceId }));
              break;
            case "upsert":
              a.where = { ...a.where, workspaceId };
              a.create = { ...a.create, workspaceId };
              a.update = withoutWorkspaceId(a.update);
              break;
            case "update":
            case "updateMany":
            case "updateManyAndReturn":
              a.where = { ...a.where, workspaceId };
              a.data = withoutWorkspaceId(a.data);
              break;
            default:
              // find*, count, aggregate, groupBy, delete, deleteMany
              a.where = { ...a.where, workspaceId };
          }
          return query(a);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;
