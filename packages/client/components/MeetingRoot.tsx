import React, {useEffect} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import renderQuery from '../utils/relay/renderQuery'
import MeetingSelector from './MeetingSelector'
import SetAppLocationMutation from '~/mutations/SetAppLocationMutation'

const query = graphql`
  query MeetingRootQuery($meetingId: ID!) {
    viewer {
      ...MeetingSelector_viewer
    }
  }
`

const MeetingRoot = () => {
  const atmosphere = useAtmosphere()
  const {history, match} = useRouter<{meetingId: string}>()
  const {params} = match
  const {meetingId} = params
  useEffect(() => {
    if (!meetingId) return

    // if socket hasn't connected, we can't set app location so wait a lil bit
    setTimeout(() => {
      const location = `/meet/${meetingId}`
      SetAppLocationMutation(atmosphere, {location})
    }, 500)
    return () => {
      SetAppLocationMutation(atmosphere, {location: null})
    }
  }, [])
  useEffect(() => {
    if (!meetingId) {
      history.replace('/me')
    }
  }, [])
  if (!meetingId) return null
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(MeetingSelector, {props: {meetingId}})}
    />
  )
}

export default MeetingRoot
