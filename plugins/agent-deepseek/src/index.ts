// Agent plugin for DeepSeek — API-based agent with CLI wrapper
import { execFileSync } from "node:child_process";
import { access, constants } from "node:fs/promises";
import { join } from "node:path";

// ─── Types (mirrored from @aoagents/ao-core for standalone compilation) ───

type SessionId = string;

interface AgentLaunchConfig {
  sessionId: SessionId;
  projectConfig: { path: string };
  workspacePath?: string;
  issueId?: string;
  prompt?: string;
  permissions?: Record<string, unknown>;
  model?: string;
  systemPrompt?: string;
  systemPromptFile?: string;
}

type ActivityState = "idle" | "active" | "waiting_input" | "blocked";

interface ActivityDetection {
  state: ActivityState | "ready" | "exited";
  timestamp?: Date;
}

interface RuntimeHandle {
  runtimeName: string;
  id?: string;
  data?: Record<string, unknown>;
}

type ProcessProbeResult = boolean | null;
const PROCESS_PROBE_INDETERMINATE = null;

interface Session {
  workspacePath?: string;
  runtimeHandle?: RuntimeHandle;
}

interface AgentSessionInfo {
  summary: string | null;
  summaryIsFallback?: boolean;
  agentSessionId: string | null;
}

interface WorkspaceHooksConfig {
  dataDir: string;
  sessionId?: string;
}

// ─── Plugin manifest ───

export const manifest = {
  name: "deepseek",
  slot: "agent" as const,
  description: "Agent plugin: DeepSeek",
  version: "1.0.0",
  displayName: "DeepSeek",
};

// ─── Agent implementation ───

const BIN_PATH = join(process.env.PRACTICE_WORKSPACE_ROOT || process.cwd(), "bin", "deepseek-chat");

function createDeepseekAgent() {
  return {
    name: "deepseek",
    processName: "deepseek-chat",

    getLaunchCommand(config: AgentLaunchConfig): string {
      const parts: string[] = ["node", BIN_PATH];

      if (config.model) {
        parts.push("--model", config.model);
      }

      if (config.systemPrompt) {
        // Prepend system context to the user prompt
        parts.push("--prompt", JSON.stringify(config.systemPrompt + "\n\n" + (config.prompt || "")));
      } else if (config.prompt) {
        parts.push("--prompt", JSON.stringify(config.prompt));
      }

      return parts.join(" ");
    },

    getEnvironment(config: AgentLaunchConfig): Record<string, string> {
      const env: Record<string, string> = {
        AO_SESSION_ID: config.sessionId,
      };
      if (config.issueId) {
        env["AO_ISSUE_ID"] = config.issueId;
      }
      return env;
    },

    detectActivity(terminalOutput: string): ActivityState {
      if (!terminalOutput.trim()) return "idle";

      const lines = terminalOutput.trim().split("\n");
      const lastLine = lines[lines.length - 1]?.trim() ?? "";

      if (/Error:/.test(lastLine)) return "blocked";
      if (/Usage:/.test(lastLine)) return "idle";

      return "active";
    },

    async getActivityState(
      session: Session,
    ): Promise<ActivityDetection | null> {
      if (!session.runtimeHandle) return { state: "exited", timestamp: new Date() };
      const running = await this.isProcessRunning(session.runtimeHandle);
      if (running === PROCESS_PROBE_INDETERMINATE) return null;
      if (!running) return { state: "exited", timestamp: new Date() };
      return { state: "idle", timestamp: new Date() };
    },

    async isProcessRunning(handle: RuntimeHandle): Promise<ProcessProbeResult> {
      try {
        if (handle.runtimeName === "tmux" && handle.id) {
          const result = execFileSync("tmux", ["list-panes", "-t", handle.id, "-F", "#{pane_pid}"], {
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 5000,
          });
          const pid = parseInt(result.toString().trim(), 10);
          if (Number.isFinite(pid) && pid > 0) {
            try { process.kill(pid, 0); return true; } catch { return false; }
          }
          return false;
        }

        const rawPid = handle.data?.["pid"];
        const pid = typeof rawPid === "number" ? rawPid : Number(rawPid);
        if (Number.isFinite(pid) && pid > 0) {
          try { process.kill(pid, 0); return true; }
          catch (err: unknown) {
            if (err instanceof Error && "code" in err && err.code === "EPERM") return true;
            return false;
          }
        }
        return false;
      } catch {
        return PROCESS_PROBE_INDETERMINATE;
      }
    },

    async getSessionInfo(): Promise<AgentSessionInfo | null> {
      return null;
    },

    async setupWorkspaceHooks(): Promise<void> {},
    async postLaunchSetup(): Promise<void> {},
  };
}

export function create() {
  return createDeepseekAgent();
}

export function detect(): boolean {
  try {
    execFileSync("node", [BIN_PATH, "--help"], { stdio: "pipe", timeout: 5000 });
    return true;
  } catch {
    try {
      access(BIN_PATH, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }
}

export default { manifest, create, detect };
