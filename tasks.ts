#!/usr/bin/env -S deno run -A

import { existsSync } from "https://deno.land/std@0.93.0/fs/exists.ts";

const text = await Deno.readTextFile("import_map.json");
const alephPath = JSON.parse(text).imports["aleph/"];

const taskName = Deno.args[0];

switch (taskName) {
  case "build":
    await build();
    break;

  case "deploy":
    await build();
    Deno.createSync("docs/.nojekyll");
    await $("git add .");
    await $("git commit -m deploy");
    await $("git push");
    break;

  default:
    console.log("Unknown task name");
    break;
}

async function build() {
  rm(".aleph");
  await $([
    Deno.execPath(),
    "run",
    "--allow-net=deno.land,esm.sh",
    "--allow-read=.," + Deno.execPath() + "," + await getDenoDir(),
    "--allow-write=.aleph,docs",
    "--allow-env=ALEPH_DEV,ALEPH_DEV_PORT,ALEPH_VERSION,ALEPH_BUILD_MODE,ALEPH_FRAMEWORK",
    "--allow-run=" + Deno.execPath(),
    `${alephPath}cli.ts`,
    "build",
  ]);
}

async function $(cmd: string[] | string) {
  const command = cmd instanceof Array ? cmd : cmd.split(" ");
  const status = await Deno.run({
    cmd: command,
    stdout: "inherit",
    stderr: "inherit",
  }).status();
  if (status.code != 0) {
    Deno.exit(status.code);
  }
}

function rm(path: string) {
  if (existsSync(path)) {
    Deno.removeSync(path, { recursive: true });
  }
}

async function getDenoDir() {
  const p = Deno.run({
    cmd: [Deno.execPath(), "info", "--json", "--unstable"],
    stdout: "piped",
    stderr: "null",
  });
  const output = (new TextDecoder()).decode(await p.output());
  p.close();
  return JSON.parse(output).denoDir;
}
