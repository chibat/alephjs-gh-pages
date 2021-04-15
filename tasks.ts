#!/usr/bin/env -S deno run -A

import { existsSync } from "https://deno.land/std@0.93.0/fs/exists.ts";

//
// Tasks
//

const TASKS = [build, dev, start, deploy];

async function build() {
  rm(".aleph");
  await $([
    Deno.execPath(),
    "run",
    "--allow-net=deno.land,esm.sh",
    "--allow-read=.," + Deno.execPath() + "," + await denoDir(),
    "--allow-write=.aleph,docs",
    "--allow-env=ALEPH_DEV,ALEPH_DEV_PORT,ALEPH_VERSION,ALEPH_BUILD_MODE,ALEPH_FRAMEWORK",
    "--allow-run=" + Deno.execPath(),
    alephCliPath(),
    "build",
  ]);
}

async function deploy() {
  await build();
  Deno.createSync("docs/.nojekyll");
  await $("git add .");
  await $("git commit -m deploy");
  await $("git push");
}

async function dev() {
  await $([
    Deno.execPath(),
    "run",
    "--allow-net=deno.land,esm.sh,:8080",
    "--allow-read=.," + Deno.execPath() + "," + await denoDir(),
    "--allow-write=.aleph",
    "--allow-env=ALEPH_DEV,ALEPH_DEV_PORT,ALEPH_VERSION,ALEPH_BUILD_MODE,ALEPH_FRAMEWORK",
    "--allow-run=" + Deno.execPath(),
    alephCliPath(),
    "dev",
  ]);
}

async function start() {
  await $([
    Deno.execPath(),
    "run",
    "--allow-net=deno.land,esm.sh,:8080",
    "--allow-read=.," + Deno.execPath() + "," + await denoDir(),
    "--allow-write=.aleph",
    "--allow-env=ALEPH_DEV,ALEPH_DEV_PORT,ALEPH_VERSION,ALEPH_BUILD_MODE,ALEPH_FRAMEWORK",
    "--allow-run=" + Deno.execPath(),
    alephCliPath(),
    "start",
  ]);
}

//
// Aleph.js
//

function alephCliPath() {
  return JSON.parse(Deno.readTextFileSync("import_map.json"))
    .imports["aleph/"] + "cli.ts";
}

//
// Utility
//

async function denoDir() {
  const p = Deno.run({
    cmd: [Deno.execPath(), "info", "--json", "--unstable"],
    stdout: "piped",
    stderr: "null",
  });
  const output = (new TextDecoder()).decode(await p.output());
  p.close();
  return JSON.parse(output).denoDir;
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

//
// main
//

if (import.meta.main) {
  const taskName = Deno.args[0];
  if (!taskName) {
    TASKS.forEach((task) => console.log(task.name));
    Deno.exit(0);
  }
  const tasks = TASKS.filter((task) => task.name === taskName);
  if (tasks.length == 0) {
    console.log("Unknown task name");
    Deno.exit(1);
  }

  tasks.find((task) => task());
}
