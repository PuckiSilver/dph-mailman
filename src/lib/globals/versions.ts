type MinecraftVersion = {
    id: string;
    name: string;
    release_target: null | string;
    type: string;
    stable: boolean;
    data_version: number;
    protocol_version: number;
    data_pack_version: number;
    resource_pack_version: number;
    build_time: string;
    release_time: string;
    sha1: string;
};
  
const response = await fetch(
    "https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.min.json"
);
const minecraftVersionData: MinecraftVersion[] = await response.json();

const minecraftVersions: { format: number, label: string }[] = [];

let isNewSnapshot: boolean = true;
for (
    let index = minecraftVersionData[0].data_pack_version;
    index > 0;
    index--
) {
    const mcVs: MinecraftVersion[] = minecraftVersionData.filter(
        (version: MinecraftVersion) => version.data_pack_version === index
    );
    if (mcVs.length === 0) {
        continue;
    }
    const stableMcVs: MinecraftVersion[] = mcVs.filter(
        (version: MinecraftVersion) => version.stable
    );
    if (stableMcVs.length === 1) {
        minecraftVersions.push({ format: index, label: stableMcVs[0].id });
        isNewSnapshot = false;
    } else if (stableMcVs.length > 1) {
        minecraftVersions.push({ format: index, label: `${stableMcVs.at(-1)?.id} - ${stableMcVs[0].id}` });
        isNewSnapshot = false;
    } else if (isNewSnapshot && mcVs.length === 1) {
        minecraftVersions.push({ format: index, label: mcVs[0].id});
    } else if (isNewSnapshot && mcVs.length > 1) {
        minecraftVersions.push({ format: index, label: `${mcVs.at(-1)?.id} - ${mcVs[0].id}`});
    }
}

export const getDataPackVersion = (version: string): number => {
    for (const dpv of minecraftVersions) {
        if (dpv.label === version) {
            return dpv.format;
        }
    }
    throw new Error(`Unknown version ${version}`);
};

export const getAllReleases = (format: number, stableOnly: boolean): string[] => {
    const mcVs: MinecraftVersion[] = minecraftVersionData.filter(
        (version: MinecraftVersion) => version.data_pack_version === format && (stableOnly ? version.stable : true)
    );
    return mcVs.map((version: MinecraftVersion) => version.id);
}

export { minecraftVersions };
