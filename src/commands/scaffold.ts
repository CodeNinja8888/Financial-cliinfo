const axios = require("axios");
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
    describe: `Name of DB to scaffold. Usage:
    retool scaffold -n <db_name> -c <col1> <col2>`,
    type: "string",
    nargs: 1,
    demandOption: true,
  },
  columns: {
    alias: "c",
    describe: `Column names in DB to scaffold. Usage:
    retool scaffold -n <db_name> -c <col1> <col2>`,
    type: "array",
    demandOption: true,
  },
};
const handler = async function (argv: any) {
  const spinner = ora("Verifying Retool DB credentials").start();
  let credentials = getCredentials();
  if (!credentials) {
    spinner.stop();
    console.log(
      `Error: No credentials found. To log in, run: \`retool login\``
    );
    return;
  }
  axios.defaults.headers["x-xsrf-token"] = credentials.xsrf;
  axios.defaults.headers.cookie = `accessToken=${credentials.accessToken};`;
  if (!credentials.gridId || !credentials.retoolDBUuid) {
    await fetchDBCredentials();
    credentials = getCredentials();
    if (!credentials?.gridId || !credentials?.retoolDBUuid) {
      spinner.stop();
      console.log(`Error: No Retool DB credentials found.`);
      return;
    }
  }
  spinner.stop();

  await createTable(argv.name, argv.columns, undefined, credentials, false);
  console.log(`Generate mock data with: \`retool db --gendata ${argv.name}\``);
  console.log("\n");
  await generateWorkflow(argv.name);
  console.log("\n");
  // await generateApp(argv.name);
  console.log("To generate an app:");
  console.log(`1: Go to https://${credentials.domain}`);
  console.log(`2: Click "Create New" > "From Database"`);
  console.log(`3: Resource is "retool_db", select table "${argv.name}"`);
};

const commandModule: CommandModule = {
  command,
  describe,
  builder,
  handler,
};

export default commandModule;
