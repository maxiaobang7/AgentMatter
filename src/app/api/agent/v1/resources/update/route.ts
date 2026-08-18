import { handleResourceWrite } from "@/server/agent-route";

export async function POST(request: Request) {
  return handleResourceWrite(request, "update", "resources:update");
}
