#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_ARCHIVE_ROOT = "https://res.227wiki.eu.org/archive/instagram";
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v"]);
const POST_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_UTC)(?:_(\d+))?\.([^.]+)$/;
const PROFILE_PICTURE_PATTERN = /_profile_pic\.(?:jpe?g|png|webp)$/i;

function printHelp() {
  console.log(`Generate the Instagram JSON files used by this project.

Usage:
  npm run generate:instagram -- --input <archive-dir> --output <data-dir> [options]

Required:
  --input <dir>          Instagram archive directory (for example .rawdata/__shiro227)
  --output <dir>         Directory for meta.json, posts.json, and user.json

Options:
  --screen-name <name>   Instagram handle (defaults to the input directory name)
  --name <name>          Display name (defaults to an existing user.json or the handle)
  --bio <text>           Profile biography (defaults to an existing user.json or empty)
  --avatar-url <url>     Avatar URL (defaults to the detected *_profile_pic file)
  --base-url <url>       Media root (defaults to ${DEFAULT_ARCHIVE_ROOT}/<handle>)
  --verified <boolean>   Verification state (defaults to existing user.json or false)
  --help                 Show this help

The source format is the flat timestamp-based layout produced by Instaloader.
For videos, each media entry contains the MP4 URL and its matching JPG poster.
The legacy images array is also retained for backwards compatibility.`);
}

function readOption(argv, index) {
  const argument = argv[index];
  const equalsIndex = argument.indexOf("=");
  if (equalsIndex !== -1) {
    return {
      key: argument.slice(2, equalsIndex),
      value: argument.slice(equalsIndex + 1),
      consumed: 1,
    };
  }

  const key = argument.slice(2);
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for --${key}`);
  }

  return { key, value, consumed: 2 };
}

function parseArguments(argv) {
  const options = {};

  for (let index = 0; index < argv.length;) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      return { help: true };
    }
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${argument}`);
    }

    const option = readOption(argv, index);
    const key = option.key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (!["input", "output", "screenName", "name", "bio", "avatarUrl", "baseUrl", "verified"].includes(key)) {
      throw new Error(`Unknown option: --${option.key}`);
    }
    options[key] = option.value;
    index += option.consumed;
  }

  return options;
}

function parseBoolean(value, optionName) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error(`${optionName} must be true or false`);
}

function mediaUrl(baseUrl, filename) {
  return `${baseUrl.replace(/\/+$/, "")}/${filename}`;
}

async function readJsonIfPresent(filename) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`Cannot read ${filename}: ${error.message}`);
  }
}

async function writeJsonAtomically(filename, value) {
  const temporaryFilename = `${filename}.tmp`;
  await writeFile(temporaryFilename, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryFilename, filename);
}

function getOrCreatePost(postsById, id) {
  let post = postsById.get(id);
  if (!post) {
    post = { id, captions: [], slots: new Map() };
    postsById.set(id, post);
  }
  return post;
}

function getOrCreateSlot(post, index) {
  let slot = post.slots.get(index);
  if (!slot) {
    slot = { images: [], videos: [] };
    post.slots.set(index, slot);
  }
  return slot;
}

function validatePost(post) {
  if (post.captions.length !== 1) {
    throw new Error(`${post.id}: expected exactly one caption, found ${post.captions.length}`);
  }

  const indexes = [...post.slots.keys()].sort((left, right) => left - right);
  if (indexes.length === 0) {
    throw new Error(`${post.id}: no media files found`);
  }

  const firstIndex = indexes[0];
  if (firstIndex !== 0 && firstIndex !== 1) {
    throw new Error(`${post.id}: media numbering must start at the base filename or _1`);
  }
  for (let offset = 0; offset < indexes.length; offset += 1) {
    if (indexes[offset] !== firstIndex + offset) {
      throw new Error(`${post.id}: media numbering contains a gap (${indexes.join(", ")})`);
    }
  }

  for (const index of indexes) {
    const slot = post.slots.get(index);
    if (slot.images.length !== 1) {
      throw new Error(
        `${post.id}${index === 0 ? "" : `_${index}`}: expected one display image, found ${slot.images.length}`,
      );
    }
    if (slot.videos.length > 1) {
      throw new Error(`${post.id}: multiple videos found at media index ${index}`);
    }
  }

  return indexes;
}

async function buildPosts(inputDirectory, filenames, baseUrl) {
  const postsById = new Map();
  const ignoredFiles = [];

  for (const filename of filenames) {
    if (filename === "id" || filename === ".DS_Store" || PROFILE_PICTURE_PATTERN.test(filename)) {
      continue;
    }

    const match = filename.match(POST_FILE_PATTERN);
    if (!match) {
      ignoredFiles.push(filename);
      continue;
    }

    const [, id, rawIndex, rawExtension] = match;
    const extension = rawExtension.toLowerCase();
    const post = getOrCreatePost(postsById, id);

    if (extension === "txt") {
      if (rawIndex !== undefined) {
        throw new Error(`${filename}: numbered caption files are not supported`);
      }
      post.captions.push(filename);
      continue;
    }

    const slot = getOrCreateSlot(post, rawIndex === undefined ? 0 : Number(rawIndex));
    if (IMAGE_EXTENSIONS.has(extension)) {
      slot.images.push(filename);
    } else if (VIDEO_EXTENSIONS.has(extension)) {
      slot.videos.push(filename);
    } else {
      ignoredFiles.push(filename);
    }
  }

  const posts = [];
  let videoPosts = 0;
  let videoFiles = 0;
  for (const post of [...postsById.values()].sort((left, right) => left.id.localeCompare(right.id))) {
    const indexes = validatePost(post);
    const caption = (await readFile(path.join(inputDirectory, post.captions[0]), "utf8"))
      .replace(/\r\n?/g, "\n")
      .replace(/\n+$/, "");
    const media = indexes.map((index) => {
      const slot = post.slots.get(index);
      const poster = mediaUrl(baseUrl, slot.images[0]);
      return slot.videos.length === 1
        ? { type: "video", url: mediaUrl(baseUrl, slot.videos[0]), poster }
        : { type: "image", url: poster };
    });
    const images = media.map((item) => item.type === "video" ? item.poster : item.url);
    const currentVideoFiles = indexes.reduce(
      (count, index) => count + post.slots.get(index).videos.length,
      0,
    );

    const generatedPost = {
      id: post.id,
      date: post.id.slice(0, 10),
      text: caption,
      images,
      media,
    };
    if (currentVideoFiles > 0) {
      videoPosts += 1;
      videoFiles += currentVideoFiles;
    }
    posts.push(generatedPost);
  }

  return { posts, ignoredFiles, videoPosts, videoFiles };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  if (!options.input || !options.output) {
    printHelp();
    throw new Error("Both --input and --output are required");
  }

  const inputDirectory = path.resolve(options.input);
  const outputDirectory = path.resolve(options.output);
  const inputStats = await stat(inputDirectory);
  if (!inputStats.isDirectory()) {
    throw new Error(`Input is not a directory: ${inputDirectory}`);
  }

  const screenName = options.screenName ?? path.basename(inputDirectory);
  const baseUrl = (options.baseUrl ?? `${DEFAULT_ARCHIVE_ROOT}/${screenName}`).replace(/\/+$/, "");
  const directoryEntries = await readdir(inputDirectory, { withFileTypes: true });
  const filenames = directoryEntries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const profilePictures = filenames.filter((filename) => PROFILE_PICTURE_PATTERN.test(filename)).sort();
  if (profilePictures.length > 1 && !options.avatarUrl) {
    throw new Error(`Multiple profile pictures found; select one with --avatar-url: ${profilePictures.join(", ")}`);
  }

  const { posts, ignoredFiles, videoPosts, videoFiles } = await buildPosts(
    inputDirectory,
    filenames,
    baseUrl,
  );
  if (posts.length === 0) {
    throw new Error("No Instagram posts were found");
  }

  await mkdir(outputDirectory, { recursive: true });
  const existingUser = await readJsonIfPresent(path.join(outputDirectory, "user.json"));
  const avatar = options.avatarUrl
    ?? existingUser?.avatar
    ?? (profilePictures[0] ? mediaUrl(baseUrl, profilePictures[0]) : "");
  const user = {
    name: options.name ?? existingUser?.name ?? screenName,
    screen_name: screenName,
    avatar,
    bio: options.bio ?? existingUser?.bio ?? "",
    verified: options.verified === undefined
      ? (existingUser?.verified ?? false)
      : parseBoolean(options.verified, "--verified"),
  };

  await Promise.all([
    writeJsonAtomically(path.join(outputDirectory, "meta.json"), { count: posts.length }),
    writeJsonAtomically(path.join(outputDirectory, "posts.json"), posts),
    writeJsonAtomically(path.join(outputDirectory, "user.json"), user),
  ]);

  console.log(`Generated ${posts.length} posts in ${outputDirectory}`);
  console.log(`Media: ${posts.reduce((count, post) => count + post.images.length, 0)} display images`);
  console.log(`Videos: ${videoFiles} files across ${videoPosts} posts (JPG posters retained in images)`);
  console.log(`User: @${screenName}${profilePictures[0] ? `, avatar ${profilePictures[0]}` : ", no avatar detected"}`);
  if (!options.name && !existingUser?.name) {
    console.warn(`Warning: display name defaulted to @${screenName}; pass --name to override it.`);
  }
  if (ignoredFiles.length > 0) {
    console.warn(`Ignored ${ignoredFiles.length} unrecognized files: ${ignoredFiles.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(`Instagram data generation failed: ${error.message}`);
  process.exitCode = 1;
});
