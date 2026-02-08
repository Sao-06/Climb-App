import { COLORS } from '@/lib/constants';
import {
    createTeam,
    getAllTeams,
    getUserTeams,
    joinPrivateTeamWithCode,
    joinPublicTeam,
    joinTeamWithAccessCode,
} from '@/lib/teamService';
import { Team, UserProfile } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TeamDashboardProps {
  user: UserProfile;
}

const getCharacterImage = (characterType: string) => {
  const images: Record<string, any> = {
    llama: require('@/assets/images/lama.png'),
    leopard: require('@/assets/images/jaguar.png'),
    guineapig: require('@/assets/images/guinea pig.png'),
    elephant: require('@/assets/images/elephant.png'),
  };
  return images[characterType] || images.llama;
};

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ user }) => {
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [publicTeams, setPublicTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamIsPublic, setNewTeamIsPublic] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerNickname, setOwnerNickname] = useState('');
  const [accessCode, setAccessCode] = useState('');

  // Form state for joining private team
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teams = await getUserTeams(user.name);
      setUserTeams(teams);

      const allTeams = await getAllTeams();
      const publicTeamsList = allTeams.filter(t => t.isPublic && !teams.some(ut => ut.id === t.id));
      setPublicTeams(publicTeamsList);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      const team = await createTeam(
        user,
        newTeamName,
        newTeamDesc,
        newTeamIsPublic,
        ownerEmail,
        ownerNickname,
        accessCode
      );
      setUserTeams([...userTeams, team]);
      setNewTeamName('');
      setNewTeamDesc('');
      setNewTeamIsPublic(true);
      setOwnerEmail('');
      setOwnerNickname('');
      setAccessCode('');
      setShowCreateModal(false);
      Alert.alert('Success', `Team "${team.name}" created!\n\nAccess Code: ${team.accessCode}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create team');
      console.error(error);
    }
  };

  const handleJoinPublicTeam = async (teamId: string) => {
    try {
      const team = await joinPublicTeam(user, teamId);
      if (team) {
        setUserTeams([...userTeams, team]);
        setPublicTeams(publicTeams.filter(t => t.id !== teamId));
        Alert.alert('Success', `Joined "${team.name}"!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join team');
      console.error(error);
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an access code');
      return;
    }

    try {
      // Try access code first, then fallback to invite code
      let team = await joinTeamWithAccessCode(user, inviteCode.toUpperCase());
      
      if (!team) {
        team = await joinPrivateTeamWithCode(user, inviteCode.toUpperCase());
      }
      
      if (team) {
        setUserTeams([...userTeams, team]);
        setInviteCode('');
        setShowJoinModal(false);
        Alert.alert('Success', `Joined "${team.name}"!`);
      } else {
        Alert.alert('Error', 'Invalid access code');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid access code or team is full');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Show team detail view if a team is selected
  if (selectedTeam) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedTeam(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TeamDetailView team={selectedTeam} user={user} onClose={() => setSelectedTeam(null)} />
      </View>
    );
  }

  // Main teams list view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.subtitle}>Work together, climb higher</Text>

        {userTeams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emoji}>🏔️</Text>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptyDesc}>Create a team or join an existing one to get started</Text>
          </View>
        ) : (
          <View style={styles.teamsSection}>
            <Text style={styles.sectionTitle}>Your Teams</Text>
            {userTeams.map(team => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamCard}
                onPress={() => setSelectedTeam(team)}
              >
                <View style={styles.teamCardHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.memberCount}>{team.members.length} members</Text>
                </View>
                <Text style={styles.teamDesc}>{team.description}</Text>
                <View style={styles.teamStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Points</Text>
                    <Text style={styles.statValue}>{team.teamPoints}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Level</Text>
                    <Text style={styles.statValue}>{team.teamLevel}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Streak</Text>
                    <Text style={styles.statValue}>{team.streak.currentStreak}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {publicTeams.length > 0 && (
          <View style={styles.teamsSection}>
            <Text style={styles.sectionTitle}>Discover Teams</Text>
            {publicTeams.slice(0, 3).map(team => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamCardHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.memberCount}>{team.members.length}/{team.maxMembers}</Text>
                </View>
                <Text style={styles.teamDesc}>{team.description}</Text>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinPublicTeam(team.id)}
                >
                  <Text style={styles.joinButtonText}>Join Team</Text>
                </TouchableOpacity>
              </View>
            ))}
            {publicTeams.length > 3 && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => setShowBrowseModal(true)}
              >
                <Text style={styles.browseButtonText}>Browse All Public Teams</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.buttonText}>+ Create Team</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.secondaryButtonText}>🔓 Join with Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Create Team Modal */}
      <Modal visible={showCreateModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Create New Team</Text>

            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional description"
              value={newTeamDesc}
              onChangeText={setNewTeamDesc}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Team Type</Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  newTeamIsPublic && styles.toggleButtonActive,
                ]}
                onPress={() => setNewTeamIsPublic(true)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    newTeamIsPublic && styles.toggleButtonTextActive,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !newTeamIsPublic && styles.toggleButtonActive,
                ]}
                onPress={() => setNewTeamIsPublic(false)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    !newTeamIsPublic && styles.toggleButtonTextActive,
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.typeInfo}>
              {newTeamIsPublic
                ? '👥 Anyone can discover and join your team'
                : '🔒 Require invite code to join'}
            </Text>

            <Text style={styles.label}>Your Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional display name"
              value={ownerNickname}
              onChangeText={setOwnerNickname}
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional email for team contact"
              value={ownerEmail}
              onChangeText={setOwnerEmail}
              keyboardType="email-address"
              placeholderTextColor={COLORS.slate400}
            />

            <Text style={styles.label}>Access Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional custom code (auto-generated if blank)"
              value={accessCode}
              onChangeText={setAccessCode}
              maxLength={6}
              autoCapitalize="characters"
              placeholderTextColor={COLORS.slate400}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateTeam}
            >
              <Text style={styles.buttonText}>Create Team</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Join with Code Modal */}
      <Modal visible={showJoinModal} animationType="slide">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setShowJoinModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Join Team</Text>
            <Text style={styles.modalDesc}>Enter the access code or invite code from your team</Text>

            <Text style={styles.label}>Access Code</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g. ABC123"
              value={inviteCode}
              onChangeText={text => setInviteCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              placeholderTextColor={COLORS.slate400}
            />

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleJoinWithCode}
            >
              <Text style={styles.buttonText}>Join Team</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Team Detail View Component
 */
interface TeamDetailProps {
  team: Team;
  user: UserProfile;
  onClose: () => void;
}

const TeamDetailView: React.FC<TeamDetailProps> = ({ team, user, onClose }) => {
  return (
    <ScrollView style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{team.name}</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {team.streak.currentStreak}</Text>
        </View>
      </View>

      {team.description && (
        <Text style={styles.detailDesc}>{team.description}</Text>
      )}

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: COLORS.slate100 }]}>
          <Text style={styles.statCardLabel}>Team Points</Text>
          <Text style={styles.statCardValue}>{team.teamPoints}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.slate100 }]}>
          <Text style={styles.statCardLabel}>Level</Text>
          <Text style={styles.statCardValue}>{team.teamLevel}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.slate100 }]}>
          <Text style={styles.statCardLabel}>Multiplier</Text>
          <Text style={styles.statCardValue}>{team.streak.streakMultiplier.toFixed(1)}x</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members ({team.members.length})</Text>
        {team.members.map(member => (
          <View key={member.userId} style={styles.memberItem}>
            <Image
              source={getCharacterImage(member.characterType)}
              style={styles.memberImage}
            />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.role === 'owner' && <Text style={styles.ownerBadge}>Owner</Text>}
              </View>
              <Text style={styles.memberProgress}>{member.pomodoroSessionsCompleted} sessions</Text>
            </View>
          </View>
        ))}
      </View>

      {team.sharedMissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Missions</Text>
          {team.sharedMissions.map(mission => (
            <View key={mission.id} style={styles.missionCard}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${mission.progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{mission.progress}% Complete</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.slate500,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.slate500,
    textAlign: 'center',
    marginTop: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.slate500,
    textAlign: 'center',
  },
  teamsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate800,
    marginBottom: 12,
  },
  teamCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  memberCount: {
    fontSize: 13,
    color: COLORS.slate500,
  },
  teamDesc: {
    fontSize: 13,
    color: COLORS.slate600,
    marginBottom: 12,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.slate500,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  joinButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  browseButton: {
    backgroundColor: COLORS.slate100,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  browseButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtons: {
    marginTop: 24,
    marginBottom: 48,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.slate100,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  // Modal styles
  modal: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  modalContent: {
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: COLORS.slate500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.slate500,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.slate100,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate600,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  typeInfo: {
    fontSize: 13,
    color: COLORS.slate500,
    marginBottom: 24,
  },

  // Detail view styles
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.slate900,
  },
  streakBadge: {
    backgroundColor: COLORS.slate100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate800,
  },
  detailDesc: {
    fontSize: 14,
    color: COLORS.slate600,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    color: COLORS.slate600,
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 24,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },
  memberImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate800,
  },
  ownerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberProgress: {
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 2,
  },
  missionCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.slate200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.slate500,
  },
});

export default TeamDashboard;
