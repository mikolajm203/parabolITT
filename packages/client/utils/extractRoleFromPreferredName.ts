import {UserRoles} from '~/types/constEnums'

export const extractRoleFromPreferredName = (preferredName: string) => {
  const nameParts = preferredName.split('|')
  return nameParts.length > 1 && nameParts[0] !== undefined
    ? nameParts[0].trim()
    : UserRoles.USER_ROLE_DEFAULT_SLUG
}
