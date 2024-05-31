import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

const messages = [
  "Bravo! Idemo na naredni korak!",
  "Odlično! Nastavi tako!",
  "Svaka čast! Sljedeći korak te čeka!",
  "Super! Nastavi dalje!",
  "Fantastično! Idemo dalje!"
];

const { width, height } = Dimensions.get('window');

const StepsComponent = ({ taskId, onLastStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      // Get the current timestamp
      const userEndTime = new Date().toLocaleString('bs-BA');

      await fetch(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      // Make a request to your API to update userEndTime
      await fetch(`https://my-task-buddy-nu.vercel.app/tasks/${taskId}/update-userEndTime`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEndTime }),
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };
  const updateTaskProgress = useCallback(async (taskId) => {
    try {
      const completedSteps = steps.filter((step) => step.status === 1);
      const progress = ((completedSteps.length + 1) / steps.length )*100;

      await fetch(`https://my-task-buddy-nu.vercel.app/tasks/update-progress/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  }, [steps]);

  const updateStepStatus = useCallback(async (stepId) => {
    try {
      const response = await fetch('https://my-task-buddy-nu.vercel.app/substeps/update-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stepId, status: 1 }),
      });
      
      if (response.ok) {
        const updatedSteps = steps.map((step) => {
          if (step.id === stepId) {
            return { ...step, status: 1 };
          }
          return step;
        });
        setSteps(updatedSteps);
        await updateTaskProgress(taskId);
        // Check if all steps are completed
        const allStepsCompleted = updatedSteps.every((step) => step.status === 1);
        if (allStepsCompleted) {
          // Update the task status to 2
          await updateTaskStatus(taskId, 2);
          // Trigger the callback function in the Task component
         onLastStepComplete();
        }
      }
    } catch (error) {
      console.error('Error updating step status:', error);
    }
  }, [steps, taskId, updateTaskProgress]);

  useEffect(() => {
    const fetchSubsteps = async (taskId) => {
      try {
        const response = await fetch(`https://my-task-buddy-nu.vercel.app/substeps/${taskId}`);
        const data = await response.json();
        const substeps = data.substeps;

        // Find the index of the first step with status 0
        const firstIncompleteStepIndex = substeps.findIndex(step => step.status === 0);

        // Set the current step to the index of the first incomplete step + 1
        setCurrentStep(firstIncompleteStepIndex + 1);

        setSteps(substeps);
      } catch (error) {
        console.error('Error fetching substeps:', error);
      }
    };

    fetchSubsteps(taskId);
  }, [taskId]);

  const handleStepCompletion = async () => {
    const currentStepId = steps[currentStep - 1]?.id;
    if (currentStepId) {
      await updateStepStatus(currentStepId);
      setCurrentStep((prevStep) => prevStep + 1);
      showMessage(); // Prikazivanje poruke
    }
  };

  const showMessage = () => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    Toast.show({
      type: 'success',
      text1: randomMessage,
      position: 'bottom'
    });
  };
  

  const renderStepButton = (stepNumber, stepStatus) => {
    const isCurrentStep = currentStep === stepNumber;
    const isCompletedStep = stepStatus === 1;

    let buttonText = '';
    let buttonStyle = {};

    if (isCompletedStep) {
      buttonText = 'Završeno';
      buttonStyle = styles.completeButton;
    } else if (isCurrentStep) {
      buttonText = 'Dalje';
      buttonStyle = styles.continueButton;
    } else {
      // Step is locked and inactive
      return (
        <View style={styles.inactiveStepIcon}>
          <Icon name="lock" size={22} color="gray" />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.stepButton, buttonStyle]}
        onPress={handleStepCompletion}
        disabled={!isCurrentStep}
      >
        <Text style={styles.stepButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    );
  };

  const renderStepCard = (stepNumber, stepName, stepDescription, index, stepStatus) => {
    const isCurrentStep = currentStep === stepNumber;
    const isCompletedStep = stepStatus === 1;

    const stepCardStyle = [
      styles.stepCard,
      isCompletedStep && styles.completedStepCard,
      isCurrentStep && styles.currentStepCard,
    ];

    const stepNumberStyle = [
      styles.stepNumber,
      isCompletedStep ? styles.completedStepNumber : styles.inactiveStepNumber,
      isCurrentStep && styles.currentStepNumber,
    ];

    const stepNameStyle = [
      styles.stepName,
      isCompletedStep && styles.completedStepName,
    ];

    return (
      <View key={index} style={stepCardStyle}>
        <View style={stepNumberStyle}>
          {isCompletedStep ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={styles.stepNumberText}>{stepNumber}</Text>
          )}
        </View>
        <View style={styles.stepContent}>
          <Text style={stepNameStyle}>{stepName}</Text>
          <Text style={styles.stepDescription}>{stepDescription}</Text>
        </View>
        {renderStepButton(stepNumber, stepStatus)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) =>
        renderStepCard(index + 1, step.stepName, step.description, index, step.status)
      )}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};
const stepCardPadding = width * 0.05;
const stepCardMarginHorizontal = width * 0.1;
const stepNumberSize = width * 0.08;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.03,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
    padding: height * 0.02,
    borderRadius: width * 0.04,
    borderWidth: width * 0.006,
    borderColor: '#d9d9d9',
    backgroundColor: 'white',
    paddingLeft: width * 0.1,
    marginHorizontal: stepCardMarginHorizontal,
  },
  completedStepCard: {
    borderColor: '#00b386',
    backgroundColor: '#e6fff5',
  },
  currentStepCard: {
    borderColor: '#66b3ff',
    backgroundColor: 'white',
  },
  stepNumber: {
    position: 'absolute',
    left: -stepNumberSize / 2, // Adjust this value as needed for positioning
    width: stepNumberSize,
    height: stepNumberSize,
    borderRadius: stepNumberSize / 2,
    borderWidth: width * 0.006,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure the number is above the card background
    backgroundColor: 'white',
  },
  inactiveStepNumber: {
    borderColor: '#d9d9d9',
  },
  currentStepNumber: {
    borderColor: '#66b3ff',
  },
  stepNumberText: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
    color: 'black',
  },
  completedStepNumber: {
    backgroundColor: '#00b386',
    borderColor: '#00b386',
  },
  stepName: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  completedStepName: {
    color: '#00b377',
  },
  stepContent: {
    flex: 1,
    marginRight: width * 0.04,
  },
  stepDescription: {
    marginTop: height * 0.01,
    color: 'grey',
    fontSize: width * 0.03
  },
  stepButton: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.01,
    borderWidth: width * 0.003,
    borderColor: '#1a75ff',
    backgroundColor: 'white',
  },
  continueButton: {
    backgroundColor: '#66b3ff',
    borderColor: '#66b3ff',
    borderRadius: width * 0.045,
  },
  completeButton: {
    backgroundColor: '#00b377',
    borderColor: '#00b377',
    borderRadius: width * 0.04,
  },
  stepButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.03
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.05,
  },
  inactiveStepIcon:{
    marginRight:10
  }
});

export default StepsComponent;
