import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation, useRoute} from '@react-navigation/native';
import Header from '../../components/Header';
import axiosInstance from '../../configs/axios';
import moment from 'moment'; // Import moment

const {height} = Dimensions.get('window');

export default function FormTask() {
  const initData = [];

  // Create task data for the week
  for (let i = 1; i < 8; i++) {
    const dayOfWeek = moment().add(i, 'days').format('dddd');
    let title;

    if (i === 6) {
        title = 'Thứ 7'; // For Saturday
    } else if (i === 7) {
        title = 'Chủ Nhật'; // For Sunday
    } else {
        title = `Thứ ${i + 1}`; // For other days (Monday to Friday)
    }

    initData.push({
        taskIDTongQuanTuan: i + 1,
        title: title,
        description: '',
        datetimeTask: moment().add(i, 'days').toISOString(), // ISO format of the date
    });
}


  const param = useRoute();
  const data = param.params;
  const [data_task, setDataTask] = useState(data ? data : initData);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleForm = value => {
    const updatedTasks = data_task.map((task, idx) => {
      if (idx === currentIndex) {
        return {...task, description: value};
      }
      return task;
    });
    setDataTask(updatedTasks);
  };

  const post_data = () => {
    const formattedTasks = data_task.map(task => ({
      ...task,
      description: `<pre>${task.description}</pre>`,
    }));

    axiosInstance
      .post('/import-task-tong-quan', formattedTasks)
      .then(res => {
        res = res.data;
        if (res.code === 400) {
          Toast.show({
            type: 'error',
            text1: res.message,
            text2: res.data,
            text2Style: {
              fontWeight: 700,
              color: 'black',
            },
            visibilityTime: 3000,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
          });
        }
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text1: 'Thất bại',
          text2: 'Đã có lỗi xảy ra',
          text2Style: {
            fontWeight: 700,
            color: 'black',
          },
          visibilityTime: 3000,
        });
      })
      .finally(() => {
        navigation.navigate('Main', {screen: 'ListTask'});
      });
  };

  useEffect(() => {
    console.log('data_task', data_task);
  }, [data_task]);

  const renderItem = () => {
    const currentTask = data_task[currentIndex];
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{currentTask.title}</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          multiline={true}
          onChangeText={handleForm}
          value={currentTask.description}
          placeholder="Nhập nội dung ở đây..."
        />
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < data_task.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.containerTask}>{renderItem()}</View>

      <View style={styles.containerButton}>
        <TouchableOpacity
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
          onPress={handleBack}
          disabled={currentIndex === 0}>
          <Text style={styles.buttonText}>Trước</Text>
        </TouchableOpacity>

        {currentIndex === data_task.length - 1 ? (
          <TouchableOpacity style={styles.saveButton} onPress={post_data}>
            <Text style={styles.buttonText}>Hoàn thành</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Sau</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  containerTask: {
    padding: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 40,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 5,
  },
  multilineInput: {
    height: 300,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: {width: 0, height: 2}, // Độ lệch của bóng
    shadowOpacity: 0.3, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính mờ của bóng
  },
  saveButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: {width: 0, height: 2}, // Độ lệch của bóng
    shadowOpacity: 0.3, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính mờ của bóng
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#aaa', // Màu khi nút bị vô hiệu hóa
    elevation: 0,
    shadowOpacity: 0,
  },
});
