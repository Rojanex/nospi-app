import { ProfileIdentity, type ProfileIdentityData } from '@/components/profile/ProfileIdentity'
import { ProfileStats } from '@/components/profile/ProfileStats'
import React from 'react'

type ProfileHeaderProps = {
  profile: ProfileIdentityData
  plansCreated: number
  plansJoined: number
}

export function ProfileHeader({
  profile,
  plansCreated,
  plansJoined,
}: ProfileHeaderProps) {
  return (
    <>
      <ProfileIdentity profile={profile} />
      <ProfileStats created={plansCreated} attended={plansJoined} />
    </>
  )
}
