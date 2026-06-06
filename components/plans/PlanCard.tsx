import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Plan } from '@/types'
import { strings } from '@/constants/strings'
import { Colors } from '@/assets/constants/Colors'

type ActivityColors = { tag: string; bg: string; accent: string }

const ACTIVITY_COLORS: Record<string, ActivityColors> = {
  playa:         { tag: '#E8642A', bg: '#FFF0E8', accent: '#E8642A' },
  'al aire libre': { tag: '#E8642A', bg: '#FFF0E8', accent: '#E8642A' },
  social:        { tag: '#0F6E56', bg: '#E1F5EE', accent: '#0F6E56' },
  parque:        { tag: '#0F6E56', bg: '#E1F5EE', accent: '#0F6E56' },
  rumba:         { tag: '#993556', bg: '#FBEAF0', accent: '#993556' },
  salsa:         { tag: '#993556', bg: '#FBEAF0', accent: '#993556' },
  deporte:       { tag: '#185FA5', bg: '#E6F1FB', accent: '#185FA5' },
  comida:        { tag: '#BA7517', bg: '#FAEEDA', accent: '#BA7517' },
}

const DEFAULT_COLORS: ActivityColors = { tag: '#5F5E5A', bg: '#F1EFE8', accent: '#5F5E5A' }

const ACTIVITY_EMOJI: Record<string, string> = {
  playa:   '🏖️',
  social:  '🥥',
  rumba:   '🎵',
  salsa:   '🎵',
  deporte: '⚽',
  comida:  '🍽️',
}

const PASTEL_COLORS = ['#FFD6D6', '#D6F5D6', '#D6E8FF', '#FFF3D6', '#F5D6FF', '#D6F5F5']

function getPastelColor(initial: string): string {
  return PASTEL_COLORS[initial.charCodeAt(0) % PASTEL_COLORS.length]
}

function getActivityColors(type: string): ActivityColors {
  return ACTIVITY_COLORS[type.toLowerCase()] ?? DEFAULT_COLORS
}

function getEmoji(type: string): string {
  return ACTIVITY_EMOJI[type.toLowerCase()] ?? '✨'
}

interface Props {
  plan: Plan
  onJoin: (id: string) => void
}

export function PlanCard({ plan, onJoin }: Props) {
  const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
  const colors = getActivityColors(primaryType)
  const emoji = getEmoji(primaryType)
  const tags = plan.activity_type.split('|').map(t => t.trim().toUpperCase()).join(' · ')

  const statusLine = plan.is_plan_del_dia
    ? strings.planes.planDelDia(plan.spots_left)
    : plan.spots_left <= 2
      ? strings.planes.soloSpots(plan.spots_left)
      : strings.planes.spotsInfo(plan.attendees.length + plan.extra_attendees, plan.spots_left)

  const statusColor =
    plan.is_plan_del_dia || plan.spots_left <= 2 ? '#E8642A' : Colors.black[400]

  const joinBg = plan.user_joined
    ? Colors.black[100]
    : plan.spots_left === 0
      ? '#C8C6BF'
      : Colors.buttons.orange

  const joinLabel = plan.user_joined
    ? strings.planes.joinedCta
    : plan.spots_left === 0
      ? strings.planes.fullCta
      : strings.planes.joinCta

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: colors.accent }]} />

      <View style={styles.cardContent}>
        {/* TOP SECTION */}
        <View style={styles.topSection}>
          <View style={styles.topRow}>
            <View style={[styles.emojiSquare, { backgroundColor: colors.bg }]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </View>
            <View style={styles.topRight}>
              <Text style={[styles.tagText, { color: colors.tag }]}>{tags}</Text>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.location}>📍 {plan.location_name}</Text>
            </View>
          </View>
        </View>

        {/* DASHED DIVIDER */}
        <View style={styles.dashedDivider} />

        {/* BOTTOM SECTION */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.dateTime}>{plan.date_time}</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLine}</Text>
            </View>

            <View style={styles.rightActionCol}>
              <View style={styles.avatarCluster}>
                {plan.attendees.slice(0, 3).map((initial, i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatar,
                      i > 0 && styles.avatarOverlap,
                      { backgroundColor: getPastelColor(initial) },
                    ]}
                  >
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                ))}
                {plan.extra_attendees > 0 && (
                  <View style={[styles.avatar, styles.avatarOverlap, styles.extraAvatar]}>
                    <Text style={styles.avatarText}>+{plan.extra_attendees}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.joinBtn, { backgroundColor: joinBg }]}
                onPress={() => onJoin(plan.id)}
                disabled={plan.spots_left === 0}
              >
                <Text style={styles.joinBtnText}>{joinLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* HOST ROW */}
        <View style={styles.hostRow}>
          <View style={[styles.hostAvatar, { backgroundColor: getPastelColor(plan.host_initials) }]}>
            <Text style={styles.hostInitialsText}>{plan.host_initials}</Text>
          </View>
          <View style={[
            styles.dotBadge,
            { backgroundColor: plan.host_type === 'local' ? Colors.buttons.orange : Colors.primary[100] },
          ]} />
          <Text style={styles.hostText}>
            {strings.planes.hostPrefix} {plan.host_name} · {plan.host_type === 'local' ? strings.planes.hostLocal : strings.planes.hostTurista}
          </Text>
          <Text style={styles.postedAgo}>{plan.posted_ago}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginBottom: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  cardContent: {
    flex: 1,
  },
  topSection: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  emojiSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  topRight: {
    flex: 1,
    gap: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black[100],
  },
  location: {
    fontSize: 12,
    color: Colors.black[400],
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E0DDD7',
    marginHorizontal: 14,
  },
  bottomSection: {
    padding: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateTime: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black[100],
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  rightActionCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarOverlap: {
    marginLeft: -7,
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5F5E5A',
  },
  extraAvatar: {
    backgroundColor: '#E0DDD7',
  },
  joinBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F1',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  hostAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitialsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5F5E5A',
  },
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hostText: {
    flex: 1,
    fontSize: 12,
    color: Colors.black[400],
  },
  postedAgo: {
    fontSize: 12,
    color: Colors.neutral.hint,
  },
})
