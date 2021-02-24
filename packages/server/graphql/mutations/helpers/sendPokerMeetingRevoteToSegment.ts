import {MeetingMember, NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import Meeting from '../../../database/types/Meeting'
import segmentIo from '../../../utils/segmentIo'

const sendPokerMeetingRevoteToSegment = async (
  meeting: Meeting,
  meetingMembers: MeetingMember[]
) => {
  const {facilitatorUserId, meetingNumber, phases, teamId} = meeting
  const presentMemberUserIds = meetingMembers.map(({userId}) => userId)
  presentMemberUserIds.forEach((userId) => {
    const wasFacilitator = userId === facilitatorUserId
    segmentIo.track({
      userId,
      event: 'Poker Meeting Team Revoted',
      properties: {
        hasIcebreaker: phases[0].phaseType === NewMeetingPhaseTypeEnum.checkin,
        wasFacilitator,
        meetingNumber,
        teamMembersCount: meetingMembers.length,
        teamMembersPresentCount: meetingMembers.length,
        teamId
      }
    })
  })
}

export default sendPokerMeetingRevoteToSegment
