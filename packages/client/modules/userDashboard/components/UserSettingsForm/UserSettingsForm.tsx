import styled from '@emotion/styled'
import React, {lazy, useState} from 'react'
import {extractRoleFromPreferredName} from '~/utils/extractRoleFromPreferredName'
import {UserProfileQuery} from '../../../../__generated__/UserProfileQuery.graphql'
import EditableAvatar from '../../../../components/EditableAvatar/EditableAvatar'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useModal from '../../../../hooks/useModal'
import useMutationProps from '../../../../hooks/useMutationProps'
import UpdateUserProfileMutation from '../../../../mutations/UpdateUserProfileMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import defaultUserAvatar from '../../../../styles/theme/images/avatar-user.svg'
import {Breakpoint, Layout, UserRoles} from '../../../../types/constEnums'
import withForm, {WithFormProps} from '../../../../utils/relay/withForm'
import Legitity from '../../../../validation/Legitity'
import NotificationErrorMessage from '../../../notifications/components/NotificationErrorMessage'

const PrefixSelect = styled('select')({
  marginBottom: 16,
  padding: '8px',
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    marginBottom: 0,
    marginRight: 16
  }
})

const SettingsForm = styled('form')({
  alignItems: 'center',
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  display: 'flex',
  flexDirection: 'column',
  padding: Layout.ROW_GUTTER,
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row'
  }
})

const InfoBlock = styled('div')({
  flex: 1,
  paddingLeft: Layout.ROW_GUTTER
})

const FieldBlock = styled('div')({
  flex: 1,
  minWidth: 0,
  padding: '0 0 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '0 16px 0 0'
  }
})

const ControlBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    flexDirection: 'row',
    flex: 1
  }
})

const StyledButton = styled(SecondaryButton)({
  width: 112
})

const StyledOption = styled('option')({
  backgroundColor: '#fff',
  color: '#333',
  padding: '8px'
})

const UserAvatarInput = lazy(
  () => import(/* webpackChunkName: 'UserAvatarInput' */ '../../../../components/UserAvatarInput')
)

interface UserSettingsProps extends WithFormProps<'preferredName' | 'role'> {
  viewer: UserProfileQuery['response']['viewer']
}

function UserSettings(props: UserSettingsProps) {
  const {fields, onChange, validateField, viewer} = props
  const atmosphere = useAtmosphere()
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const [prefix, setPrefix] = useState(() => extractRoleFromPreferredName(viewer.preferredName))

  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrefix = e.target.value
    setPrefix(newPrefix)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preferredNameRes = validateField('preferredName')
    const preferredName = `${prefix ? prefix + ' | ' : ''}${preferredNameRes.value}`
    if (preferredName === viewer.preferredName || submitting) return
    submitMutation()
    UpdateUserProfileMutation(atmosphere, {updatedUser: {preferredName}}, {onError, onCompleted})
  }

  const {picture} = viewer
  const pictureOrDefault = picture || defaultUserAvatar
  const {togglePortal, modalPortal} = useModal()
  return (
    <SettingsForm onSubmit={onSubmit}>
      <div onClick={togglePortal}>
        <EditableAvatar picture={pictureOrDefault} className='h-24 w-24' />
      </div>
      {modalPortal(<UserAvatarInput closeModal={togglePortal} picture={pictureOrDefault} />)}
      <InfoBlock>
        <FieldLabel
          customStyles={{paddingBottom: 8}}
          label='Name'
          fieldSize='medium'
          indent
          htmlFor='preferredName'
        />
        <ControlBlock>
          <FieldBlock>
            {/* TODO: Make me Editable.js (TA) */}
            <BasicInput
              {...fields.preferredName}
              autoFocus
              onChange={onChange}
              name='preferredName'
              placeholder='My name'
            />
          </FieldBlock>
        </ControlBlock>
        <NotificationErrorMessage error={error} />
      </InfoBlock>
      <InfoBlock>
        <FieldLabel
          customStyles={{paddingBottom: 8}}
          label='Role'
          fieldSize='medium'
          indent
          htmlFor='role'
        />
        <ControlBlock>
          <FieldBlock>
            <PrefixSelect value={prefix} name='role' onChange={handlePrefixChange}>
              <StyledOption value={UserRoles.USER_ROLE_DEFAULT_SLUG}>
                {UserRoles.USER_ROLE_DEFAULT_LABEL}
              </StyledOption>
              <StyledOption value={UserRoles.USER_ROLE_DEVELOPER_SLUG}>
                {UserRoles.USER_ROLE_DEVELOPER_LABEL}
              </StyledOption>
              <StyledOption value={UserRoles.USER_ROLE_TESTER_SLUG}>
                {UserRoles.USER_ROLE_TESTER_LABEL}
              </StyledOption>
              <StyledOption value={UserRoles.USER_ROLE_PROJECT_MANAGER_SLUG}>
                {UserRoles.USER_ROLE_PROJECT_MANAGER_LABEL}
              </StyledOption>
            </PrefixSelect>
          </FieldBlock>
          <StyledButton size='medium'>{'Update'}</StyledButton>
        </ControlBlock>
        <NotificationErrorMessage error={error} />
      </InfoBlock>
    </SettingsForm>
  )
}

const form = withForm({
  preferredName: {
    getDefault: ({viewer}) => {
      const nameParts = viewer.preferredName.split('|')
      return nameParts.length > 1 ? nameParts.slice(-1)[0].trim() : viewer.preferredName
    },
    validate: (value) =>
      new Legitity(value)
        .trim()
        .required('That’s not much of a name, is it?')
        .matches(/^[^|]*$/, 'Sorry, the name cannot include the "|" character :(')
        .min(2, 'C’mon, you call that a name?')
        .max(100, 'I want your name, not your life story')
  },
  role: {
    getDefault: ({viewer}) => {
      return extractRoleFromPreferredName(viewer.preferredName)
    },
    validate: () => new Legitity('')
  }
})

export default form(UserSettings)
