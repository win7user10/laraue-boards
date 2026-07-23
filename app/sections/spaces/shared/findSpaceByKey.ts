export const findSpaceByKey = <Space extends { key: string }>(
  spaces: Space[],
  spaceKey: string,
) => spaces.find((space) => space.key === spaceKey)
