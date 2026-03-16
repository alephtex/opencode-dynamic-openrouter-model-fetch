import { spawn } from "child_process";
import { join } from "path";
import { tool, type Plugin } from "@opencode-ai/plugin";

const DynamicModelRefresh: Plugin = async (input) => {
  const { client } = input;

  return {
    name: "opencode-dynamic-openrouter-model-fetch",
    description: "Dynamic OpenRouter model refresh plugin",

    tool: {
      "dynamic-model-refresh": tool({
        description: "Refresh OpenRouter models from API",
        args: {},
        async execute(args, context) {
          // Show starting message
          await client.app.log({
            body: {
              service: "dynamic-model-refresh",
              level: "info",
              message: "Starting model refresh...",
            },
          });

          try {
            // Get the directory where this plugin is located
            const scriptPath = join(__dirname, "..", "scripts", "refresh.py");

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
                  service: "dynamic-model-refresh",
                  level: "info",
                  message: stdout,
                },
              });
            }

            if (stderr) {
              await client.app.log({
                body: {
                  service: "dynamic-model-refresh",
                  level: "warn",
                  message: stderr,
                },
              });
            }

            if (exitCode === 0) {
              await client.app.log({
                body: {
                  service: "dynamic-model-refresh",
                  level: "info",
                  message: "Model refresh completed successfully!",
                },
              });
              return "✅ Model refresh completed successfully! OpenRouter models have been updated.";
            } else {
              await client.app.log({
                body: {
                  service: "dynamic-model-refresh",
                  level: "error",
                  message: `Model refresh failed with exit code ${exitCode}`,
                },
              });
              return `❌ Model refresh failed with exit code ${exitCode}`;
            }
          } catch (error: any) {
            await client.app.log({
              body: {
                service: "dynamic-model-refresh",
                level: "error",
                message: `Error running refresh script: ${error.message}`,
              },
            });
            return `❌ Error running refresh script: ${error.message}`;
          }
        },
      }),
    },
  };
};

export default DynamicModelRefresh;
