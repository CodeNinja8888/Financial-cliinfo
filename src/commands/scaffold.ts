const ora = require("ora");

import { getCredentials, fetchDBCredentials } from "../utils/credentials";
import { createTable } from "./db";
import { CommandModule } from "yargs";
import { generateApp } from "../utils/apps";
import { generateWorkflow } from "../utils/workflows";

const command = "scaffold";
const describe = "Scaffold a Retool DB, Workflow, and App.";
const builder: CommandModule["builder"] = {
  name: {
    alias: "n",
    describe: "Name of db to scaffold.",
    type: "string",
    nargs: 1,
    demandOption: true,
  },
  columns: {
    alias: "c",
    describe: "Column names in db to scaffold.",
    type: "array",
    demandOption: true,
  },
};
const handler = async function (argv: any) {
  const spinner = ora("Verifying Retool DB credentials").start();
  let credentials = getCredentials();
  if (!credentials) {
    spinner.stop();
    return;
  }
  if (!credentials.gridId || !credentials.retoolDBUuid) {
    await fetchDBCredentials();
    credentials = getCredentials();
    if (!credentials?.gridId || !credentials?.retoolDBUuid) {
      spinner.stop();
      return;
    }
  }
  spinner.stop();

  await createTable(argv.name, argv.columns, undefined, credentials);
  console.log("\n");
  await generateWorkflow(argv.name);
  console.log("\n");
  await generateApp(argv.name);
};

const commandModule: CommandModule = {
  command,
  describe,
  builder,
  handler,
};

export default commandModule;
