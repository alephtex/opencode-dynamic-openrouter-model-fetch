import { spawn } from "child_process";
import { join } from "path";

export default function DynamicModelRefresh() {
  return {
    name: "opencode-dynamic-openrouter-model-fetch",
    description: "Dynamic OpenRouter model refresh plugin",

    // Register the /dynamic-model-refresh command
    commands: {
      "dynamic-model-refresh": {
        description: "Refresh OpenRouter models from API",
        run: async (context: any) => {
          // Show starting message
          context.terminal.write("🔄 Starting model refresh...\n");
          context.terminal.write(
            "   Fetching models from OpenRouter API...\n\n",
          );

          try {
            // Get the directory where this plugin is located
            const scriptPath = join(process.cwd(), "scripts", "refresh.py");

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

            // Show output in terminal
            if (stdout) {
              context.terminal.write(stdout);
            }

            if (stderr) {
              context.terminal.write(`⚠️  ${stderr}\n`);
            }

            if (exitCode === 0) {
              context.terminal.write(
                "\n✅ Model refresh completed successfully!\n",
              );
              context.terminal.write(
                "   OpenRouter models have been updated.\n",
              );
            } else {
              context.terminal.write(
                `\n❌ Model refresh failed with exit code ${exitCode}\n`,
              );
            }

            return { success: exitCode === 0 };
          } catch (error: any) {
            context.terminal.write(
              `\n❌ Error running refresh script: ${error.message}\n`,
            );
            return { success: false, error: error.message };
          }
        },
      },
    },
  };
}
