/**
 * Mock implementation of the Web Audio API's AudioContext functionality
 * This allows us to test audio visualization components without actual browser APIs
 */

class MockAnalyserNode {
  fftSize: number = 256;
  frequencyBinCount: number = 128;
  
  getByteFrequencyData(dataArray: Uint8Array) {
    // Fill with mock data for testing visualization
    for (let i = 0; i < dataArray.length; i++) {
      dataArray[i] = Math.floor(Math.random() * 256);
    }
  }
}

class MockMediaStreamSource {
  connect() {
    // Mock connect method
    return this;
  }
}

class MockAudioContext {
  createAnalyser() {
    return new MockAnalyserNode();
  }
  
  createMediaStreamSource() {
    return new MockMediaStreamSource();
  }
}

// Setup global mocks
global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockAudioContext as any;

// Mock MediaDevices API
if (typeof global.navigator === 'undefined') {
  global.navigator = {} as any;
}

if (!global.navigator.mediaDevices) {
  global.navigator.mediaDevices = {
    getUserMedia: async () => {
      return {
        getTracks: () => [{
          stop: () => {}
        }]
      } as MediaStream;
    }
  } as any;
}

export { MockAudioContext, MockAnalyserNode, MockMediaStreamSource }; 