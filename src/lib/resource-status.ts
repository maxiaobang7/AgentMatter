export type StoredResourceStatus = "draft" | "published" | "unpublished" | "archived";
export type AdminResourceStatusAction = "draft" | "archive";

export function nextResourceStatus(current: StoredResourceStatus, action: AdminResourceStatusAction): StoredResourceStatus {
  if (current === "archived" && action === "draft") throw new Error("已归档资源不能直接转为草稿，请重新发布以恢复");
  return action === "archive" ? "archived" : "draft";
}
