import util from "util";
import { exec as _exec } from "child_process";

const exec = util.promisify(_exec);

import ora from "ora";

export const command = "scaffold";
export const desc = "Scaffold a new custom component";
export const builder = {};
export const handler = async function () {
  const spinner = ora("Scaffolding a new custom component").start();
  await exec(
    "git clone https://github.com/tryretool/custom-component-guide.git"
  );
  spinner.stop();
  console.log(
    "Scaffolded a new custom component in the custom-component-guide directory."
  );
};
