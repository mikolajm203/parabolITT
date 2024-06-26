import {NotifyMentionedResolvers} from '../resolverTypes'

const NotifyMentioned: NotifyMentionedResolvers = {
  __isTypeOf: ({type}) => type === 'MENTIONED',
  retroReflection: async ({retroReflectionId}, _args, {dataLoader}) => {
    if (!retroReflectionId) return null
    const retroReflection = dataLoader.get('retroReflections').load(retroReflectionId)
    if (!retroReflection) {
      return null
    }
    return retroReflection
  },
  senderPicture: async ({senderPicture}, _args, {dataLoader}) => {
    if (!senderPicture) return null
    return dataLoader.get('fileStoreAsset').load(senderPicture)
  }
}

export default NotifyMentioned
