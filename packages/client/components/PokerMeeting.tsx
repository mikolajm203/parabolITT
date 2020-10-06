import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {PokerMeeting_meeting} from '~/__generated__/PokerMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {ValueOf} from '../types/generics'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import lazyPreload from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import PokerMeetingSidebar from './PokerMeetingSidebar'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

interface Props {
  meeting: PokerMeeting_meeting
  history: any
}

const phaseLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: lazyPreload(() =>
    import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  // SCOPE: lazyPreload(() => import(/* webpackChunkName: 'ScopePhase' */ './ScopePhase')),
  SCOPE: lazyPreload(() =>
    import(/* webpackChunkName: 'PokerEstimatePhase' */ './PokerEstimatePhase')
  )
}

type PhaseComponent = ValueOf<typeof phaseLookup>

export interface PokerMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const PokerMeeting = (props: Props) => {
  const {meeting} = props
  const {
    toggleSidebar,
    streams,
    swarm,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    handleMenuClick
  } = useMeeting(meeting)
  if (!safeRoute) return null
  const {id: meetingId, showSidebar, viewerMeetingMember, localPhase} = meeting
  const {user} = viewerMeetingMember
  const {featureFlags} = user
  const {video: allowVideo} = featureFlags
  const localPhaseType = localPhase?.phaseType
  console.log('PokerMeeting -> localPhaseType', localPhaseType)

  // TODO: remove estimate logic here & in MeetingControlBar when backend is ready
  const {history} = useRouter()
  const Phase = history.location.pathname.includes('estimate')
    ? phaseLookup.ESTIMATE
    : (phaseLookup[localPhaseType] as PhaseComponent)
  const goToEstimate = {
    gotoNext: () => {
      history.push(`/meet/${meetingId}/estimate`)
    }
  }
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <PokerMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <Suspense fallback={''}>
        <Phase
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={
            <NewMeetingAvatarGroup
              allowVideo={allowVideo}
              camStreams={streams.cam}
              swarm={swarm}
              meeting={meeting}
            />
          }
        />
      </Suspense>
      <MeetingControlBar
        meeting={meeting}
        handleGotoNext={localPhaseType === 'SCOPE' ? (goToEstimate as any) : handleGotoNext}
        gotoStageId={gotoStageId}
      />
    </MeetingStyles>
  )
}

export default createFragmentContainer(PokerMeeting, {
  meeting: graphql`
    fragment PokerMeeting_meeting on PokerMeeting {
      ...useMeeting_meeting
      ...PokerMeetingSidebar_meeting
      ...NewMeetingCheckIn_meeting
      ...NewMeetingAvatarGroup_meeting
      ...MeetingControlBar_meeting
      ...ScopePhase_meeting
      id
      showSidebar
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
        }
      }
      viewerMeetingMember {
        user {
          featureFlags {
            video
          }
        }
      }
    }
  `
})
