export const extractNameFromPreferredName = (preferredName: string) => {
  return preferredName.substring(preferredName.indexOf('|') + 1)
}
