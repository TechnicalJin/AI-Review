import requests
import sys

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
            return True
        else:
            print("❌ Health check failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Could not connect to service:", e)
        return False

def test_transcription(audio_file_path):
    """Test transcription with actual audio file"""
    print(f"\nTesting transcription with: {audio_file_path}")
    try:
        with open(audio_file_path, 'rb') as f:
            files = {'audio': f}
            response = requests.post('http://localhost:5000/transcribe', files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Transcription successful!")
            print(f"Text: {result['text']}")
            print(f"Language: {result['language']} ({result['language_probability']*100:.1f}%)")
            print(f"Duration: {result['duration']}s")
            return True
        else:
            print("❌ Transcription failed:", response.json())
            return False
    except Exception as e:
        print("❌ Error during transcription:", e)
        return False

if __name__ == '__main__':
    print("🧪 Whisper Service Test Suite\n")
    
    # Test 1: Health
    if not test_health():
        print("\n⚠️  Service is not running. Start it with: ./run.sh")
        sys.exit(1)
    
    # Test 2: Transcription (if audio file provided)
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        test_transcription(audio_file)
    else:
        print("\n💡 To test transcription, run:")
        print("   python test_whisper.py <path-to-audio-file.webm>")
    
    print("\n✅ All tests completed!")