import { handleResourceWrite } from "@/server/agent-route";

export async function POST(request: Request) {
  return handleResourceWrite(request, "publish", "resources:publish");
}
