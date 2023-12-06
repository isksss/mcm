import { Config } from "./main.ts";
import Logger from "./logger.ts";

const url = "https://api.papermc.io/v2/projects";

export async function download(config: Config) {
  const { project, version, build, file } = config.server;

  verifyProject(project);
  const use_version = await verifyVersion(project, version);
  const user_build = await verifyBuild(project, use_version, build);

  Logger.info(
    `Downloading server type ${project}, version ${use_version}, build ${user_build}`,
  );
  const jar_filename = `${project}-${use_version}-${user_build}.jar`;
  const jar_url =
    `${url}/${project}/versions/${use_version}/builds/${user_build}/downloads/${jar_filename}`;
  Logger.debug(`Jar URL: ${jar_url}`);
  const jar_res = await fetch(jar_url);
  const jar_file = await jar_res.blob();

  const arrayBuffer = await jar_file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  await Deno.writeFile(file, uint8Array);

  Logger.info(`Downloaded server to ${file}`);
}

async function getResponse(url: string) {
  const res = await fetch(url);
  const res_json = await res.json();

  Logger.debug(`Response URL: ${url}`);
  Logger.debug(`Response Status: ${res.status}`);
  Logger.debug(`Response JSON: ${JSON.stringify(res_json)}`);

  if (!res.ok) {
    Logger.error(`Response Status: ${res.status}`);
  }

  return res_json;
}

async function verifyProject(project: string) {
  type Response = {
    projects: string[];
  };

  const res = await getResponse(url) as Response;

  if (!res.projects.includes(project)) {
    Logger.error(`Server type ${project} does not exist.`);
  }

  return true;
}

async function verifyVersion(project: string, version: string) {
  type Project = {
    project_id: string;
    project_name: string;
    version_groups: string[];
    versions: string[];
  };

  const res = await getResponse(`${url}/${project}`) as Project;
  const latest_version = res.versions[res.versions.length - 1];
  if (version === "latest") {
    Logger.debug(`Latest version: ${res.versions[res.versions.length - 1]}`);
    return latest_version;
  }
  if (!res.versions.includes(version)) {
    Logger.error(`Server version ${version} does not exist.`);
  }
  return version;
}

async function verifyBuild(project: string, version: string, build: string) {
  type Project = {
    project_id: string;
    project_name: string;
    version: string;
    builds: number[];
  };

  const res = await getResponse(
    `${url}/${project}/versions/${version}`,
  ) as Project;
  const latest_build = res.builds[res.builds.length - 1];
  if (build === "latest") {
    Logger.debug(`Latest build: ${res.builds[res.builds.length - 1]}`);
    return latest_build;
  } else {
    const build_num = parseInt(build);
    if (!res.builds.includes(build_num)) {
      Logger.error(`Server build ${build} does not exist.`);
    }
    return build_num;
  }
}
