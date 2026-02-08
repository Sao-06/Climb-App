import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '@/lib/constants';
import { missionGenerator, MissionInput, GeneratedMission } from '@/lib/missionGenerator';
import { appManager } from '@/lib/integrationExample';

interface MissionGeneratorProps {
  onMissionSelect?: (mission: GeneratedMission) => void;
  userProfile?: any;
}

export function MissionGenerator({ onMissionSelect, userProfile }: MissionGeneratorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [category, setCategory] = useState<'health' | 'productivity' | 'learning' | 'fitness' | 'career' | 'personal'>('productivity');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMissions, setGeneratedMissions] = useState<GeneratedMission[]>([]);
  const [showResults, setShowResults] = useState(false);

  const categories: Array<'health' | 'productivity' | 'learning' | 'fitness' | 'career' | 'personal'> = [
    'productivity',
    'learning',
    'fitness',
    'health',
    'career',
    'personal',
  ];

  const handleGenerateMissions = async () => {
    if (!userGoal.trim()) {
      Alert.alert('Please enter a goal', 'Your goal cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const missions = await missionGenerator.generateMissionsFromGoal({
        userGoal,
        category,
        difficulty,
        timeframe,
        userProfile,
      });

      setGeneratedMissions(missions);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating missions:', error);
      Alert.alert('Error', 'Failed to generate missions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMission = async (mission: GeneratedMission) => {
    try {
      // Add mission to app manager
      await appManager.createTaskWithAIBreakdown(mission.mainTask.title, userProfile);
      
      if (onMissionSelect) {
        onMissionSelect(mission);
      }

      Alert.alert('Success', `Mission "${mission.title}" added to your tasks!`);
      setIsModalVisible(false);
      setUserGoal('');
      setGeneratedMissions([]);
      setShowResults(false);
    } catch (error) {
      console.error('Error selecting mission:', error);
      Alert.alert('Error', 'Failed to add mission to tasks');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.generateButtonText}>✨ Generate Missions</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setShowResults(false);
          setUserGoal('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setShowResults(false);
                setUserGoal('');
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {!showResults ? (
              <ScrollView style={styles.formContainer}>
                <Text style={styles.title}>Create Your Mission</Text>
                <Text style={styles.subtitle}>Tell us your goal, and we'll generate missions to achieve it</Text>

                <View style={styles.section}>
                  <Text style={styles.label}>What's your goal?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Learn React Native, Run 5K, Master TypeScript"
                    placeholderTextColor={COLORS.slate400}
                    value={userGoal}
                    onChangeText={setUserGoal}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.optionRow}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.optionButton,
                          category === cat && styles.optionButtonActive,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            category === cat && styles.optionButtonTextActive,
                          ]}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Difficulty Level</Text>
                  <View style={styles.optionRow}>
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <TouchableOpacity
                        key={diff}
                        style={[
                          styles.optionButton,
                          difficulty === diff && styles.optionButtonActive,
                        ]}
                        onPress={() => setDifficulty(diff)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            difficulty === diff && styles.optionButtonTextActive,
                          ]}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Timeframe</Text>
                  <View style={styles.optionRow}>
                    {(['daily', 'weekly', 'monthly'] as const).map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.optionButton,
                          timeframe === time && styles.optionButtonActive,
                        ]}
                        onPress={() => setTimeframe(time)}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            timeframe === time && styles.optionButtonTextActive,
                          ]}
                        >
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleGenerateMissions}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Generate Missions 🚀</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView style={styles.resultsContainer}>
                <Text style={styles.title}>Your Generated Missions</Text>

                {generatedMissions.map((mission, index) => (
                  <View key={index} style={styles.missionCard}>
                    <Text style={styles.missionTitle}>{mission.title}</Text>
                    <Text style={styles.missionDescription}>{mission.description}</Text>

                    <View style={styles.missionInfo}>
                      <View style={styles.infoPill}>
                        <Text style={styles.infoPillText}>
                          ⏱️ {mission.estimatedDays} {mission.estimatedDays === 1 ? 'day' : 'days'}
                        </Text>
                      </View>
                      <View style={styles.infoPill}>
                        <Text style={styles.infoPillText}>
                          ⭐ {mission.mainTask.points} points
                        </Text>
                      </View>
                    </View>

                    <View style={styles.subtasksContainer}>
                      <Text style={styles.subtasksTitle}>Subtasks:</Text>
                      {mission.mainTask.subtasks.map((subtask, idx) => (
                        <View key={idx} style={styles.subtaskItem}>
                          <Text style={styles.subtaskNumber}>{idx + 1}.</Text>
                          <View style={styles.subtaskContent}>
                            <Text style={styles.subtaskTitle}>{subtask.title}</Text>
                            <Text style={styles.subtaskPoints}>{subtask.points} pts</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <Text style={styles.motivationText}>💪 {mission.motivation}</Text>

                    <TouchableOpacity
                      style={styles.selectMissionButton}
                      onPress={() => handleSelectMission(mission)}
                    >
                      <Text style={styles.selectMissionButtonText}>Select This Mission</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={() => setShowResults(false)}
                >
                  <Text style={styles.regenerateButtonText}>← Generate Different Missions</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  generateButton: {
    backgroundColor: COLORS.blue500,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    paddingTop: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingRight: 20,
    paddingBottom: 16,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.slate600,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.slate600,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.slate800,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.slate300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.slate900,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.slate300,
    backgroundColor: COLORS.white,
  },
  optionButtonActive: {
    backgroundColor: COLORS.blue500,
    borderColor: COLORS.blue500,
  },
  optionButtonText: {
    fontSize: 14,
    color: COLORS.slate700,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.green500,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: COLORS.slate50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue500,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: COLORS.slate700,
    marginBottom: 12,
  },
  missionInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  infoPill: {
    backgroundColor: COLORS.blue100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  infoPillText: {
    fontSize: 13,
    color: COLORS.blue700,
    fontWeight: '500',
  },
  subtasksContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  subtasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.slate800,
    marginBottom: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subtaskNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.slate600,
    marginRight: 8,
    minWidth: 20,
  },
  subtaskContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtaskTitle: {
    fontSize: 13,
    color: COLORS.slate700,
    flex: 1,
  },
  subtaskPoints: {
    fontSize: 12,
    color: COLORS.slate600,
    marginLeft: 8,
  },
  motivationText: {
    fontSize: 13,
    color: COLORS.slate700,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate200,
  },
  selectMissionButton: {
    backgroundColor: COLORS.green500,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectMissionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  regenerateButton: {
    backgroundColor: COLORS.slate200,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  regenerateButtonText: {
    color: COLORS.slate700,
    fontSize: 14,
    fontWeight: '600',
  },
});
