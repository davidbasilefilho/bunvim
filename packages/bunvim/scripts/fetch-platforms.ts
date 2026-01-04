import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const PACKAGES = [
	{ name: "@opentui/core-darwin-arm64", version: "0.1.68" },
	{ name: "@opentui/core-win32-x64", version: "0.1.68" },
	{ name: "@opentui/core-linux-x64", version: "0.1.68" },
];

const ROOT_NODE_MODULES = resolve(process.cwd(), "../../node_modules");

for (const pkg of PACKAGES) {
	const dest = join(ROOT_NODE_MODULES, pkg.name);
	const pkgJsonPath = join(dest, "package.json");

	if (await Bun.file(pkgJsonPath).exists()) {
		console.log(`${pkg.name} already installed in ${dest}.`);
		continue;
	}

	console.log(`Fetching ${pkg.name}@${pkg.version}...`);
	const filename = pkg.name.split("/")[1];
	const url = `https://registry.npmjs.org/${pkg.name}/-/${filename}-${pkg.version}.tgz`;

	const response = await fetch(url);
	if (!response.ok) {
		console.error(`Failed to fetch ${url}: ${response.statusText}`);
		process.exit(1);
	}

	await mkdir(dest, { recursive: true });

	const blob = await response.blob();
	const buffer = await blob.arrayBuffer();
	const tmp = join(
		ROOT_NODE_MODULES,
		`${filename}-${pkg.version}-${process.pid}.tgz`,
	);
	await Bun.write(tmp, buffer);

	console.log(`Extracting to ${dest}...`);
	const proc = Bun.spawn(
		["tar", "-xzf", tmp, "-C", dest, "--strip-components=1"],
		{
			stdout: "inherit",
			stderr: "inherit",
		},
	);
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		console.error(`Failed to extract ${pkg.name}`);
		process.exit(1);
	}

	const rm = Bun.spawn(["rm", tmp]);
	await rm.exited;
}

console.log("All platform packages fetched.");
