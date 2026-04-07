import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tool, type Plugin } from "@opencode-ai/plugin";

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DynamicModelRefresh: Plugin = async (input) => {
  const { client } = input;

  return {
    name: "opencode-dynamic-openrouter-model-fetch",
    description: "Dynamic OpenRouter model refresh plugin",
    tool: {
    "model-refresh": tool({
          description: "Refresh OpenRouter models from API",
          args: {},
          async execute(args, context) {
            // Show starting message
            await client.app.log({
              body: {
                service: "model-refresh",
                level: "info",
                message: "Starting model refresh...",
              },
            });

            try {
              // Get the directory where this plugin is located
              const pluginDir = dirname(__filename);
              const scriptPath = join(pluginDir, "scripts", "refresh.py");

              // Validate script exists
              const fs = await import("fs/promises");
              try {
                await fs.access(scriptPath);
              } catch (error) {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "error",
                    message: `Script not found at path: ${scriptPath}`,
                  },
                });
                return "❌ Error: Refresh script not found. Please ensure the scripts directory is properly installed.";
              }

              // Check if Python is available
              const pythonCheck = spawn("python", ["--version"], {
                stdio: ["ignore", "pipe", "pipe"],
              });
              const pythonExitCode = await new Promise<number>((resolve) => {
                pythonCheck.on("close", resolve);
              });

              if (pythonExitCode !== 0) {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "error",
                    message: "Python is not installed or not in PATH. Please install Python 3.6+.",
                  },
                });
                return "❌ Error: Python is required but not found. Please install Python 3.6 or higher.";
              }

              await client.app.log({
                body: {
                  service: "model-refresh",
                  level: "info",
                  message: `Running refresh script at: ${scriptPath}`,
                },
              });

              const python = spawn("python", [scriptPath], {
                stdio: ["ignore", "pipe", "pipe"],
              });

              // Capture output
              let stdout = "";
              let stderr = "";

              python.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
              });

              python.stderr.on("data", (data: Buffer) => {
                stderr += data.toString();
              });

              // Wait for completion
              const exitCode = await new Promise<number>((resolve) => {
                python.on("close", resolve);
              });

              // Log output
              if (stdout) {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "info",
                    message: stdout,
                  },
                });
              }

              if (stderr) {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "warn",
                    message: stderr,
                  },
                });
              }

              if (exitCode === 0) {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "info",
                    message: "Model refresh completed successfully!",
                  },
                });
                return "✅ Model refresh completed successfully! OpenRouter models have been updated.";
              } else {
                await client.app.log({
                  body: {
                    service: "model-refresh",
                    level: "error",
                    message: `Model refresh failed with exit code ${exitCode}`,
                  },
                });
                return `❌ Model refresh failed with exit code ${exitCode}`;
              }
            } catch (error: any) {
              await client.app.log({
                body: {
                  service: "model-refresh",
                  level: "error",
                  message: `Error running refresh script: ${error.message}`,
                },
              });
              return `❌ Error running refresh script: ${error.message}`;
            }
          },
        })
      }
    }
  ;
}

export default DynamicModelRefresh;
