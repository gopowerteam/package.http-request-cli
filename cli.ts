import { Command } from "commander";
import { generateRequestFile } from "./generate-request-file";

const program = new Command();

export async function startup() {
  program
    .description("a cli program for http-request-cli")
    .option("-g, --generate", "generate http request controller&service");

  program.parse(process.argv);
  const options = program.opts();

  if (options.generate) {
    generateRequestFile();
  }
}

startup();
