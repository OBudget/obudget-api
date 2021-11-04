const extractVersionFromUrl = (url: string): string => {
  let result = "";
  const matches = /\/v[0-9]+\//.exec(url);

  if (matches !== null) {
    [result as string] = matches;
  }

  // Delete all the other symbols like slashes, leaving a pure version
  // string like v1 or v2
  result = result.replace(/[^v0-9]/g, "");
  return result;
};

export default {
  extractVersionFromUrl,
};
