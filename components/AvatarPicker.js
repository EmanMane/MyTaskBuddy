import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const AvatarPicker = ({ avatars, onSelectAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleAvatarPress = (avatar) => {
    setSelectedAvatar(avatar);
    onSelectAvatar(avatar);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        {avatars.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            onPress={() => handleAvatarPress(avatar)}
            style={[
              styles.avatarContainer,
              selectedAvatar?.id === avatar.id && styles.selectedAvatarContainer,
            ]}
          >
            <Image source={{ uri: avatar.url }} style={styles.avatar} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.15,
    marginBottom: height * 0.02,
  },
  avatarContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: width * 0.1,
    marginRight: width * 0.02,
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAvatarContainer: {
    borderColor: '#00C4FF',
    borderWidth: 2,
  },
  avatar: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
  },
});

export default AvatarPicker;
